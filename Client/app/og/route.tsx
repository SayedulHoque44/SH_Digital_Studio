import { getHome, getSettings } from "@/features/Public/apis/public.api";
import { normalizeAccent } from "@/lib/color";
import { renderOgImage } from "@/lib/server/og";

// Default social card for the homepage and pages without their own image.
export async function GET() {
  const [settings, home] = await Promise.all([getSettings(), getHome().catch(() => null)]);
  return renderOgImage({
    brand: settings.brand.name,
    accent: normalizeAccent(settings.theme.accent),
    eyebrow: "Design & development studio",
    title: settings.brand.tagline || "Digital experiences built to move businesses forward.",
    subtitle: "Websites, web applications and live demos by industry.",
    image: home?.selectedWork.projects[0]?.coverImage?.url,
  });
}
