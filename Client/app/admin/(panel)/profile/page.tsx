import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPageSkeleton } from "@/components/features/Admin/Skeletons";
import ProfileEditor from "@/components/features/Admin/Profile/ProfileEditor";

export const metadata: Metadata = { title: "Profile & about" };

// Suspense: the editor reads ?tab= to open a specific tab
export default function AdminProfilePage() {
  return (
    <Suspense fallback={<AdminPageSkeleton pathname="/admin/profile" />}>
      <ProfileEditor />
    </Suspense>
  );
}
