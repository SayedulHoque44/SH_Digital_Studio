import type { Metadata } from "next";
import type { IPublicSettings, ISeo } from "@/features/Public/interface/public.interface";
import { absoluteUrl } from "./site";

type TBuildMetadata = {
  settings: IPublicSettings;
  // Page title without the site suffix (the root layout template adds it)
  title?: string;
  // Use the title exactly as given (homepage)
  absoluteTitle?: boolean;
  description?: string;
  path: string;
  // Explicit social image; defaults to a generated branded card
  image?: string;
  imageAlt?: string;
  seo?: ISeo;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
};

const truncate = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;

/**
 * Builds consistent page metadata from published content: title,
 * description, canonical URL, robots, Open Graph and Twitter/X cards.
 * Admin SEO overrides (seo.title, seo.description, seo.ogImage,
 * seo.canonicalUrl, seo.noIndex) win over the generated defaults.
 */
export function buildMetadata({
  settings,
  title,
  absoluteTitle,
  description,
  path,
  image,
  imageAlt,
  seo,
  type = "website",
  noIndex,
}: TBuildMetadata): Metadata {
  const siteName = settings.brand?.name || "SH Digital Studio";
  const pageTitle = seo?.title || title || settings.seo?.defaultTitle || siteName;
  const pageDescription = truncate(
    seo?.description || description || settings.seo?.defaultDescription || settings.brand?.description || "",
    200,
  );
  const canonical = seo?.canonicalUrl || absoluteUrl(path);
  const socialImage = absoluteUrl(seo?.ogImage || image || settings.seo?.defaultOgImage || "/og");
  const fullTitle = absoluteTitle
    ? pageTitle
    : (settings.seo?.titleTemplate || `%s — ${siteName}`).replace("%s", pageTitle);
  const shouldNoIndex = noIndex || seo?.noIndex;

  return {
    title: absoluteTitle ? { absolute: pageTitle } : pageTitle,
    description: pageDescription,
    alternates: { canonical },
    robots: shouldNoIndex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type,
      url: canonical,
      siteName,
      title: fullTitle,
      description: pageDescription,
      locale: "en_US",
      images: [{ url: socialImage, width: 1200, height: 630, alt: imageAlt || fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: pageDescription,
      images: [socialImage],
      ...(settings.seo?.twitterHandle ? { site: settings.seo.twitterHandle } : {}),
    },
  };
}
