import type { MetadataRoute } from "next";
import { getSettings } from "@/features/Public/apis/public.api";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings();
  return {
    name: settings.brand.name,
    short_name: settings.brand.name.split(" ")[0] || "SH",
    description: settings.brand.description || settings.brand.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0b0d",
    theme_color: "#0a0b0d",
    icons: [
      { src: "/brand/sh-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/sh-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/sh-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
