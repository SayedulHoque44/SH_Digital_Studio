import type { Metadata } from "next";
import ServicesTable from "@/components/features/Admin/Services/ServicesTable";

export const metadata: Metadata = { title: "Services" };

export default function AdminServicesPage() {
  return <ServicesTable />;
}
