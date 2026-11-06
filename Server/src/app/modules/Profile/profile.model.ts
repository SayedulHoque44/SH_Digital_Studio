import { Schema, model } from "mongoose";
import { featureItemSchema, mediaRefSchema, seoSchema } from "../shared/shared.model";
import {
  TCertification,
  TEducation,
  TExperience,
  TProfile,
  TSkill,
  TTestimonial,
} from "./profile.interface";

const skillSchema = new Schema<TSkill>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  icon: String,
  proficiencyLabel: String,
});

const experienceSchema = new Schema<TExperience>({
  organization: { type: String, required: true },
  position: { type: String, required: true },
  employmentType: String,
  location: String,
  startDate: String,
  endDate: String,
  isCurrent: { type: Boolean, default: false },
  description: String,
  responsibilities: { type: [String], default: [] },
  achievements: { type: [String], default: [] },
  technologies: { type: [String], default: [] },
  relatedProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  logo: { type: mediaRefSchema, default: undefined },
});

const educationSchema = new Schema<TEducation>({
  institution: { type: String, required: true },
  qualification: { type: String, required: true },
  field: String,
  startDate: String,
  endDate: String,
  description: String,
});

const certificationSchema = new Schema<TCertification>({
  name: { type: String, required: true },
  issuer: String,
  date: String,
  url: String,
});

const testimonialSchema = new Schema<TTestimonial>({
  quote: { type: String, required: true },
  author: { type: String, required: true },
  role: String,
  company: String,
  approved: { type: Boolean, default: false },
  project: { type: Schema.Types.ObjectId, ref: "Project", default: null },
});

// Singleton document (key: "main")
const profileSchema = new Schema<TProfile>(
  {
    key: { type: String, default: "main", unique: true },
    name: { type: String, required: true },
    title: String,
    shortIntro: String,
    bio: String,
    photo: { type: mediaRefSchema, default: undefined },
    location: String,
    availabilityStatus: {
      type: String,
      enum: ["available", "limited", "unavailable", "hidden"],
      default: "hidden",
    },
    availabilityNote: String,
    specializations: { type: [String], default: [] },
    workingArrangements: { type: [String], default: [] },
    skillCategories: { type: [String], default: [] },
    skills: { type: [skillSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    capabilities: { type: [featureItemSchema], default: [] },
    workingProcess: { type: [featureItemSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    testimonials: { type: [testimonialSchema], default: [] },
    featuredProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    resumeUrl: String,
    seo: { type: seoSchema, default: undefined },
  },
  { timestamps: true },
);

export const ProfileModel = model<TProfile>("Profile", profileSchema);
