import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPageSkeleton } from "@/components/features/Admin/Skeletons";
import InquiriesManager from "@/components/features/Admin/Inquiries/InquiriesManager";

export const metadata: Metadata = { title: "Inquiries" };

export default function AdminInquiriesPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton pathname="/admin/inquiries" />}>
      <InquiriesManager />
    </Suspense>
  );
}
