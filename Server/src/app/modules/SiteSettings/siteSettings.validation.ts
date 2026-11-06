import { z } from "zod";
import {
  featureItem,
  href,
  markdown,
  objectId,
  optionalExternalUrl,
  optionalHref,
  optionalMediaUrl,
  optionalText,
  stringList,
  text,
} from "../shared/shared.validation";

/*
 * Every object level is `.partial()` so any section (or single field) can be
 * saved on its own - the service flattens the payload into dot-paths, so
 * saving e.g. `contact` never touches `home`. Items inside lists (navigation,
 * social links, process steps) stay fully validated.
 */

const link = z.object({ label: text(40).min(1), href });

const optionalEmail = z.union([z.literal(""), z.string().trim().email().max(160)]).optional();

const homeSchema = z
  .object({
    heroEyebrow: optionalText(80),
    heroHeadline: text(160).min(5, "Headline is required"),
    heroHighlight: optionalText(80),
    heroSubtext: optionalText(400),
    primaryCta: link,
    secondaryCta: link,
    sections: z
      .object({
        selectedWork: z.boolean(),
        services: z.boolean(),
        industries: z.boolean(),
        process: z.boolean(),
        capabilities: z.boolean(),
        about: z.boolean(),
        finalCta: z.boolean(),
      })
      .partial(),
    selectedWork: z
      .object({
        heading: optionalText(),
        intro: optionalText(400),
        projects: z.array(objectId).max(12),
      })
      .partial(),
    services: z
      .object({
        heading: optionalText(),
        intro: optionalText(400),
        items: z.array(objectId).max(12),
      })
      .partial(),
    industries: z
      .object({
        heading: optionalText(),
        intro: optionalText(400),
        items: z.array(objectId).max(16),
      })
      .partial(),
    process: z
      .object({
        heading: optionalText(),
        intro: optionalText(400),
        steps: z.array(featureItem).max(8),
      })
      .partial(),
    capabilities: z
      .object({
        heading: optionalText(),
        intro: optionalText(400),
        items: z.array(featureItem).max(9),
        technologies: stringList(40, 40),
      })
      .partial(),
    about: z
      .object({
        heading: optionalText(),
        text: optionalText(600),
        ctaLabel: optionalText(40),
      })
      .partial(),
    finalCta: z
      .object({
        heading: optionalText(),
        text: optionalText(400),
        buttonLabel: optionalText(40),
        buttonHref: optionalHref,
      })
      .partial(),
  })
  .partial();

const settingsBody = z
  .object({
    brand: z
      .object({
        name: text(60).min(2, "Brand name is required"),
        tagline: optionalText(160),
        description: optionalText(400),
        logoUrl: optionalMediaUrl,
        logoDarkUrl: optionalMediaUrl,
      })
      .partial(),
    theme: z
      .object({
        accent: z
          .string()
          .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour, e.g. #C8F25C"),
      })
      .partial(),
    announcement: z
      .object({
        enabled: z.boolean(),
        text: optionalText(160),
        linkLabel: optionalText(40),
        linkHref: optionalHref,
      })
      .partial(),
    home: homeSchema,
    navigation: z
      .object({
        header: z
          .array(
            z.object({
              _id: objectId.optional(),
              label: text(30).min(1),
              href,
              visible: z.boolean(),
            }),
          )
          .max(10),
      })
      .partial(),
    footer: z
      .object({
        blurb: optionalText(400),
        showServices: z.boolean(),
        showIndustries: z.boolean(),
      })
      .partial(),
    contact: z
      .object({
        email: optionalEmail,
        phone: optionalText(40),
        whatsappNumber: z
          .union([
            z.literal(""),
            z
              .string()
              .trim()
              .regex(
                /^\+?[1-9]\d{6,14}$/,
                "Use international format with digits only, e.g. +8801XXXXXXXXX",
              ),
          ])
          .optional(),
        whatsappMessage: optionalText(400),
        location: optionalText(120),
        responseTime: optionalText(120),
      })
      .partial(),
    socialLinks: z
      .array(
        z.object({
          _id: objectId.optional(),
          platform: text(30).min(1, "Platform is required"),
          url: optionalExternalUrl.refine(value => !!value, "URL is required"),
          label: optionalText(40),
        }),
      )
      .max(12),
    seo: z
      .object({
        titleTemplate: optionalText(80).refine(
          value => !value || value.includes("%s"),
          "Must contain %s where the page title goes",
        ),
        defaultTitle: optionalText(70),
        defaultDescription: optionalText(200),
        defaultOgImage: optionalMediaUrl,
        twitterHandle: optionalText(30),
        keywords: stringList(20, 40),
        googleSiteVerification: optionalText(120),
      })
      .partial(),
    legal: z
      .object({
        privacyPolicy: markdown,
        terms: markdown,
      })
      .partial(),
    inquiry: z
      .object({
        budgetRanges: stringList(10, 60),
        successMessage: optionalText(400),
        notificationEmail: optionalEmail,
      })
      .partial(),
  })
  .partial();

const updateSettingsSchema = z.object({ body: settingsBody });

export const SiteSettingsValidations = { updateSettingsSchema };
