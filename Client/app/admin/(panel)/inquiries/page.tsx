import type { Metadata } from "next";
import { Suspense } from "react";
import InquiriesManager from "@/components/features/Admin/Inquiries/InquiriesManager";

export const metadata: Metadata = { title: "Inquiries" };

export default function AdminInquiriesPage() {
  return (
    <Suspense>
      <InquiriesManager />
    </Suspense>
  );
}
