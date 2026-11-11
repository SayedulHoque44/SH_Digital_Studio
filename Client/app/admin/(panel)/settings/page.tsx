import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPageSkeleton } from "@/components/features/Admin/Skeletons";
import SettingsEditor from "@/components/features/Admin/Settings/SettingsEditor";

export const metadata: Metadata = { title: "Site settings" };

// Suspense: the editor reads ?tab= to open a specific tab
export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton pathname="/admin/settings" />}>
      <SettingsEditor />
    </Suspense>
  );
}
