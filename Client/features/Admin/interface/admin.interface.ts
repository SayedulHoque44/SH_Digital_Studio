/*
 * Admin-side document shapes (mirror the Mongoose models in Server/src).
 * Optional fields reflect that almost everything is optional in the CMS.
 */
import type { TProjectStatus, TProjectType } from "@/features/Public/interface/public.interface";

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface IPaginatedResponse<T> {
  meta: { page: number; limit: number; total: number; totalPage: number };
  result: T[];
}

export interface IMediaRef {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  assetId?: string;
}

export interface ISeoFields {
  title?: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface ICtaFields {
  heading?: string;
  text?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export interface IFeatureItemFields {
  _id?: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface IFaqFields {
  _id?: string;
  question: string;
  answer: string;
}

export interface IContentBlockFields {
  _id?: string;
  type: string;
  data: Record<string, any>;
}

export type TPublishStatus = "draft" | "published" | "archived";

export interface IAdminProject {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  overview?: string;
  projectType: TProjectType;
  categories: string[] | { _id: string; name: string; slug: string }[];
  subcategory?: string;
  tags: string[];
  brandName?: string;
  projectStatus: TProjectStatus;
  isClientWork: boolean;
  clientName?: string;
  publishStatus: TPublishStatus;
  visibility: "listed" | "unlisted";
  featured: boolean;
  featuredOrder: number;
  sortOrder: number;
  publishedAt?: string;
  media: {
    coverImage?: IMediaRef | null;
    logo?: IMediaRef | null;
    browserMockup?: IMediaRef | null;
    fullPageScreenshot?: IMediaRef | null;
    desktopScreenshots: IMediaRef[];
    tabletScreenshots: IMediaRef[];
    mobileScreenshots: IMediaRef[];
    gallery: IMediaRef[];
  };
  video?: { url: string; title?: string; posterUrl?: string; captionsUrl?: string; transcript?: string } | null;
  links: {
    liveUrl?: string;
    liveUrlLabel?: string;
    secondaryUrl?: string;
    secondaryUrlLabel?: string;
    sourceUrl?: string;
    showSourceUrl?: boolean;
    appStoreUrl?: string;
    playStoreUrl?: string;
  };
  platforms: string[];
  techStack: string[];
  corePages: string[];
  designHighlights: string[];
  features: IFeatureItemFields[];
  modules: IFeatureItemFields[];
  workflows: IFeatureItemFields[];
  caseStudy: Record<string, string | undefined>;
  contentBlocks: IContentBlockFields[];
  demoAccess: {
    enabled: boolean;
    username?: string;
    password?: string;
    loginUrl?: string;
    instructions?: string;
    limitations?: string;
  };
  relatedProjects: string[];
  cta?: ICtaFields;
  seo?: ISeoFields;
  internalNotes?: string;
  previousSlugs?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IAdminCategory {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  introduction?: string;
  emailIntro?: string;
  highlights: string[];
  parent?: string | { _id: string; name: string; slug: string } | null;
  icon?: string;
  coverImage?: IMediaRef | null;
  featuredImage?: IMediaRef | null;
  contentBlocks: IContentBlockFields[];
  featuredProjects: string[];
  relatedServices: string[];
  faqs: IFaqFields[];
  cta?: ICtaFields;
  seo?: ISeoFields;
  showOnHome: boolean;
  sortOrder: number;
  status: "draft" | "published";
  projectCount?: number;
  publishedProjectCount?: number;
  updatedAt?: string;
}

export interface IAdminService {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  icon?: string;
  image?: IMediaRef | null;
  benefits: string[];
  features: IFeatureItemFields[];
  deliverables: string[];
  industries: string[];
  relatedProjects: string[];
  projectTypes: TProjectType[];
  startingPrice?: string;
  priceNote?: string;
  timeline?: string;
  faqs: IFaqFields[];
  cta?: ICtaFields;
  seo?: ISeoFields;
  sortOrder: number;
  status: "draft" | "published";
  updatedAt?: string;
}

export interface IMediaAsset {
  _id: string;
  kind: "image" | "video";
  provider: "external" | "upload" | "youtube" | "vimeo" | "static";
  url: string;
  title?: string;
  alt?: string;
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  sizeBytes?: number;
  posterUrl?: string;
  storageKey?: string;
  tags: string[];
  createdAt: string;
}

export interface IMediaConfig {
  uploadsEnabled: boolean;
  maxImageBytes: number;
  maxVideoBytes: number;
  allowedImageTypes: string[];
  allowedVideoTypes: string[];
}

export interface IOption {
  _id: string;
  title?: string;
  name?: string;
  slug: string;
  status?: string;
  publishStatus?: string;
  visibility?: string;
  projectType?: TProjectType;
  parent?: string | null;
  media?: { coverImage?: IMediaRef };
}

export interface IDashboardData {
  projects: { published: number; draft: number; archived: number; websites: number; applications: number };
  categories: { total: number; published: number };
  services: { total: number; published: number };
  inquiries: { total: number; new: number };
  recentInquiries: {
    _id: string;
    name: string;
    businessName?: string;
    email: string;
    industry?: string;
    projectTitle?: string;
    status: string;
    createdAt: string;
  }[];
  recentChanges: { type: string; id: string; title: string; status: string; updatedAt: string; href: string }[];
  integrations: { emailNotifications: boolean; mediaUploads: boolean };
  checklist: { key: string; label: string; done: boolean; href: string }[];
  renewals: { overdue: number; dueSoon: number; items: IRenewalAlert[] };
}

export interface IAdminUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "editor";
  lastLoginAt?: string;
}

// ----------------------------- Client projects (private tracker) -----------------------------
export type TClientProjectStatus = "active" | "on-hold" | "ended";
export type TClientLinkKind = "live" | "admin" | "staging" | "repository" | "design" | "docs" | "other";
export type TRenewalKind = "domain" | "hosting" | "maintenance" | "server" | "database" | "email" | "ssl" | "subscription" | "other";
export type TRenewalDirection = "receivable" | "payable";
export type TBillingCycle = "monthly" | "quarterly" | "half-yearly" | "yearly" | "one-time";
export type TCurrency = "USD" | "BDT" | "EUR" | "GBP" | "SAR" | "AED" | "INR";

export interface IRenewalPayment {
  _id?: string;
  paidOn: string;
  amount?: number | null;
  currency?: TCurrency;
  exchangeRate?: number | null;
  periodFrom?: string | null;
  periodTo?: string | null;
  note?: string;
}

export interface IRenewal {
  _id?: string;
  title: string;
  kind: TRenewalKind;
  direction: TRenewalDirection;
  provider?: string;
  amount?: number | null;
  currency: TCurrency;
  exchangeRate?: number | null;
  cycle: TBillingCycle;
  paidFrom?: string | null;
  paidUntil?: string | null;
  remindDaysBefore: number;
  autoRenew?: boolean;
  active: boolean;
  notes?: string;
  payments: IRenewalPayment[];
}

export type TLedgerIncomeKind = "salary" | "fund";
export type TLedgerCostCategory = "hosting" | "server" | "database" | "storage" | "api" | "domain" | "staff" | "software" | "other";

export interface ILedgerMonth {
  _id?: string;
  month: string; // "2026-10"
  exchangeRate?: number | null;
  carriedOver?: number | null;
  income: { _id?: string; kind: TLedgerIncomeKind; label?: string; amount: number; currency: TCurrency }[];
  costs: { _id?: string; label: string; category: TLedgerCostCategory; amount: number; currency: TCurrency; usage?: string; note?: string }[];
  notes?: string;
}

export interface IClientProject {
  _id: string;
  name: string;
  status: TClientProjectStatus;
  pinned?: boolean;
  muteAlerts?: boolean;
  summary?: string;
  tags?: string[];
  startDate?: string | null;
  handoverDate?: string | null;
  techLead?: string;
  client: { name: string; relation?: string; company?: string; email?: string; phone?: string; whatsapp?: string; country?: string };
  links: { _id?: string; kind: TClientLinkKind; label?: string; url: string }[];
  accounts: { _id?: string; provider: string; icon?: string; purpose?: string; login?: string; projectName?: string; dashboardUrl?: string; notes?: string }[];
  renewals: IRenewal[];
  checklist: { _id?: string; text: string; done: boolean }[];
  ledger: ILedgerMonth[];
  // Only on single-project responses (never in the list); values decrypted by the API
  envSets?: { _id?: string; label: string; note?: string; content: string }[];
  envLocked?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRenewalAlert {
  projectId: string;
  projectName: string;
  clientName: string;
  renewalId: string;
  title: string;
  kind: TRenewalKind;
  direction: TRenewalDirection;
  amount?: number;
  currency: TCurrency;
  exchangeRate?: number;
  cycle: TBillingCycle;
  paidUntil: string;
  daysLeft: number;
  state: "overdue" | "due-soon";
}

export interface IPaymentPayload {
  paidOn: string;
  cycles: number;
  periodTo?: string;
  amount?: number | null;
  currency?: TCurrency;
  exchangeRate?: number | null;
  note?: string;
}
