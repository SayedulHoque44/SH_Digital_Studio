import type { Metadata } from "next";
import NotFoundContent from "@/components/features/Errors/NotFoundContent";
import SiteShell from "@/components/layouts/Site/SiteShell";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

// Unmatched URLs: rendered with the full site header and footer.
export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  );
}
