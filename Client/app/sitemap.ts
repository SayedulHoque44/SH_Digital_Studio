import type { MetadataRoute } from "next";
import { getSitemapData } from "@/features/Public/apis/public.api";
import { SITE_URL } from "@/lib/site";

/**
 * Generated from published content only. Drafts, archived items, unlisted
 * projects and anything marked "noindex" in the admin are excluded by the
 * API (/api/public/sitemap).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getSitemapData().catch(() => null);
  const now = new Date();
  const date = (value?: string) => (value ? new Date(value) : now);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: date(data?.settingsUpdatedAt), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/work`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/demos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/industries`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: date(data?.profileUpdatedAt), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: date(data?.settingsUpdatedAt), changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: date(data?.settingsUpdatedAt), changeFrequency: "yearly", priority: 0.2 },
  ];

  if (!data) return staticPages;

  return [
    ...staticPages,
    ...data.categories.map((item) => ({
      url: `${SITE_URL}/demos/${item.slug}`,
      lastModified: date(item.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...data.projects.map((item) => ({
      url: `${SITE_URL}/projects/${item.slug}`,
      lastModified: date(item.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...data.services.map((item) => ({
      url: `${SITE_URL}/services/${item.slug}`,
      lastModified: date(item.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
