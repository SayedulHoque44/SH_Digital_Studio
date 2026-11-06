import { LuArrowRight } from "react-icons/lu";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";

const LINKS = [
  { href: "/work", label: "Browse all work" },
  { href: "/demos", label: "Website demos by industry" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Start a project" },
];

export default function NotFoundContent() {
  return (
    <section className="surface-dark relative overflow-hidden bg-ink-950 pb-24 pt-[calc(var(--announce-h,0px)+9rem)] text-paper-100 md:pt-[calc(var(--announce-h,0px)+11rem)]">
      <div aria-hidden className="bg-grid-ink pointer-events-none absolute inset-0 opacity-70 mask-fade-y" />
      <Container className="relative">
        <p className="text-eyebrow text-ink-400">Error 404</p>
        <h1 className="text-display-2xl mt-6 max-w-[14ch]">
          This page <span className="font-serif font-normal italic text-accent">moved on</span>.
        </h1>
        <p className="text-lead mt-6 max-w-xl text-ink-300">
          The link may be old, or the project may have been renamed. Here are a few good places to continue.
        </p>
        <ul className="mt-12 grid max-w-3xl gap-3 sm:grid-cols-2">
          {LINKS.map((link) => (
            <li key={link.href}>
              <ButtonLink
                href={link.href}
                variant="outline-light"
                size="lg"
                className="w-full justify-between"
                rightIcon={<LuArrowRight aria-hidden className="size-4" />}
              >
                {link.label}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
