import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../app/config";
import AppError from "../app/error/AppError";
import "../app/interface/express";
import { TAdminRole } from "../app/modules/Admin/admin.interface";
import { AdminUserModel } from "../app/modules/Admin/admin.model";
import catchAsync from "../app/utils/catchAsync";

/**
 * Server-side admin authentication.
 *
 * Reads the HttpOnly session cookie, verifies the JWT, then loads the admin
 * from the database on every request so that disabling an account, changing
 * the password or "signing out everywhere" (tokenVersion) takes effect
 * immediately instead of when the token expires.
 *
 * Usage: router.use(auth()) or auth("owner") to restrict by role.
 */
const auth = (...requiredRoles: TAdminRole[]) => {
  return catchAsync(async (req, res, next) => {
    const token = req.cookies?.[config.session_cookie_name];

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Please sign in to continue");
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt_access_secret as string) as JwtPayload;
    } catch {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Your session has expired. Please sign in again",
      );
    }

    const admin = await AdminUserModel.findById(decoded.sub);
    if (!admin || !admin.isActive || admin.tokenVersion !== decoded.tv) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Your session is no longer valid. Please sign in again",
      );
    }

    if (requiredRoles.length && !requiredRoles.includes(admin.role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You do not have permission to perform this action",
      );
    }

    req.admin = {
      id: String(admin._id),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
    next();
  });
};

export default auth;
