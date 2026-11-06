import type { Metadata } from "next";
import LegalPage from "@/components/features/Legal/LegalPage";
import { getLegal, getSettings } from "@/features/Public/apis/public.api";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    settings,
    title: "Privacy policy",
    description: `How ${settings.brand.name} collects, uses and protects the information you share through this website.`,
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
  const legal = await getLegal("privacy");
  return <LegalPage title="Privacy policy" content={legal?.content} updatedAt={legal?.updatedAt} />;
}
