import { z } from "zod";
import {
  idParams,
  optionalExternalUrl,
  optionalText,
  paginationQuery,
  text,
} from "../shared/shared.validation";
import {
  INQUIRY_STATUSES,
  MAX_LINKS_IN_MESSAGE,
  PREFERRED_CONTACT_METHODS,
} from "./inquiry.constant";

const countLinks = (value: string) => (value.match(/https?:\/\//gi) || []).length;

// Public form submission. Only fields useful for qualifying a project are
// accepted - no payment details, passwords or other sensitive data.
const createInquirySchema = z.object({
  body: z
    .object({
      name: text(80).min(2, "Please enter your name"),
      businessName: optionalText(120),
      email: z.string().trim().toLowerCase().email("Please enter a valid email").max(160),
      phone: z
        .union([
          z.literal(""),
          z.string().trim().regex(/^[+\d][\d\s()-]{6,24}$/, "Please enter a valid phone number"),
        ])
        .optional(),
      country: optionalText(80),
      website: optionalExternalUrl,
      industry: optionalText(80),
      service: optionalText(120),
      projectSlug: optionalText(120),
      projectTitle: optionalText(160),
      message: text(5000)
        .min(20, "Please tell us a little more about your project (20+ characters)")
        .refine(
          value => countLinks(value) <= MAX_LINKS_IN_MESSAGE,
          "Please include fewer links in your message",
        ),
      budgetRange: optionalText(60),
      desiredLaunch: optionalText(60),
      preferredContact: z.enum(PREFERRED_CONTACT_METHODS).default("email"),
      consent: z.literal(true, {
        errorMap: () => ({ message: "Please confirm you agree to be contacted about your inquiry" }),
      }),
      sourcePath: optionalText(300),
      // Honeypot: hidden from humans, bots tend to fill it in
      homepage: z.string().max(300).optional(),
      // Milliseconds the visitor spent on the form, measured in the browser
      // (an elapsed time, so the device's clock setting doesn't matter)
      fillMs: z.coerce.number().int().min(0).max(30 * 24 * 60 * 60 * 1000).optional(),
    })
    .refine(
      value =>
        !["whatsapp", "phone"].includes(value.preferredContact) || !!value.phone,
      {
        message: "Please add a phone number for WhatsApp/phone contact",
        path: ["phone"],
      },
    ),
});

const updateInquirySchema = z.object({
  params: idParams,
  body: z.object({
    status: z.enum(INQUIRY_STATUSES).optional(),
    adminNotes: optionalText(10000),
  }),
});

const listInquiriesSchema = z.object({
  query: z.object({
    ...paginationQuery,
    status: z.enum(INQUIRY_STATUSES).optional(),
    industry: z.string().trim().max(80).optional(),
    gte: z.string().max(40).optional(),
    lte: z.string().max(40).optional(),
    sort: z.string().max(20).optional(),
  }),
});

export const InquiryValidations = {
  createInquirySchema,
  updateInquirySchema,
  listInquiriesSchema,
};
