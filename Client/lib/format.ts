import type { TProjectStatus, TProjectType } from "@/features/Public/interface/public.interface";

export const PROJECT_TYPE_LABELS: Record<TProjectType, string> = {
  website: "Website",
  "web-app": "Web application",
  "mobile-app": "Mobile app",
  "desktop-app": "Desktop app",
  saas: "SaaS & business tool",
  "ui-ux": "UI/UX concept",
  other: "Other",
};

// Plural labels used by filters and tabs
export const PROJECT_TYPE_PLURALS: Record<TProjectType, string> = {
  website: "Websites",
  "web-app": "Web apps",
  "mobile-app": "Mobile apps",
  "desktop-app": "Desktop apps",
  saas: "SaaS & tools",
  "ui-ux": "UI/UX concepts",
  other: "Other",
};

export const PROJECT_STATUS_LABELS: Record<TProjectStatus, string> = {
  concept: "Concept demo",
  prototype: "Prototype",
  "in-progress": "In progress",
  completed: "Completed",
};

export const APP_TYPES: TProjectType[] = ["web-app", "mobile-app", "desktop-app", "saas"];

export const isAppType = (type: TProjectType) => APP_TYPES.includes(type);

export const formatDate = (value?: string | Date, options?: Intl.DateTimeFormatOptions) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", options || { year: "numeric", month: "long", day: "numeric" });
};

// "2024-03" -> "Mar 2024"
export const formatYearMonth = (value?: string) => {
  if (!value) return "";
  const [year, month] = value.split("-");
  if (!month) return year;
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

export const initials = (name?: string) =>
  (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SH";

export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

export const hostnameOf = (url?: string) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
