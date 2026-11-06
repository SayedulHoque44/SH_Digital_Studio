import type { Metadata } from "next";
import AccountSettings from "@/components/features/Admin/Account/AccountSettings";

export const metadata: Metadata = { title: "Account & security" };

export default function AdminAccountPage() {
  return <AccountSettings />;
}
