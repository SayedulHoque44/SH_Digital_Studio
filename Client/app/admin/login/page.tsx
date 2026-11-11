import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/features/Admin/LoginForm";
import { LoginSkeleton } from "@/components/features/Admin/Skeletons";

export const metadata: Metadata = { title: "Sign in" };

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
