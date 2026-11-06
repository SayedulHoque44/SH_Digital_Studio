import type { Metadata } from "next";
import React from "react";
import AdminProviders from "@/components/features/Admin/AdminProviders";

// The admin area is private: never indexed, never cached by search engines.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin — SH Digital Studio" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
