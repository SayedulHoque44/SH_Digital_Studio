import type { Metadata } from "next";
import MediaLibrary from "@/components/features/Admin/Media/MediaLibrary";

export const metadata: Metadata = { title: "Media library" };

export default function AdminMediaPage() {
  return <MediaLibrary />;
}
