import type { Metadata } from "next";
import ClientProjectEditor from "@/components/features/Admin/Clients/ClientProjectEditor";

export const metadata: Metadata = { title: "New client project" };

export default function NewClientProjectPage() {
  return <ClientProjectEditor />;
}
