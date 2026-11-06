import { Types } from "mongoose";
import { TFeatureItem } from "../shared/shared.interface";

export type TLink = { _id?: Types.ObjectId; label: string; href: string };
export type TNavItem = TLink & { visible: boolean };
export type TSocialLink = {
  _id?: Types.ObjectId;
  platform: string;
  url: string;
  label?: string;
};

export type TSiteSettings = {
  key: "main";
  brand: {
    name: string;
    tagline?: string;
    description?: string;
    // Optional custom logo files; the built-in SVG logo is used when empty
    logoUrl?: string;
    logoDarkUrl?: string;
  };
  theme: {
    accent: string; // hex colour used for highlights
  };
  announcement: {
    enabled: boolean;
    text?: string;
    linkLabel?: string;
    linkHref?: string;
  };
  home: {
    heroEyebrow?: string;
    heroHeadline: string;
    heroHighlight?: string; // part of the headline rendered in the accent style
    heroSubtext?: string;
    primaryCta: TLink;
    secondaryCta: TLink;
    sections: {
      selectedWork: boolean;
      services: boolean;
      industries: boolean;
      process: boolean;
      capabilities: boolean;
      about: boolean;
      finalCta: boolean;
    };
    selectedWork: { heading?: string; intro?: string; projects: Types.ObjectId[] };
    services: { heading?: string; intro?: string; items: Types.ObjectId[] };
    industries: { heading?: string; intro?: string; items: Types.ObjectId[] };
    process: { heading?: string; intro?: string; steps: TFeatureItem[] };
    capabilities: {
      heading?: string;
      intro?: string;
      items: TFeatureItem[];
      technologies: string[];
    };
    about: { heading?: string; text?: string; ctaLabel?: string };
    finalCta: {
      heading?: string;
      text?: string;
      buttonLabel?: string;
      buttonHref?: string;
    };
  };
  navigation: { header: TNavItem[] };
  footer: { blurb?: string; showServices: boolean; showIndustries: boolean };
  contact: {
    email?: string;
    phone?: string;
    whatsappNumber?: string;
    // Supports {project}, {industry} and {page} placeholders
    whatsappMessage?: string;
    location?: string;
    responseTime?: string;
  };
  socialLinks: TSocialLink[];
  seo: {
    titleTemplate?: string;
    defaultTitle?: string;
    defaultDescription?: string;
    defaultOgImage?: string;
    twitterHandle?: string;
    keywords: string[];
    googleSiteVerification?: string;
  };
  legal: {
    privacyPolicy?: string; // markdown
    terms?: string; // markdown
    updatedAt?: Date;
  };
  inquiry: {
    budgetRanges: string[];
    successMessage?: string;
    notificationEmail?: string;
  };
};
