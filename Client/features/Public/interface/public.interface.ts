// Shapes returned by the public API (/api/public/*). They mirror the
// whitelisting mappers in Server/src/app/modules/Public/public.mappers.ts.

export type TProjectType =
  | "website"
  | "web-app"
  | "mobile-app"
  | "desktop-app"
  | "saas"
  | "ui-ux"
  | "other";

export type TProjectStatus = "concept" | "prototype" | "in-progress" | "completed";

export interface IMedia {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface IVideo {
  url: string;
  title?: string;
  posterUrl?: string;
  captionsUrl?: string;
  transcript?: string;
}

export interface ILink {
  label: string;
  href: string;
}

export interface IFeatureItem {
  title: string;
  description?: string;
  icon?: string;
}

export interface IFaq {
  question: string;
  answer: string;
}

export interface ICta {
  heading?: string;
  text?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export interface ISeo {
  title?: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface ICategoryRef {
  name: string;
  slug: string;
}

export interface IContentBlock {
  id: string;
  type:
    | "richText"
    | "heading"
    | "image"
    | "gallery"
    | "video"
    | "imageText"
    | "featureGrid"
    | "techList"
    | "stats"
    | "comparison"
    | "quote"
    | "callout"
    | "embed"
    | "beforeAfter"
    | "timeline"
    | "cta";
  data: Record<string, any>;
}

export interface IProjectCard {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  projectType: TProjectType;
  projectStatus: TProjectStatus;
  isClientWork: boolean;
  subcategory?: string;
  brandName?: string;
  tags: string[];
  featured: boolean;
  publishedAt?: string;
  coverImage?: IMedia;
  logo?: IMedia;
  mobilePreview?: IMedia;
  techStack: string[];
  platforms: string[];
  categories: ICategoryRef[];
  liveUrl?: string;
  hasVideo: boolean;
}

export interface IProjectDetail extends IProjectCard {
  overview?: string;
  clientName?: string;
  visibility: "listed" | "unlisted";
  media: {
    coverImage?: IMedia;
    logo?: IMedia;
    browserMockup?: IMedia;
    fullPageScreenshot?: IMedia;
    desktopScreenshots: IMedia[];
    tabletScreenshots: IMedia[];
    mobileScreenshots: IMedia[];
    gallery: IMedia[];
  };
  video?: IVideo;
  links: {
    liveUrl?: string;
    liveUrlLabel?: string;
    secondaryUrl?: string;
    secondaryUrlLabel?: string;
    sourceUrl?: string;
    appStoreUrl?: string;
    playStoreUrl?: string;
  };
  corePages: string[];
  designHighlights: string[];
  features: IFeatureItem[];
  modules: IFeatureItem[];
  workflows: IFeatureItem[];
  caseStudy: Partial<
    Record<
      | "goals"
      | "problem"
      | "solution"
      | "targetAudience"
      | "process"
      | "designDecisions"
      | "challenges"
      | "implementation"
      | "role"
      | "collaboration"
      | "timeline"
      | "outcomes"
      | "lessons"
      | "limitations",
      string
    >
  >;
  contentBlocks: IContentBlock[];
  demoAccess?: {
    username?: string;
    password?: string;
    loginUrl?: string;
    instructions?: string;
    limitations?: string;
  };
  cta?: ICta;
  seo?: ISeo;
  related: IProjectCard[];
  updatedAt?: string;
}

export interface ICategoryCard {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  icon?: string;
  coverImage?: IMedia;
  parentId?: string;
  projectCount: number;
}

export interface IServiceCard {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  icon?: string;
  image?: IMedia;
  projectTypes: TProjectType[];
  startingPrice?: string;
  timeline?: string;
}

export interface ICategoryDetail {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  introduction?: string;
  emailIntro?: string;
  highlights: string[];
  icon?: string;
  coverImage?: IMedia;
  featuredImage?: IMedia;
  contentBlocks: IContentBlock[];
  faqs: IFaq[];
  cta?: ICta;
  seo?: ISeo;
  parent: ICategoryRef | null;
  children: ICategoryCard[];
  projects: IProjectCard[];
  relatedServices: IServiceCard[];
  updatedAt?: string;
}

export interface IServiceDetail extends IServiceCard {
  description?: string;
  benefits: string[];
  features: IFeatureItem[];
  deliverables: string[];
  priceNote?: string;
  faqs: IFaq[];
  cta?: ICta;
  seo?: ISeo;
  industries: ICategoryCard[];
  relatedProjects: IProjectCard[];
  otherServices: IServiceCard[];
  updatedAt?: string;
}

export interface ISocialLink {
  platform: string;
  url: string;
  label?: string;
}

export interface IPublicSettings {
  brand: {
    name: string;
    tagline?: string;
    description?: string;
    logoUrl?: string;
    logoDarkUrl?: string;
  };
  theme: { accent: string };
  announcement: { enabled: boolean; text?: string; linkLabel?: string; linkHref?: string };
  navigation: { header: ILink[] };
  footer: {
    blurb?: string;
    services: { title: string; slug: string }[];
    industries: { name: string; slug: string }[];
  };
  contact: {
    email?: string;
    phone?: string;
    whatsappNumber?: string;
    whatsappMessage?: string;
    location?: string;
    responseTime?: string;
  };
  socialLinks: ISocialLink[];
  seo: {
    titleTemplate?: string;
    defaultTitle?: string;
    defaultDescription?: string;
    defaultOgImage?: string;
    twitterHandle?: string;
    keywords?: string[];
    googleSiteVerification?: string;
  };
  inquiry: { budgetRanges: string[] };
  closingCta?: ICta | null;
  legalUpdatedAt?: string;
  updatedAt?: string;
}

export interface IHomeData {
  hero: {
    eyebrow?: string;
    headline: string;
    highlight?: string;
    subtext?: string;
    primaryCta?: ILink;
    secondaryCta?: ILink;
  };
  sections: Partial<
    Record<
      "selectedWork" | "services" | "industries" | "process" | "capabilities" | "about" | "finalCta",
      boolean
    >
  >;
  selectedWork: { heading?: string; intro?: string; projects: IProjectCard[] };
  services: { heading?: string; intro?: string; items: IServiceCard[] };
  industries: { heading?: string; intro?: string; items: ICategoryCard[] };
  process: { heading?: string; intro?: string; steps: IFeatureItem[] };
  capabilities: {
    heading?: string;
    intro?: string;
    items: IFeatureItem[];
    technologies: string[];
  };
  about: {
    heading?: string;
    text?: string;
    ctaLabel?: string;
    profile: {
      name: string;
      title?: string;
      shortIntro?: string;
      photo?: IMedia;
      availability?: { status: string; note?: string };
    };
  };
  finalCta?: ICta;
  counts: { projects: number };
}

export interface IPublicProfile {
  name: string;
  title?: string;
  shortIntro?: string;
  bio?: string;
  photo?: IMedia;
  location?: string;
  availability?: { status: "available" | "limited" | "unavailable"; note?: string };
  specializations: string[];
  workingArrangements: string[];
  skillGroups: {
    category: string;
    skills: { name: string; description?: string; icon?: string; proficiencyLabel?: string }[];
  }[];
  experience: {
    organization: string;
    position: string;
    employmentType?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
    responsibilities: string[];
    achievements: string[];
    technologies: string[];
    logo?: IMedia;
  }[];
  education: {
    institution: string;
    qualification: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }[];
  capabilities: IFeatureItem[];
  workingProcess: IFeatureItem[];
  certifications: { name: string; issuer?: string; date?: string; url?: string }[];
  testimonials: {
    quote: string;
    author: string;
    role?: string;
    company?: string;
    project?: { title: string; slug: string };
  }[];
  featuredProjects: IProjectCard[];
  resumeUrl?: string;
  seo?: ISeo;
  contact: { email?: string; whatsappNumber?: string; location?: string };
  socialLinks: ISocialLink[];
  updatedAt?: string;
}

export interface ISitemapData {
  projects: { slug: string; updatedAt?: string }[];
  categories: { slug: string; updatedAt?: string }[];
  services: { slug: string; updatedAt?: string }[];
  profileUpdatedAt?: string;
  settingsUpdatedAt?: string;
}

export interface IPaginated<T> {
  meta: { page: number; limit: number; total: number; totalPage: number };
  result: T[];
}

export type TRedirect = { redirectSlug: string };
