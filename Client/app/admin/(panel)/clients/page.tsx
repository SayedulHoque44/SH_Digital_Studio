import type { Metadata } from "next";
import ClientsManager from "@/components/features/Admin/Clients/ClientsManager";

export const metadata: Metadata = { title: "Clients" };

export default function AdminClientsPage() {
  return <ClientsManager />;
}
