import type { Metadata } from "next";
import ServiceEditor from "@/components/features/Admin/Services/ServiceEditor";

export const metadata: Metadata = { title: "New service" };

export default function NewServicePage() {
  return <ServiceEditor />;
}
