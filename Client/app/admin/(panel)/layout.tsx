import React from "react";
import AdminShell from "@/components/features/Admin/AdminShell";

// Every page in this group requires a signed-in admin. The shell checks the
// session with the API (the API itself enforces authorization on each call).
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
