import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProfileServices } from "./profile.service";

const getProfile = catchAsync(async (req, res) => {
  const profile = await ProfileServices.getProfileFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved",
    data: profile,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const profile = await ProfileServices.updateProfileIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile saved",
    data: profile,
  });
});

export const ProfileControllers = { getProfile, updateProfile };
