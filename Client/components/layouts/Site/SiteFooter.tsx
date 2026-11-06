import Link from "next/link";
import type { ReactNode } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import { Logo, LogoSymbol } from "@/components/brand/Logo";
import Container from "@/components/ui/Container";
import SocialIcon, { socialLabel } from "@/components/shared/SocialIcon";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { IPublicSettings } from "@/features/Public/interface/public.interface";

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-eyebrow mb-5 text-ink-400">{title}</h2>
      <ul className="space-y-3 text-[0.95rem]">{children}</ul>
    </div>
  );
}

const linkClass = "text-ink-200 transition-colors hover:text-paper-50";

export default function SiteFooter({ settings }: { settings: IPublicSettings }) {
  const { brand, footer, contact, socialLinks, navigation, closingCta } = settings;
  const whatsapp = buildWhatsAppLink(contact.whatsappNumber, contact.whatsappMessage, {
    page: "your website",
  });
  const year = new Date().getFullYear();

  return (
    <footer className="surface-dark relative overflow-hidden bg-ink-950 text-paper-100">
      <div className="bg-grid-ink pointer-events-none absolute inset-0 opacity-50 mask-fade-y" aria-hidden />
      <Container className="relative">
        {/* Closing call-to-action (Admin -> Site settings -> Homepage -> Final CTA) */}
        {closingCta !== null && (
          <div className="flex flex-col gap-10 border-b border-white/10 py-[clamp(4rem,8vw,7rem)] lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl" data-reveal>
              <p className="text-eyebrow mb-6 text-ink-400">Let&apos;s build something</p>
              <h2 className="text-display-xl">{closingCta?.heading || "Have a project in mind?"}</h2>
              {closingCta?.text && <p className="text-lead mt-6 max-w-xl text-ink-300">{closingCta.text}</p>}
            </div>
            <Link
              href={closingCta?.buttonHref || "/contact"}
              className="group inline-flex h-16 items-center gap-3 self-start rounded-full bg-accent pl-8 pr-3 text-lg font-medium text-accent-contrast transition-[filter] hover:brightness-95 lg:self-auto"
            >
              {closingCta?.buttonLabel || "Start a project"}
              <span className="flex size-11 items-center justify-center rounded-full bg-ink-950 text-paper-50 transition-transform duration-500 group-hover:rotate-45">
                <LuArrowUpRight aria-hidden className="size-5" />
              </span>
            </Link>
          </div>
        )}

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" aria-label={`${brand.name} — home`} className="inline-block">
              <Logo name={brand.name} tone="light" size="md" logoUrl={brand.logoDarkUrl || undefined} />
            </Link>
            {footer.blurb && <p className="mt-5 max-w-sm leading-relaxed text-ink-300">{footer.blurb}</p>}
            {socialLinks.length > 0 && (
              <ul className="mt-7 flex flex-wrap gap-2" aria-label="Social profiles">
                {socialLinks.map((item) => (
                  <li key={`${item.platform}-${item.url}`}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="inline-flex size-11 items-center justify-center rounded-full text-ink-200 ring-1 ring-white/12 transition-colors hover:bg-white/10 hover:text-paper-50"
                    >
                      <SocialIcon platform={item.platform} className="size-4.5" />
                      <span className="sr-only">{item.label || socialLabel(item.platform)} (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title="Studio">
              {navigation.header.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/demos" className={linkClass}>
                  Demo library
                </Link>
              </li>
            </FooterColumn>
          </div>

          {footer.services.length > 0 && (
            <div className="lg:col-span-3">
              <FooterColumn title="Services">
                {footer.services.slice(0, 7).map((item) => (
                  <li key={item.slug}>
                    <Link href={`/services/${item.slug}`} className={linkClass}>
                      {item.title}
                    </Link>
                  </li>
                ))}
              </FooterColumn>
            </div>
          )}

          <div className="space-y-12 lg:col-span-3">
            {footer.industries.length > 0 && (
              <FooterColumn title="Industries">
                {footer.industries.slice(0, 6).map((item) => (
                  <li key={item.slug}>
                    <Link href={`/demos/${item.slug}`} className={linkClass}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </FooterColumn>
            )}
            {(contact.email || whatsapp || contact.phone || contact.location) && (
              <FooterColumn title="Contact">
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`} className={linkClass}>
                      {contact.email}
                    </a>
                  </li>
                )}
                {whatsapp && (
                  <li>
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      WhatsApp<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                )}
                {contact.phone && (
                  <li>
                    <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className={linkClass}>
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contact.location && <li className="text-ink-300">{contact.location}</li>}
              </FooterColumn>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-8 text-sm text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2.5">
            <LogoSymbol className="size-4 text-ink-300" />
            © {year} {brand.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/privacy" className="hover:text-paper-50">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-paper-50">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/sitemap.xml" className="hover:text-paper-50" prefetch={false}>
                Sitemap
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
