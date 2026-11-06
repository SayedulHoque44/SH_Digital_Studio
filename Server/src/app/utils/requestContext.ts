import { Buffer } from "buffer";
import crypto from "crypto";
import { Request } from "express";
import config from "../config";

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

/**
 * Describes who is calling the API.
 *
 * Trust model:
 * - The Next.js server sends `x-internal-key` (shared secret, never exposed to
 *   browsers). Server-side page renders send only the key and are treated as a
 *   trusted server (not rate limited per IP, because every render would
 *   otherwise share the hosting provider's IP).
 * - Browser requests proxied by the Next.js `/api/*` route also send the key
 *   plus `x-client-ip`, the visitor's real IP, so limits still apply per
 *   visitor.
 * - Anything else falls back to Express' `req.ip` (honours TRUST_PROXY).
 */
export const getRequestContext = (req: Request) => {
  const key = req.headers["x-internal-key"];
  const hasValidKey =
    !!config.internal_api_key &&
    typeof key === "string" &&
    safeEqual(key, config.internal_api_key);

  const forwardedClientIp = req.headers["x-client-ip"];
  if (hasValidKey && typeof forwardedClientIp === "string" && forwardedClientIp) {
    return {
      trustedServer: false,
      clientIp: forwardedClientIp.split(",")[0].trim().slice(0, 64),
    };
  }

  return {
    trustedServer: hasValidKey,
    clientIp: (req.ip || req.socket?.remoteAddress || "unknown").slice(0, 64),
  };
};

// Privacy-friendly identifier for abuse tracking: stores a salted hash, never
// the raw IP address.
export const hashIp = (ip: string) =>
  crypto
    .createHash("sha256")
    .update(`${config.jwt_access_secret || "shds"}:${ip}`)
    .digest("hex")
    .slice(0, 32);
