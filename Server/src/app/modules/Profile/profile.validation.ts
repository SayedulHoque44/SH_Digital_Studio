import { z } from "zod";
import {
  featureItem,
  markdown,
  objectId,
  optionalExternalUrl,
  optionalMediaRef,
  optionalText,
  seo,
  stringList,
  text,
} from "../shared/shared.validation";

const yearMonth = z
  .union([z.literal(""), z.string().regex(/^\d{4}(-\d{2})?$/, "Use YYYY or YYYY-MM")])
  .optional();

const skill = z.object({
  _id: objectId.optional(),
  name: text(60).min(1, "Skill name is required"),
  category: text(60).min(1, "Category is required"),
  description: optionalText(300),
  icon: optionalText(40),
  proficiencyLabel: optionalText(40),
});

const experience = z.object({
  _id: objectId.optional(),
  organization: text(120).min(1, "Organization is required"),
  position: text(120).min(1, "Position is required"),
  employmentType: optionalText(60),
  location: optionalText(120),
  startDate: yearMonth,
  endDate: yearMonth,
  isCurrent: z.boolean().default(false),
  description: optionalText(2000),
  responsibilities: stringList(20, 300).optional(),
  achievements: stringList(20, 300).optional(),
  technologies: stringList(30, 40).optional(),
  relatedProjects: z.array(objectId).max(10).optional(),
  logo: optionalMediaRef,
});

const education = z.object({
  _id: objectId.optional(),
  institution: text(160).min(1, "Institution is required"),
  qualification: text(160).min(1, "Qualification is required"),
  field: optionalText(160),
  startDate: yearMonth,
  endDate: yearMonth,
  description: optionalText(1000),
});

const certification = z.object({
  _id: objectId.optional(),
  name: text(160).min(1),
  issuer: optionalText(160),
  date: yearMonth,
  url: optionalExternalUrl,
});

const testimonial = z.object({
  _id: objectId.optional(),
  quote: text(1500).min(1),
  author: text(120).min(1),
  role: optionalText(120),
  company: optionalText(120),
  approved: z.boolean().default(false),
  project: z.union([objectId, z.literal(""), z.null()]).optional(),
});

const updateProfileSchema = z.object({
  body: z
    .object({
      name: text(80).min(2, "Name is required"),
      title: optionalText(120),
      shortIntro: optionalText(400),
      bio: markdown,
      photo: optionalMediaRef,
      location: optionalText(120),
      availabilityStatus: z.enum(["available", "limited", "unavailable", "hidden"]),
      availabilityNote: optionalText(160),
      specializations: stringList(20, 80),
      workingArrangements: stringList(12, 160),
      skillCategories: stringList(20, 60),
      skills: z.array(skill).max(120),
      experience: z.array(experience).max(30),
      education: z.array(education).max(20),
      capabilities: z.array(featureItem).max(20),
      workingProcess: z.array(featureItem).max(12),
      certifications: z.array(certification).max(30),
      testimonials: z.array(testimonial).max(40),
      featuredProjects: z.array(objectId).max(12),
      resumeUrl: optionalExternalUrl,
      seo: seo,
    })
    .partial(),
});

export const ProfileValidations = { updateProfileSchema };
