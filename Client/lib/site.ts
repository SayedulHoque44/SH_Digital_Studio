// Public base URL of the website - used for canonical URLs, sitemap, Open
// Graph images and structured data. Set NEXT_PUBLIC_SITE_URL in production.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);

export const absoluteUrl = (path = "/") => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

// Only allow internal, same-site paths (prevents open redirects through
// ?next= parameters).
export const safeInternalPath = (value: unknown, fallback = "/") => {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
};

export const isExternalHref = (href?: string) => !!href && /^https?:\/\//i.test(href);
