import type { Metadata } from "next";
import LegalPage from "@/components/features/Legal/LegalPage";
import { getLegal, getSettings } from "@/features/Public/apis/public.api";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    settings,
    title: "Terms of use",
    description: `Terms for using the ${settings.brand.name} website, including how concept demos should be understood.`,
    path: "/terms",
  });
}

export default async function TermsPage() {
  const legal = await getLegal("terms");
  return <LegalPage title="Terms of use" content={legal?.content} updatedAt={legal?.updatedAt} />;
}
