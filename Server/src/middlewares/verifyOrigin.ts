import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../app/config";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

const originOf = (value?: string) => {
  if (!value) return undefined;
  try {
    return new URL(value).origin;
  } catch {
    return "invalid";
  }
};

/**
 * CSRF defence in depth for cookie-authenticated admin requests.
 *
 * The session cookie is already `SameSite=Strict`, so browsers will not attach
 * it to cross-site requests. As a second layer, state-changing requests that
 * carry an Origin (or Referer) header must come from one of the configured
 * client origins. Requests without either header are not from a browser page
 * and cannot ride on a visitor's cookies, so they are allowed through to the
 * normal authentication check.
 */
const verifyOrigin = (req: Request, res: Response, next: NextFunction) => {
  if (SAFE_METHODS.includes(req.method)) return next();

  const origin = originOf(req.headers.origin) || originOf(req.headers.referer);
  if (!origin) return next();

  if (config.client_origins.includes(origin)) return next();

  return res.status(httpStatus.FORBIDDEN).json({
    success: false,
    message: "Request origin is not allowed",
    errorSources: [],
  });
};

export default verifyOrigin;
