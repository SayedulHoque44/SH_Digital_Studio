import type { Metadata } from "next";
import NotFoundContent from "@/components/features/Errors/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

// notFound() inside public pages (the (site) layout already adds the chrome)
export default function SiteNotFound() {
  return <NotFoundContent />;
}
