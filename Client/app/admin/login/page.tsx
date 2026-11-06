import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/features/Admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
