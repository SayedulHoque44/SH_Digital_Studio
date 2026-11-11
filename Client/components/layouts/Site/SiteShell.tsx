import React from "react";
import { getSettings } from "@/features/Public/apis/public.api";
import NavigationSkeleton from "./NavigationSkeleton";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

/**
 * Public website chrome (announcement, header, footer). Used by the (site)
 * route group layout, the homepage and the global 404 page so every public
 * page shares one header and footer driven by Admin -> Site settings.
 */
export default async function SiteShell({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const announcement = settings.announcement?.enabled && settings.announcement.text ? settings.announcement : null;

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ "--announce-h": announcement ? "40px" : "0px" } as React.CSSProperties}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:font-medium focus:text-accent-contrast"
      >
        Skip to content
      </a>
      <SiteHeader
        brandName={settings.brand.name}
        logoUrl={settings.brand.logoDarkUrl || undefined}
        navigation={settings.navigation.header}
        announcement={
          announcement
            ? {
                text: announcement.text!,
                linkLabel: announcement.linkLabel,
                linkHref: announcement.linkHref,
              }
            : undefined
        }
        contactEmail={settings.contact.email}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {/* Skeleton of the next page while a client-side navigation loads */}
      <NavigationSkeleton />
      <SiteFooter settings={settings} />
    </div>
  );
}
