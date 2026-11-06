import httpStatus from "http-status";
import { isMailConfigured } from "../../utils/mailer";
import { isS3Configured } from "../../utils/s3";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SiteSettingsServices } from "./siteSettings.service";

const getSettings = catchAsync(async (req, res) => {
  const settings = await SiteSettingsServices.getSettingsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Settings retrieved",
    data: settings,
  });
});

const updateSettings = catchAsync(async (req, res) => {
  const settings = await SiteSettingsServices.updateSettingsIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Settings saved",
    data: settings,
  });
});

// Which optional integrations are configured on the server. Only booleans
// are returned - never the values of environment variables.
const getIntegrations = catchAsync(async (req, res) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Integration status retrieved",
    data: {
      emailNotifications: isMailConfigured(),
      mediaUploads: isS3Configured(),
    },
  });
});

export const SiteSettingsControllers = { getSettings, updateSettings, getIntegrations };
