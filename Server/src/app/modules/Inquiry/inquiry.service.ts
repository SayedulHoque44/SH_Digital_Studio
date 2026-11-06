import httpStatus from "http-status";
import QueryBuilder from "../../../builder/QueryBuilder";
import config from "../../config";
import AppError from "../../error/AppError";
import { sendMail } from "../../utils/mailer";
import { utils } from "../../utils/utils";
import { SiteSettingsServices } from "../SiteSettings/siteSettings.service";
import {
  InquirySearchFields,
  InquirySortOptions,
  MAX_INQUIRIES_PER_EMAIL_PER_DAY,
  MIN_FORM_FILL_MS,
} from "./inquiry.constant";
import { TInquiry, TInquiryPayload } from "./inquiry.interface";
import { InquiryModel } from "./inquiry.model";

type TCreateResult = { stored: boolean; notificationSent: boolean };

const buildNotificationText = (inquiry: TInquiry & { _id: unknown }) =>
  [
    `New project inquiry from ${inquiry.name}`,
    "",
    `Email: ${inquiry.email}`,
    inquiry.phone ? `Phone: ${inquiry.phone}` : "",
    inquiry.businessName ? `Business: ${inquiry.businessName}` : "",
    inquiry.country ? `Country: ${inquiry.country}` : "",
    inquiry.website ? `Website: ${inquiry.website}` : "",
    inquiry.industry ? `Industry: ${inquiry.industry}` : "",
    inquiry.service ? `Service: ${inquiry.service}` : "",
    inquiry.projectTitle ? `Interested in: ${inquiry.projectTitle}` : "",
    inquiry.budgetRange ? `Budget: ${inquiry.budgetRange}` : "",
    inquiry.desiredLaunch ? `Desired launch: ${inquiry.desiredLaunch}` : "",
    `Preferred contact: ${inquiry.preferredContact}`,
    "",
    "Project description:",
    inquiry.message,
    "",
    "Manage this inquiry in the admin dashboard → Inquiries.",
  ]
    .filter(line => line !== "")
    .join("\n");

/**
 * Stores a public inquiry.
 *
 * Spam handling is layered: per-IP rate limit (route), honeypot field,
 * minimum time-to-fill and a per-email daily cap. Suspected bots receive a
 * normal-looking success response but nothing is stored, so they learn
 * nothing from the response.
 */
const createInquiryIntoDB = async (
  payload: TInquiryPayload,
  meta: { ipHash: string },
): Promise<TCreateResult> => {
  const { homepage, fillMs, ...data } = payload;

  // fillMs is measured in the visitor's browser, so neither server latency
  // nor a wrong device clock can turn a real person into a false positive
  const filledTooFast = typeof fillMs === "number" && fillMs < MIN_FORM_FILL_MS;
  if (homepage || filledTooFast) {
    return { stored: false, notificationSent: false };
  }

  const recentFromEmail = await InquiryModel.countDocuments({
    email: data.email,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  if (recentFromEmail >= MAX_INQUIRIES_PER_EMAIL_PER_DAY) {
    throw new AppError(
      httpStatus.TOO_MANY_REQUESTS,
      "We've already received your recent inquiries and will be in touch soon.",
    );
  }

  const inquiry = await InquiryModel.create({
    ...data,
    consentAt: new Date(),
    status: "new",
    ipHash: meta.ipHash,
  });

  // Notification is best-effort: the inquiry is already safely stored.
  const settings = await SiteSettingsServices.getSettingsDoc();
  const recipient = settings?.inquiry?.notificationEmail || config.inquiry_notify_email;
  let notification: { attempted: boolean; sent: boolean; error?: string } = {
    attempted: false,
    sent: false,
    error: recipient ? undefined : "No notification recipient configured",
  };
  if (recipient) {
    notification = await sendMail({
      to: recipient,
      subject: `New inquiry: ${inquiry.name}${inquiry.businessName ? ` (${inquiry.businessName})` : ""}`,
      text: buildNotificationText(inquiry.toObject()),
      replyTo: inquiry.email,
    });
  }
  await InquiryModel.updateOne({ _id: inquiry._id }, { notification });

  return { stored: true, notificationSent: notification.sent };
};

const getInquiriesFromDB = async (query: Record<string, unknown>) => {
  const inquiriesQuery = new QueryBuilder(
    InquiryModel.find().select("-ipHash"),
    query,
  )
    .search(InquirySearchFields)
    .filter(["status", "industry"])
    .where(utils.dateFillterGteLte(query, "createdAt"))
    .sort(InquirySortOptions, "-createdAt")
    .paginate();

  const result = await inquiriesQuery.modelQuery.lean();
  const meta = await inquiriesQuery.countTotal();

  const statusCounts = await InquiryModel.aggregate<{ _id: string; count: number }>([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  return {
    meta,
    result,
    statusCounts: Object.fromEntries(statusCounts.map(item => [item._id, item.count])),
  };
};

const getSingleInquiryFromDB = async (id: string) => {
  const inquiry = await InquiryModel.findById(id).select("-ipHash").lean();
  if (!inquiry) {
    throw new AppError(httpStatus.NOT_FOUND, "Inquiry not found");
  }
  return inquiry;
};

const updateInquiryIntoDB = async (
  id: string,
  payload: Pick<TInquiry, "status" | "adminNotes">,
) => {
  const inquiry = await InquiryModel.findByIdAndUpdate(id, { $set: payload }, {
    new: true,
    runValidators: true,
  })
    .select("-ipHash")
    .lean();
  if (!inquiry) {
    throw new AppError(httpStatus.NOT_FOUND, "Inquiry not found");
  }
  return inquiry;
};

const deleteInquiryFromDB = async (id: string) => {
  const inquiry = await InquiryModel.findByIdAndDelete(id);
  if (!inquiry) {
    throw new AppError(httpStatus.NOT_FOUND, "Inquiry not found");
  }
  return inquiry;
};

export const InquiryServices = {
  createInquiryIntoDB,
  getInquiriesFromDB,
  getSingleInquiryFromDB,
  updateInquiryIntoDB,
  deleteInquiryFromDB,
};
