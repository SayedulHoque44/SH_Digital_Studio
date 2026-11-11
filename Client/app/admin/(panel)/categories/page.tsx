import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPageSkeleton } from "@/components/features/Admin/Skeletons";
import CategoryManager from "@/components/features/Admin/Categories/CategoryManager";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton pathname="/admin/categories" />}>
      <CategoryManager />
    </Suspense>
  );
}
