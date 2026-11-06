export const PUBLISH_STATUSES = ["draft", "published", "archived"] as const;
export const SIMPLE_PUBLISH_STATUSES = ["draft", "published"] as const;

// Ordered, reusable sections for project/category pages. Each type has its
// own validated `data` shape (see shared.validation.ts) and a matching
// renderer on the frontend (components/features/Blocks).
export const BLOCK_TYPES = [
  "richText",
  "heading",
  "image",
  "gallery",
  "video",
  "imageText",
  "featureGrid",
  "techList",
  "stats",
  "comparison",
  "quote",
  "callout",
  "embed",
  "beforeAfter",
  "timeline",
  "cta",
] as const;

export const TEXT_LIMITS = {
  short: 160,
  medium: 320,
  long: 1200,
  markdown: 20000,
} as const;
