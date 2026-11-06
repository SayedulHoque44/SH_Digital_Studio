import { Schema, model } from "mongoose";
import { featureItemSchema } from "../shared/shared.model";
import { TNavItem, TLink, TSiteSettings, TSocialLink } from "./siteSettings.interface";

const linkSchema = new Schema<TLink>(
  { label: { type: String, required: true }, href: { type: String, required: true } },
  { _id: false },
);
const navItemSchema = new Schema<TNavItem>({
  label: { type: String, required: true },
  href: { type: String, required: true },
  visible: { type: Boolean, default: true },
});
const socialLinkSchema = new Schema<TSocialLink>({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  label: String,
});

const ref = (name: string) => [{ type: Schema.Types.ObjectId, ref: name }];

// Singleton document (key: "main") holding global, structured site content.
const siteSettingsSchema = new Schema<TSiteSettings>(
  {
    key: { type: String, default: "main", unique: true },
    brand: {
      name: { type: String, required: true },
      tagline: String,
      description: String,
      logoUrl: String,
      logoDarkUrl: String,
    },
    theme: { accent: { type: String, default: "#C8F25C" } },
    announcement: {
      enabled: { type: Boolean, default: false },
      text: String,
      linkLabel: String,
      linkHref: String,
    },
    home: {
      heroEyebrow: String,
      heroHeadline: { type: String, required: true },
      heroHighlight: String,
      heroSubtext: String,
      primaryCta: { type: linkSchema, required: true },
      secondaryCta: { type: linkSchema, required: true },
      sections: {
        selectedWork: { type: Boolean, default: true },
        services: { type: Boolean, default: true },
        industries: { type: Boolean, default: true },
        process: { type: Boolean, default: true },
        capabilities: { type: Boolean, default: true },
        about: { type: Boolean, default: true },
        finalCta: { type: Boolean, default: true },
      },
      selectedWork: { heading: String, intro: String, projects: ref("Project") },
      services: { heading: String, intro: String, items: ref("Service") },
      industries: { heading: String, intro: String, items: ref("Category") },
      process: { heading: String, intro: String, steps: [featureItemSchema] },
      capabilities: {
        heading: String,
        intro: String,
        items: [featureItemSchema],
        technologies: { type: [String], default: [] },
      },
      about: { heading: String, text: String, ctaLabel: String },
      finalCta: { heading: String, text: String, buttonLabel: String, buttonHref: String },
    },
    navigation: { header: { type: [navItemSchema], default: [] } },
    footer: {
      blurb: String,
      showServices: { type: Boolean, default: true },
      showIndustries: { type: Boolean, default: true },
    },
    contact: {
      email: String,
      phone: String,
      whatsappNumber: String,
      whatsappMessage: String,
      location: String,
      responseTime: String,
    },
    socialLinks: { type: [socialLinkSchema], default: [] },
    seo: {
      titleTemplate: String,
      defaultTitle: String,
      defaultDescription: String,
      defaultOgImage: String,
      twitterHandle: String,
      keywords: { type: [String], default: [] },
      googleSiteVerification: String,
    },
    legal: { privacyPolicy: String, terms: String, updatedAt: Date },
    inquiry: {
      budgetRanges: { type: [String], default: [] },
      successMessage: String,
      notificationEmail: String,
    },
  },
  { timestamps: true },
);

export const SiteSettingsModel = model<TSiteSettings>("SiteSettings", siteSettingsSchema);
