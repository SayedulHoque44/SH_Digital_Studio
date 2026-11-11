import type { CSSProperties } from "react";
import { LuArrowDown, LuArrowRight } from "react-icons/lu";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import type { IHomeData, IProjectCard } from "@/features/Public/interface/public.interface";
import { HERO_OVERLAP } from "./heroLayout";
import HeroShowcase from "./HeroShowcase";

/**
 * Splits the headline around the highlighted phrase so the highlight can be
 * set in the serif italic accent style. Every word animates in with a
 * staggered mask reveal (CSS only).
 */
function AnimatedHeadline({ text, highlight }: { text: string; highlight?: string }) {
  const index = highlight ? text.toLowerCase().indexOf(highlight.toLowerCase()) : -1;
  const parts =
    index >= 0
      ? [
          { text: text.slice(0, index), accent: false },
          { text: text.slice(index, index + highlight!.length), accent: true },
          { text: text.slice(index + highlight!.length), accent: false },
        ]
      : [{ text, accent: false }];

  // Flatten into words; punctuation-only tokens (".", ",") attach to the
  // previous word so they never wrap or float with a space before them.
  const tokens = parts.flatMap((part) =>
    part.text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ word, accent: part.accent })),
  );
  const isPunctuation = (value?: string) => !!value && /^[.,!?;:…]+$/.test(value);

  return (
    <h1 className="text-display-2xl max-w-[16ch] text-paper-50">
      {tokens.map((token, index) => {
        if (isPunctuation(token.word) && index > 0) return null;
        const next = tokens[index + 1];
        const trailing = isPunctuation(next?.word) ? next!.word : "";
        // Another word follows (after any merged punctuation) -> keep a space
        const hasFollowing = index + (trailing ? 2 : 1) < tokens.length;
        return (
          <span key={index} className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] pr-[0.08em] align-bottom">
            <span
              className="animate-rise inline-block"
              style={{ "--delay": 120 + index * 70 } as CSSProperties}
            >
              <span
                className={
                  token.accent ? "font-serif font-normal italic tracking-[-0.02em] text-accent" : undefined
                }
              >
                {token.word}
              </span>
              {trailing}
            </span>
            {hasFollowing ? " " : ""}
          </span>
        );
      })}
    </h1>
  );
}

export default function Hero({
  hero,
  projects,
  liveCount,
}: {
  hero: IHomeData["hero"];
  projects: IProjectCard[];
  liveCount: number;
}) {
  return (
    <section
      aria-label="Introduction"
      className="surface-dark relative overflow-x-clip bg-ink-950 pt-[calc(var(--announce-h,0px)+7.5rem)] text-paper-100 md:pt-[calc(var(--announce-h,0px)+8.75rem)]"
    >
      {/* Atmosphere: hairline grid + a faint accent glow (CSS only) */}
      <div aria-hidden className="bg-grid-ink pointer-events-none absolute inset-0 mask-fade-y opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[20%] -top-[30%] h-[70vw] w-[70vw] rounded-full opacity-[0.10] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 62%)" }}
      />

      <Container className="relative">
        <div className="max-w-[1100px]">
          {hero.eyebrow && (
            <p className="animate-fade-in mb-8 inline-flex items-center gap-3 rounded-full bg-white/[0.05] py-2 pl-3 pr-4 text-sm text-ink-200 ring-1 ring-white/10 [--delay:0]">
              <span className="animate-pulse-dot size-2 rounded-full bg-accent" aria-hidden />
              {hero.eyebrow}
            </p>
          )}
          <AnimatedHeadline text={hero.headline} highlight={hero.highlight} />

          <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            {hero.subtext && (
              <p className="animate-rise text-lead max-w-[46ch] text-ink-300 [--delay:650]">{hero.subtext}</p>
            )}
            <div className="animate-rise flex flex-wrap gap-3 [--delay:800]">
              {hero.primaryCta && (
                <ButtonLink
                  href={hero.primaryCta.href}
                  variant="accent"
                  size="lg"
                  rightIcon={<LuArrowRight aria-hidden className="size-4" />}
                >
                  {hero.primaryCta.label}
                </ButtonLink>
              )}
              {hero.secondaryCta && (
                <ButtonLink href={hero.secondaryCta.href} variant="outline-light" size="lg">
                  {hero.secondaryCta.label}
                </ButtonLink>
              )}
            </div>
          </div>

          {liveCount > 0 && (
            <p className="animate-fade-in mt-7 flex items-center gap-3 text-sm text-ink-400 [--delay:1000]">
              <LuArrowDown aria-hidden className="size-4" />
              {liveCount} live {liveCount === 1 ? "project" : "projects"} you can open and explore today
            </p>
          )}
        </div>
      </Container>

      {projects.length > 0 && (
        <Container size="wide" className="relative z-10 mt-12 md:mt-12">
          <div style={{ marginBottom: `calc(-1 * ${HERO_OVERLAP})` }}>
            <HeroShowcase projects={projects.slice(0, 3)} />
          </div>
        </Container>
      )}
    </section>
  );
}
