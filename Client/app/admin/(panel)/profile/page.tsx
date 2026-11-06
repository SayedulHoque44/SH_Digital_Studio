import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileEditor from "@/components/features/Admin/Profile/ProfileEditor";

export const metadata: Metadata = { title: "Profile & about" };

// Suspense: the editor reads ?tab= to open a specific tab
export default function AdminProfilePage() {
  return (
    <Suspense>
      <ProfileEditor />
    </Suspense>
  );
}
