import { NextFunction, Request, Response } from "express";
import sendResponse from "../../app/utils/sendResponse";
import httpStatus from "http-status";
import { RateLimitModel } from "../../app/modules/RateLimiter/RateLimit.model";
import { getRequestContext } from "../../app/utils/requestContext";

/**
 * Middleware generator for different rate limit types.
 *
 * Counters live in MongoDB (not process memory), so limits hold across
 * serverless instances.
 */
interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  type: "global" | "auth" | "api" | "inquiry";
  message?: string;
}
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: Date;
  timeLeft: string;
}

function createRateLimiter({
  windowMs,
  maxRequests,
  type,
  message,
}: RateLimiterOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { trustedServer, clientIp } = getRequestContext(req);

    // Server-side renders from the Next.js app are authenticated with the
    // internal key and must not be throttled as a single "IP".
    if (trustedServer) return next();

    const identifier = `${type}:${clientIp}`;

    const { allowed, remaining, reset, timeLeft }: RateLimitResult =
      await CheckRateLimit(identifier, windowMs, maxRequests);

    // Set rate limit headers
    res.set({
      "X-RateLimit-Limit": maxRequests.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": Math.floor(reset.getTime() / 1000).toString(),
    });

    if (!allowed) {
      res.set(
        "Retry-After",
        Math.max(1, Math.ceil((reset.getTime() - Date.now()) / 1000)).toString(),
      );
      return sendResponse(res, {
        statusCode: httpStatus.TOO_MANY_REQUESTS,
        success: false,
        message:
          message || `Too many requests! Limit exceeded. Try again in ${timeLeft}`,
        data: null,
      });
    }

    next();
  };
}

const CheckRateLimit = async (
  identifier: string,
  windowMs: number,
  maxRequests: number,
): Promise<RateLimitResult> => {
  const now: Date = new Date();
  const windowStart: Date = new Date(now.getTime() - windowMs);

  try {
    // Single atomic upsert to avoid duplicate-key races under concurrency.
    // Pipeline keeps logic server-side; avoids $setOnInsert (not allowed in pipeline updates).
    const result: any = await RateLimitModel.findOneAndUpdate(
      { key: identifier },
      [
        // Initialize missing fields when inserting (or if somehow null).
        {
          $set: {
            firstRequest: { $ifNull: ["$firstRequest", now] },
            count: { $ifNull: ["$count", 0] },
          },
        },
        // Determine if the window is expired.
        {
          $set: {
            expired: { $lt: ["$firstRequest", windowStart] },
          },
        },
        // Reset window if expired, otherwise increment.
        {
          $set: {
            count: {
              $cond: [{ $eq: ["$expired", true] }, 1, { $add: ["$count", 1] }],
            },
            firstRequest: {
              $cond: [{ $eq: ["$expired", true] }, now, "$firstRequest"],
            },
            lastRequest: now,
          },
        },
        { $unset: "expired" },
      ],
      {
        new: true,
        upsert: true,
        projection: { count: 1, firstRequest: 1 },
      },
    );
    if (!result) {
      throw new Error("Rate limit record not found or created");
    }

    // Calculate remaining requests and reset time
    const remaining = Math.max(0, maxRequests - result.count);
    const resetTimestamp = result.firstRequest.getTime() + windowMs;
    const resetTime = new Date(resetTimestamp);
    const secondsLeft = Math.ceil((resetTimestamp - now.getTime()) / 1000);

    // Format the time left in human-readable way
    let timeLeftFormatted = "";
    if (secondsLeft <= 60) {
      timeLeftFormatted = `${secondsLeft} sec`;
    } else {
      const minutes = Math.floor(secondsLeft / 60);
      const seconds = secondsLeft % 60;

      if (minutes < 60) {
        timeLeftFormatted = `${minutes} min${
          seconds > 0 ? ` ${seconds} sec` : ""
        }`;
      } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        timeLeftFormatted = `${hours} hour${hours > 1 ? "s" : ""}`;
        if (remainingMinutes > 0) {
          timeLeftFormatted += ` ${remainingMinutes} min`;
        }
        if (seconds > 0 && remainingMinutes === 0) {
          timeLeftFormatted += ` ${seconds} sec`;
        }
      }
    }

    return {
      // count includes the current request, so the limit itself is allowed
      allowed: result.count <= maxRequests,
      remaining: remaining,
      reset: resetTime,
      timeLeft: timeLeftFormatted, // Added human-readable time left
    };
  } catch (err) {
    console.error("Rate limit check error:", err);
    // Fail open - allow request if rate limiter fails
    return { allowed: true, remaining: maxRequests, reset: now, timeLeft: "" };
  }
};

// Rate limit configurations
type RateLimiterType = "global" | "auth" | "api" | "inquiry";

export const ConfigLimiter: Record<
  RateLimiterType,
  ReturnType<typeof createRateLimiter>
> = {
  global: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    type: "global",
  }),
  // Login attempts per IP. Accounts are additionally locked after repeated
  // failures (see AdminServices.login), so this is not the only safeguard.
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    type: "auth",
    message: "Too many sign-in attempts. Please wait a few minutes and try again.",
  }),
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 500,
    type: "api",
  }),
  inquiry: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    type: "inquiry",
    message:
      "You have sent several inquiries in a short time. Please try again later or contact us directly.",
  }),
};

export default createRateLimiter;
