// Hosts next/image is configured to optimize (see next.config.ts). Images
// from any other host are rendered without optimization so that admins can
// paste any https image URL without breaking the page.
const OPTIMIZED_HOSTS = [
  "i.ytimg.com",
  "img.youtube.com",
  ...(process.env.NEXT_PUBLIC_IMAGE_HOSTS || "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
];

export const canOptimizeImage = (src?: string) => {
  if (!src) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return !src.endsWith(".svg");
  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
};

export const isSafeMediaSrc = (src?: string) =>
  !!src && (/^https?:\/\//i.test(src) || (src.startsWith("/") && !src.startsWith("//")));
