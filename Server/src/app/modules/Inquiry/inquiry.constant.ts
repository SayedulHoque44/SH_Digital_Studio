export const INQUIRY_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal-sent",
  "won",
  "lost",
  "archived",
] as const;

export const PREFERRED_CONTACT_METHODS = ["email", "whatsapp", "phone", "video-call"] as const;

export const InquirySearchFields = ["name", "businessName", "email", "message", "country"];

export const InquirySortOptions: Record<string, string> = {
  newest: "-createdAt",
  oldest: "createdAt",
  status: "status -createdAt",
};

// Anti-spam thresholds
export const MIN_FORM_FILL_MS = 2500; // humans need more than 2.5s to fill the form
export const MAX_INQUIRIES_PER_EMAIL_PER_DAY = 3;
export const MAX_LINKS_IN_MESSAGE = 5;
