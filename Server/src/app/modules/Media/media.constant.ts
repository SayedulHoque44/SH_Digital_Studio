export const MEDIA_KINDS = ["image", "video"] as const;
export const MEDIA_PROVIDERS = [
  "external", // any https URL pasted by the admin
  "upload", // file uploaded to the configured S3 bucket
  "youtube",
  "vimeo",
  "static", // file shipped with the website (Client/public)
] as const;

// SVG is deliberately not accepted for uploads: it can contain script.
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
export const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB

export const MediaSearchFields = ["title", "alt", "caption", "url", "tags"];
