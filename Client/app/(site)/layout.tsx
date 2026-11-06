import React from "react";
import SiteShell from "@/components/layouts/Site/SiteShell";

// Every public page in this route group shares the site header and footer.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
