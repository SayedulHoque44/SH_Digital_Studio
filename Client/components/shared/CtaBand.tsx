import { LuArrowRight, LuMessageCircle } from "react-icons/lu";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { IPublicSettings } from "@/features/Public/interface/public.interface";

/**
 * Contextual call-to-action used at the end of project, industry and service
 * pages. The contact link carries context (project/industry/service) so the
 * inquiry form is pre-filled, and WhatsApp appears only when configured.
 */
export default function CtaBand({
  heading,
  text,
  buttonLabel = "Start a project",
  contactHref = "/contact",
  settings,
  whatsappContext,
}: {
  heading: string;
  text?: string;
  buttonLabel?: string;
  contactHref?: string;
  settings: IPublicSettings;
  whatsappContext?: { page?: string; project?: string; industry?: string };
}) {
  const whatsapp = buildWhatsAppLink(settings.contact.whatsappNumber, settings.contact.whatsappMessage, whatsappContext);
  return (
    <section className="bg-paper-100 py-[clamp(4rem,8vw,7rem)]">
      <Container>
        <div
          data-reveal
          className="surface-dark relative overflow-hidden rounded-[2rem] bg-ink-950 px-7 py-14 text-paper-50 sm:px-12 lg:px-16 lg:py-20"
        >
          <div aria-hidden className="bg-grid-ink pointer-events-none absolute inset-0 opacity-60" />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-[28rem] rounded-full opacity-[0.12] blur-3xl"
            style={{ background: "radial-gradient(circle, var(--accent), transparent 65%)" }}
          />
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-display-lg">{heading}</h2>
              {text && <p className="text-lead mt-5 text-ink-300">{text}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={contactHref} variant="accent" size="lg" rightIcon={<LuArrowRight aria-hidden className="size-4" />}>
                {buttonLabel}
              </ButtonLink>
              {whatsapp && (
                <ButtonLink
                  href={whatsapp}
                  variant="outline-light"
                  size="lg"
                  external
                  leftIcon={<LuMessageCircle aria-hidden className="size-4" />}
                >
                  WhatsApp
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
