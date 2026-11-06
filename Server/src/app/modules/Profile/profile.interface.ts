import { Types } from "mongoose";
import { TFeatureItem, TMediaRef, TSeo } from "../shared/shared.interface";

// Skills carry an optional text label (e.g. "Daily use") instead of invented
// percentage scores.
export type TSkill = {
  _id?: Types.ObjectId;
  name: string;
  category: string;
  description?: string;
  icon?: string;
  proficiencyLabel?: string;
};

export type TExperience = {
  _id?: Types.ObjectId;
  organization: string;
  position: string;
  employmentType?: string;
  location?: string;
  startDate?: string; // "2023-04" (YYYY-MM)
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  relatedProjects: Types.ObjectId[];
  logo?: TMediaRef;
};

export type TEducation = {
  _id?: Types.ObjectId;
  institution: string;
  qualification: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

export type TCertification = {
  _id?: Types.ObjectId;
  name: string;
  issuer?: string;
  date?: string;
  url?: string;
};

// Only rendered publicly when `approved` is true (real, permitted quotes).
export type TTestimonial = {
  _id?: Types.ObjectId;
  quote: string;
  author: string;
  role?: string;
  company?: string;
  approved: boolean;
  project?: Types.ObjectId | null;
};

export type TProfile = {
  key: "main";
  name: string;
  title?: string;
  shortIntro?: string;
  bio?: string; // markdown
  photo?: TMediaRef;
  location?: string;
  availabilityStatus: "available" | "limited" | "unavailable" | "hidden";
  availabilityNote?: string;
  specializations: string[];
  workingArrangements: string[];
  skillCategories: string[];
  skills: TSkill[];
  experience: TExperience[];
  education: TEducation[];
  capabilities: TFeatureItem[];
  workingProcess: TFeatureItem[];
  certifications: TCertification[];
  testimonials: TTestimonial[];
  featuredProjects: Types.ObjectId[];
  resumeUrl?: string;
  seo?: TSeo;
};
