import type { Metadata } from "next";
import ProjectEditor from "@/components/features/Admin/Projects/ProjectEditor";

export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage() {
  return <ProjectEditor />;
}
