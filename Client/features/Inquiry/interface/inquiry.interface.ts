export const INQUIRY_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal-sent",
  "won",
  "lost",
  "archived",
] as const;
export type TInquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_STATUS_LABELS: Record<TInquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  "proposal-sent": "Proposal sent",
  won: "Won",
  lost: "Lost",
  archived: "Archived",
};

export const PREFERRED_CONTACT = ["email", "whatsapp", "phone", "video-call"] as const;
export type TPreferredContact = (typeof PREFERRED_CONTACT)[number];

export const PREFERRED_CONTACT_LABELS: Record<TPreferredContact, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  phone: "Phone call",
  "video-call": "Video call",
};

// Public form payload (POST /api/public/inquiries)
export interface IInquiryPayload {
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
  consent: true;
  sourcePath?: string;
  homepage?: string; // honeypot
  fillMs?: number; // time spent on the form (spam check)
}

// Admin view
export interface IInquiry extends Omit<IInquiryPayload, "consent" | "homepage" | "fillMs"> {
  _id: string;
  status: TInquiryStatus;
  adminNotes?: string;
  consent: boolean;
  consentAt: string;
  notification?: { attempted: boolean; sent: boolean; error?: string };
  createdAt: string;
  updatedAt: string;
}

export interface IInquiryListResponse {
  success: boolean;
  message: string;
  data: {
    meta: { page: number; limit: number; total: number; totalPage: number };
    result: IInquiry[];
    statusCounts: Partial<Record<TInquiryStatus, number>>;
  };
}

export interface IInquiryQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: TInquiryStatus;
  industry?: string;
  gte?: string;
  lte?: string;
  sort?: string;
}
