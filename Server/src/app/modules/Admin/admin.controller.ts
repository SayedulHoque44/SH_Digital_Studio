import httpStatus from "http-status";
import config from "../../config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AdminServices } from "./admin.service";
import { clearSessionCookieOptions, sessionCookieOptions } from "./admin.utils";

const login = catchAsync(async (req, res) => {
  const { token, admin } = await AdminServices.login(req.body);

  // The token only ever travels in the HttpOnly cookie, never in the body.
  res.cookie(config.session_cookie_name, token, sessionCookieOptions());
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signed in successfully",
    data: admin,
  });
});

const logout = catchAsync(async (req, res) => {
  res.clearCookie(config.session_cookie_name, clearSessionCookieOptions());
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signed out",
    data: null,
  });
});

const logoutEverywhere = catchAsync(async (req, res) => {
  await AdminServices.logoutEverywhere(req.admin!.id);
  res.clearCookie(config.session_cookie_name, clearSessionCookieOptions());
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signed out of all sessions",
    data: null,
  });
});

const getMe = catchAsync(async (req, res) => {
  const admin = await AdminServices.getMe(req.admin!.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Account retrieved",
    data: admin,
  });
});

const updateMe = catchAsync(async (req, res) => {
  const admin = await AdminServices.updateMe(req.admin!.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Account updated",
    data: admin,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { token, admin } = await AdminServices.changePassword(
    req.admin!.id,
    req.body,
  );
  res.cookie(config.session_cookie_name, token, sessionCookieOptions());
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password updated. Other sessions have been signed out.",
    data: admin,
  });
});

export const AdminControllers = {
  login,
  logout,
  logoutEverywhere,
  getMe,
  updateMe,
  changePassword,
};
