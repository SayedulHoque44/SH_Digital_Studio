import type { Metadata } from "next";
import ClientProjectEditor from "@/components/features/Admin/Clients/ClientProjectEditor";

export const metadata: Metadata = { title: "Client project" };

export default async function EditClientProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientProjectEditor id={id} />;
}
