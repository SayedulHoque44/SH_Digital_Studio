import type { Metadata } from "next";
import { Suspense } from "react";
import CategoryManager from "@/components/features/Admin/Categories/CategoryManager";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  return (
    <Suspense>
      <CategoryManager />
    </Suspense>
  );
}
