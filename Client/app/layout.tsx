import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Instrument_Serif } from "next/font/google";
import React from "react";
import "@/styles/globals.css";
import RevealObserver from "@/components/shared/RevealObserver";
import { getSettings } from "@/features/Public/apis/public.api";
import { contrastTextFor, normalizeAccent } from "@/lib/color";
import { SITE_URL } from "@/lib/site";

// Variable fonts, self-hosted by next/font (no layout shift, no third-party
// requests at runtime). Display: Bricolage Grotesque, accent: Instrument
// Serif italic, body/UI: Geist.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings.brand.name;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: settings.seo.defaultTitle || siteName,
      template: settings.seo.titleTemplate || `%s — ${siteName}`,
    },
    description: settings.seo.defaultDescription || settings.brand.description,
    applicationName: siteName,
    keywords: settings.seo.keywords,
    creator: siteName,
    formatDetection: { telephone: false, email: false, address: false },
    ...(settings.seo.googleSiteVerification
      ? { verification: { google: settings.seo.googleSiteVerification } }
      : {}),
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  const accent = normalizeAccent(settings.theme?.accent);

  return (
    <html
      lang="en"
      className={`${display.variable} ${serif.variable} ${sans.variable}`}
      style={{ "--accent": accent, "--accent-contrast": contrastTextFor(accent) } as React.CSSProperties}
      suppressHydrationWarning
    >
      <head>
        {/* Enables JS-only enhancements (scroll reveals) before first paint */}
        {/* Enables the scroll-reveal styles. Failsafe: if the page's JavaScript never
            starts (blocked or broken), drop the class so no content stays hidden. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');setTimeout(function(){if(!window.__revealReady)document.documentElement.classList.remove('js')},6000)",
          }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
