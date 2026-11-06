import type { Metadata } from "next";
import ProjectsTable from "@/components/features/Admin/Projects/ProjectsTable";

export const metadata: Metadata = { title: "Projects" };

export default function AdminProjectsPage() {
  return <ProjectsTable />;
}
