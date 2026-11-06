import { INQUIRY_STATUSES, PREFERRED_CONTACT_METHODS } from "./inquiry.constant";

export type TInquiryStatus = (typeof INQUIRY_STATUSES)[number];
export type TPreferredContact = (typeof PREFERRED_CONTACT_METHODS)[number];

export type TInquiry = {
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  country?: string;
  website?: string;
  industry?: string;
  service?: string;
  projectSlug?: string;
  projectTitle?: string;
  message: string;
  budgetRange?: string;
  desiredLaunch?: string;
  preferredContact: TPreferredContact;
  consent: boolean;
  consentAt: Date;
  sourcePath?: string;
  status: TInquiryStatus;
  // Private to the admin - never returned by public endpoints
  adminNotes?: string;
  // Salted hash, not the raw IP (abuse tracking only)
  ipHash?: string;
  // Records honestly whether a notification e-mail was actually sent
  notification: {
    attempted: boolean;
    sent: boolean;
    error?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
};

export type TInquiryPayload = Omit<
  TInquiry,
  "status" | "adminNotes" | "ipHash" | "notification" | "consentAt"
> & {
  // spam controls (never stored)
  homepage?: string;
  fillMs?: number;
};
