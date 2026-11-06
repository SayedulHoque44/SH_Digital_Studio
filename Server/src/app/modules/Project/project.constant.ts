export const PROJECT_TYPES = [
  "website",
  "web-app",
  "mobile-app",
  "desktop-app",
  "saas",
  "ui-ux",
  "other",
] as const;

// Development state - shown honestly on cards and detail pages.
export const PROJECT_STATUSES = [
  "concept", // demo / concept build, not commissioned by a client
  "prototype",
  "in-progress",
  "completed",
] as const;

export const PROJECT_VISIBILITY = [
  "listed", // appears in listings, category pages and the sitemap
  "unlisted", // reachable only by its direct link (noindex)
] as const;

export const ProjectSearchFields = [
  "title",
  "subtitle",
  "summary",
  "brandName",
  "subcategory",
  "tags",
];

export const ProjectSortOptions: Record<string, string> = {
  order: "sortOrder -createdAt",
  featured: "-featured featuredOrder sortOrder",
  newest: "-publishedAt -createdAt",
  oldest: "publishedAt createdAt",
  title: "title",
  updated: "-updatedAt",
};
