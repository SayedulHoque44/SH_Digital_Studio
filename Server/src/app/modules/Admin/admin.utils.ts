import { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import config from "../../config";
import { TAdminUser } from "./admin.interface";

// "8h" / "30m" / "7d" / "3600" (seconds) -> milliseconds
export const durationToMs = (value: string) => {
  const match = String(value).trim().match(/^(\d+)\s*([smhd]?)$/i);
  if (!match) return 8 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = (match[2] || "s").toLowerCase();
  const multiplier = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[
    unit as "s" | "m" | "h" | "d"
  ];
  return amount * multiplier;
};

export const sessionMaxAgeMs = () =>
  durationToMs(config.admin_session_expires_in);

export const signSessionToken = (admin: TAdminUser) => {
  if (!config.jwt_access_secret) {
    throw new Error("JWT secret is not configured");
  }
  return jwt.sign(
    { sub: String(admin._id), role: admin.role, tv: admin.tokenVersion },
    config.jwt_access_secret,
    { expiresIn: Math.floor(sessionMaxAgeMs() / 1000) },
  );
};

/**
 * Session cookie flags:
 * - httpOnly: unreadable from JavaScript, so an XSS bug cannot steal it.
 * - sameSite strict: never sent on cross-site requests (CSRF protection).
 * - secure: HTTPS only in production.
 * - path "/": the Next.js server also needs it for draft previews.
 */
export const sessionCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: config.cookie_secure,
  sameSite: "strict",
  path: "/",
  maxAge: sessionMaxAgeMs(),
});

export const clearSessionCookieOptions = (): CookieOptions => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { maxAge, ...rest } = sessionCookieOptions();
  return rest;
};

export const toAuthAdmin = (admin: TAdminUser) => ({
  id: String(admin._id),
  name: admin.name,
  email: admin.email,
  role: admin.role,
  lastLoginAt: admin.lastLoginAt,
});
