"use client";

// Reads natural image dimensions in the browser (used to store width/height
// with media references, which prevents layout shift on the public site).
export const readImageSize = (src: string) =>
  new Promise<{ width: number; height: number } | null>((resolve) => {
    if (typeof window === "undefined" || !src) return resolve(null);
    const image = new window.Image();
    const timer = setTimeout(() => resolve(null), 8000);
    image.onload = () => {
      clearTimeout(timer);
      resolve(image.naturalWidth ? { width: image.naturalWidth, height: image.naturalHeight } : null);
    };
    image.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    image.src = src;
  });

export const isLikelyImageUrl = (url: string) =>
  /^https?:\/\//i.test(url) || (url.startsWith("/") && !url.startsWith("//"));

export const formatBytes = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
