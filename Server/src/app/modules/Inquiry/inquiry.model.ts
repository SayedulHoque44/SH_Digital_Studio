import { Schema, model } from "mongoose";
import { INQUIRY_STATUSES, PREFERRED_CONTACT_METHODS } from "./inquiry.constant";
import { TInquiry } from "./inquiry.interface";

const inquirySchema = new Schema<TInquiry>(
  {
    name: { type: String, required: true, trim: true },
    businessName: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: String,
    country: String,
    website: String,
    industry: String,
    service: String,
    projectSlug: String,
    projectTitle: String,
    message: { type: String, required: true },
    budgetRange: String,
    desiredLaunch: String,
    preferredContact: { type: String, enum: PREFERRED_CONTACT_METHODS, default: "email" },
    consent: { type: Boolean, required: true },
    consentAt: { type: Date, required: true },
    sourcePath: String,
    status: { type: String, enum: INQUIRY_STATUSES, default: "new" },
    adminNotes: String,
    ipHash: String,
    notification: {
      attempted: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      error: String,
    },
  },
  { timestamps: true },
);

inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ email: 1, createdAt: -1 });
inquirySchema.index({ createdAt: -1 });

export const InquiryModel = model<TInquiry>("Inquiry", inquirySchema);
