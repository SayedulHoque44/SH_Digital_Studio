import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { getRequestContext, hashIp } from "../../utils/requestContext";
import sendResponse from "../../utils/sendResponse";
import { SiteSettingsServices } from "../SiteSettings/siteSettings.service";
import { InquiryServices } from "./inquiry.service";

const createInquiry = catchAsync(async (req, res) => {
  const { clientIp } = getRequestContext(req);
  await InquiryServices.createInquiryIntoDB(req.body, { ipHash: hashIp(clientIp) });
  const settings = await SiteSettingsServices.getSettingsDoc();

  // The response confirms the inquiry was received (stored). It never claims
  // an e-mail was sent - that is recorded privately for the admin.
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message:
      settings?.inquiry?.successMessage ||
      "Thank you — your inquiry has been received.",
    data: null,
  });
});

const getInquiries = catchAsync(async (req, res) => {
  const inquiries = await InquiryServices.getInquiriesFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Inquiries retrieved",
    data: inquiries,
  });
});

const getSingleInquiry = catchAsync(async (req, res) => {
  const inquiry = await InquiryServices.getSingleInquiryFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Inquiry retrieved",
    data: inquiry,
  });
});

const updateInquiry = catchAsync(async (req, res) => {
  const inquiry = await InquiryServices.updateInquiryIntoDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Inquiry updated",
    data: inquiry,
  });
});

const deleteInquiry = catchAsync(async (req, res) => {
  await InquiryServices.deleteInquiryFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Inquiry deleted",
    data: null,
  });
});

export const InquiryControllers = {
  createInquiry,
  getInquiries,
  getSingleInquiry,
  updateInquiry,
  deleteInquiry,
};
