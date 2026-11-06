import type { Metadata } from "next";
import Link from "next/link";
import { LuClock, LuMail, LuMapPin, LuMessageCircle, LuPhone, LuShieldCheck } from "react-icons/lu";
import InquiryForm from "@/components/features/Contact/InquiryForm";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import {
  getCategories,
  getProject,
  getServices,
  getSettings,
  isRedirect,
} from "@/features/Public/apis/public.api";
import { buildMetadata } from "@/lib/seo";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import TanstackProvider from "@/providers/TanstackProvider";

type TSearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) || "";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    settings,
    title: "Start a project",
    description:
      "Tell us about your business and what you want to achieve. Get a clear, honest reply about how we can help.",
    path: "/contact",
    image: "/og/pages/contact",
  });
}

/**
 * The inquiry form is pre-filled from the page that linked here:
 * /contact?industry=restaurants&project=aurum-menu&service=landing-page-development
 */
export default async function ContactPage({ searchParams }: { searchParams: TSearchParams }) {
  const params = await searchParams;
  const [settings, categories, services] = await Promise.all([getSettings(), getCategories(), getServices()]);

  const industryParam = first(params.industry);
  const serviceParam = first(params.service);
  const projectParam = first(params.project);

  const industries = (categories || []).filter((category) => !category.parentId);
  const matchedCategory = (categories || []).find((category) => category.slug === industryParam);
  // Sub-categories prefill their parent industry
  const industry = matchedCategory
    ? industries.find((item) => item.id === (matchedCategory.parentId || matchedCategory.id))?.name
    : undefined;
  const service = (services || []).find((item) => item.slug === serviceParam)?.title;
  const project = projectParam ? await getProject(projectParam).catch(() => null) : null;
  const projectTitle = project && !isRedirect(project) ? project.title : undefined;

  const { contact } = settings;
  const whatsapp = buildWhatsAppLink(contact.whatsappNumber, contact.whatsappMessage, {
    page: projectTitle || industry || "your website",
    project: projectTitle,
    industry,
  });

  return (
    <>
      <PageHero
        eyebrow="Start a project"
        title={
          <>
            Let&apos;s talk about <span className="font-serif font-normal italic tracking-[-0.02em]">your project</span>.
          </>
        }
        intro="Share a few details about your business and what you'd like to achieve. Every inquiry is read personally."
      />

      <section className="bg-paper-100 pb-[clamp(4rem,8vw,7rem)]">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              <TanstackProvider>
                <InquiryForm
                  context={{
                    industry,
                    service,
                    projectSlug: projectTitle ? projectParam : undefined,
                    projectTitle,
                  }}
                  industries={industries.map((item) => item.name)}
                  services={(services || []).map((item) => item.title)}
                  budgetRanges={settings.inquiry.budgetRanges}
                />
              </TanstackProvider>
            </div>

            <aside className="space-y-6 lg:col-span-4">
              <div className="surface-dark rounded-[1.75rem] bg-ink-950 p-7 text-paper-50">
                <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">What happens next</h2>
                <ol className="mt-6 space-y-5">
                  {[
                    ["Personal review", "Your inquiry is read by the developer who would build your project."],
                    ["A thoughtful reply", "You'll get questions or a suggested next step via your preferred method."],
                    ["A clear proposal", "If it's a good fit, you receive a written scope, timeline and price."],
                  ].map(([title, text], index) => (
                    <li key={title} className="flex gap-4">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs text-accent-contrast">
                        {index + 1}
                      </span>
                      <span>
                        <span className="block font-medium">{title}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-ink-300">{text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {(contact.email || whatsapp || contact.phone || contact.location || contact.responseTime) && (
                <div className="rounded-[1.75rem] bg-paper-50 p-7 ring-1 ring-ink-900/10">
                  <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">Prefer to reach out directly?</h2>
                  <ul className="mt-5 space-y-4 text-[0.97rem]">
                    {contact.email && (
                      <li className="flex items-center gap-3">
                        <LuMail aria-hidden className="size-4 text-stone-600" />
                        <a href={`mailto:${contact.email}`} className="break-all underline-offset-4 hover:underline">
                          {contact.email}
                        </a>
                      </li>
                    )}
                    {whatsapp && (
                      <li className="flex items-center gap-3">
                        <LuMessageCircle aria-hidden className="size-4 text-stone-600" />
                        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                          Message on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    )}
                    {contact.phone && (
                      <li className="flex items-center gap-3">
                        <LuPhone aria-hidden className="size-4 text-stone-600" />
                        <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="underline-offset-4 hover:underline">
                          {contact.phone}
                        </a>
                      </li>
                    )}
                    {contact.location && (
                      <li className="flex items-center gap-3">
                        <LuMapPin aria-hidden className="size-4 text-stone-600" />
                        {contact.location}
                      </li>
                    )}
                    {contact.responseTime && (
                      <li className="flex items-center gap-3">
                        <LuClock aria-hidden className="size-4 text-stone-600" />
                        {contact.responseTime}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <p className="flex gap-3 rounded-2xl bg-paper-200/70 p-5 text-sm leading-relaxed text-stone-700">
                <LuShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0" />
                <span>
                  Your details are only used to respond to your inquiry and are never sold or shared for marketing. Read
                  the{" "}
                  <Link href="/privacy" className="font-medium underline underline-offset-4">
                    privacy policy
                  </Link>
                  .
                </span>
              </p>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
