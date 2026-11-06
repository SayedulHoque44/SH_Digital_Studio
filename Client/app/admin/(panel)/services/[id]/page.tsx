import type { Metadata } from "next";
import ServiceEditor from "@/components/features/Admin/Services/ServiceEditor";

export const metadata: Metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ServiceEditor id={id} />;
}
