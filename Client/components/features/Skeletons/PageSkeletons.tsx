import { HERO_OVERLAP } from "@/components/features/Homepage/heroLayout";
import Container from "@/components/ui/Container";
import { Eyebrow, Section } from "@/components/ui/Section";
import { Skeleton, SkeletonInline, SkeletonText } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import {
  BreadcrumbsSkeleton,
  BrowserFrameSkeleton,
  ButtonSkeleton,
  IndustryCardSkeleton,
  PageHeroSkeleton,
  PhoneFrameSkeleton,
  PillRowSkeleton,
  ProjectCardSkeleton,
  ProjectGridSkeleton,
  SectionHeadingSkeleton,
} from "./SkeletonParts";

/*
 * One skeleton per public page type, shown by NavigationSkeleton while the
 * next page loads. Each mirrors the top of its page (hero + first content
 * block): that is everything visible before the real page replaces it.
 * Markup follows the page files in app/(site)/… and app/page.tsx — when a
 * page's layout changes, update its skeleton here.
 */

// ---------------------------------------------------------------- Home (/)

// components/features/Homepage/HeroShowcase.tsx
function HeroStageSkeleton() {
  return (
    <div className="relative mx-auto h-[clamp(14rem,50vw,38rem)] w-full max-w-310">
      <div className="absolute left-0 top-[18%] z-10 hidden w-[36%] brightness-[0.82] md:block">
        <div className="transform-[perspective(1600px)_rotateY(16deg)_rotateZ(-2deg)]">
          <BrowserFrameSkeleton />
        </div>
      </div>
      <div className="absolute right-0 top-[22%] z-10 hidden w-[36%] brightness-[0.82] md:block">
        <div className="transform-[perspective(1600px)_rotateY(-16deg)_rotateZ(2deg)]">
          <BrowserFrameSkeleton />
        </div>
      </div>
      <div className="absolute inset-x-0 top-0 z-20 mx-auto w-full md:w-[60%]">
        <div className="origin-[50%_100%] transform-[perspective(1800px)_rotateX(8deg)]">
          <BrowserFrameSkeleton />
        </div>
      </div>
      <PhoneFrameSkeleton className="absolute bottom-[-6%] right-[2%] z-30 w-[26%] md:bottom-[-12%] md:right-[16%] md:w-[14%]" />
    </div>
  );
}

// components/features/Homepage/SelectedWork.tsx grid rhythm
const SELECTED_WORK_SPANS = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"];

export function HomeSkeleton() {
  return (
    <>
      {/* Hero.tsx */}
      <section className="surface-dark relative overflow-x-clip bg-ink-950 pt-[calc(var(--announce-h,0px)+7.5rem)] text-paper-100 md:pt-[calc(var(--announce-h,0px)+8.75rem)]">
        <div className="bg-grid-ink pointer-events-none absolute inset-0 mask-fade-y opacity-70" />
        <div
          className="pointer-events-none absolute right-[-20%] top-[-30%] h-[70vw] w-[70vw] rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--accent), transparent 62%)" }}
        />
        <Container className="relative">
          <div className="max-w-275">
            <Skeleton className="mb-8 h-9 w-72 max-w-full rounded-full" />
            <SkeletonText lines={3} widths={["96%", "100%", "58%"]} className="text-display-2xl max-w-[16ch] [--skeleton-bar:0.74em]" />
            <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <SkeletonText lines={2} widths={["100%", "76%"]} className="text-lead max-w-[46ch]" />
              <div className="flex flex-wrap gap-3">
                <ButtonSkeleton size="lg" width="11.5rem" />
                <ButtonSkeleton size="lg" width="8.5rem" />
              </div>
            </div>
            <SkeletonText lines={1} widths={["20rem"]} className="mt-7 text-sm" />
          </div>
        </Container>
        <Container size="wide" className="relative z-10 mt-12">
          <div style={{ marginBottom: `calc(-1 * ${HERO_OVERLAP})` }}>
            <HeroStageSkeleton />
          </div>
        </Container>
      </section>

      {/* SelectedWork.tsx */}
      <section
        className="relative bg-paper-100 pb-[clamp(4.5rem,9vw,8.5rem)]"
        style={{ paddingTop: `calc(${HERO_OVERLAP} + clamp(4rem, 8vw, 7rem))` }}
      >
        <Container>
          <SectionHeadingSkeleton title={["50%"]} action="9.5rem" />
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-12">
            {SELECTED_WORK_SPANS.map((span, index) => (
              <div key={index} className={cn(span, index % 2 === 1 && "lg:mt-24")}>
                <ProjectCardSkeleton size={index % 2 === 0 ? "lg" : "md"} />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

// ---------------------------------------------------------------- /work

export function WorkSkeleton() {
  return (
    <>
      <PageHeroSkeleton eyebrow="3rem" title={["92%", "60%"]} />
      <section className="bg-paper-100 pb-[clamp(4.5rem,9vw,8rem)]">
        <Container>
          {/* Project type tabs */}
          <div className="-mx-4 overflow-hidden px-4">
            <div className="flex gap-2">
              {["7.5rem", "8.5rem", "10rem", "9rem"].map((width, index) => (
                <ButtonSkeleton key={index} width={width} />
              ))}
            </div>
          </div>
          {/* Search, industry, sort, apply */}
          <div className="mt-6 grid gap-3 rounded-[1.4rem] bg-paper-50 p-3 ring-1 ring-ink-900/10 md:grid-cols-[minmax(0,1fr)_220px_200px_auto]">
            <Skeleton className="h-12 rounded-full" />
            <Skeleton className="h-12 rounded-full" />
            <Skeleton className="h-12 rounded-full" />
            <Skeleton className="h-12 rounded-full md:w-22" />
          </div>
          <div className="mb-10 mt-8">
            <SkeletonText lines={1} widths={["11rem"]} />
          </div>
          <ProjectGridSkeleton count={6} />
        </Container>
      </section>
    </>
  );
}

// ---------------------------------------------------------------- /demos

export function DemosSkeleton() {
  return (
    <>
      <PageHeroSkeleton eyebrow="7rem" title={["84%", "48%"]} />
      <div className="bg-paper-100 pb-[clamp(4rem,8vw,7rem)]">
        <Container className="space-y-24">
          {[0, 1].map((group) => (
            <div key={group}>
              <div className="mb-10 flex flex-col gap-6 border-t border-ink-900/10 pt-10 md:flex-row md:items-end md:justify-between">
                <div className="w-full max-w-2xl">
                  <Eyebrow className="mb-4">
                    <SkeletonInline width="5.5rem" />
                  </Eyebrow>
                  <SkeletonText lines={1} widths={["46%"]} className="text-display-md [--skeleton-bar:0.74em]" />
                  <SkeletonText lines={1} widths={["88%"]} className="mt-4" />
                </div>
                <ButtonSkeleton width="11.5rem" />
              </div>
              <ProjectGridSkeleton count={3} />
            </div>
          ))}
        </Container>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- /demos/[slug]

export function DemoCategorySkeleton() {
  return (
    <>
      <PageHeroSkeleton
        tone="dark"
        crumbs={["2.6rem", "3.5rem", "7rem"]}
        eyebrow="7.5rem"
        title={["66%"]}
        actions={["15.5rem", "9rem"]}
      >
        <div className="mt-12 flex flex-col gap-8 border-t border-white/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <PillRowSkeleton widths={["7rem", "8.5rem", "6.5rem"]} />
          <PillRowSkeleton widths={["6.5rem", "7rem", "5.5rem"]} />
        </div>
      </PageHeroSkeleton>
      <section className="bg-paper-100 py-[clamp(4rem,8vw,7rem)]">
        <Container>
          <SectionHeadingSkeleton title={["58%"]} />
          <ProjectGridSkeleton count={2} size="lg" columns="md:grid-cols-2" />
        </Container>
      </section>
    </>
  );
}

// ---------------------------------------------------------------- /industries

export function IndustriesSkeleton() {
  return (
    <>
      <PageHeroSkeleton eyebrow="5.5rem" title={["100%", "82%", "38%"]} />
      <section className="bg-paper-100 pb-[clamp(4rem,8vw,7rem)]">
        <Container>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="md:col-span-2 xl:col-span-3">
              <IndustryCardSkeleton chips={4} />
            </div>
            {[0, 1, 2].map((card) => (
              <IndustryCardSkeleton key={card} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

// ---------------------------------------------------------------- /projects/[slug]

export function ProjectSkeleton() {
  return (
    <>
      {/* Hero */}
      <section className="surface-dark relative overflow-x-clip bg-ink-950 pt-[calc(var(--announce-h,0px)+8.5rem)] text-paper-100 md:pt-[calc(var(--announce-h,0px)+10rem)]">
        <div className="bg-grid-ink pointer-events-none absolute inset-0 opacity-70 mask-fade-y" />
        <Container className="relative">
          <BreadcrumbsSkeleton widths={["2.6rem", "2.6rem", "5.5rem", "7rem"]} className="mb-8" />
          <PillRowSkeleton widths={["5.5rem", "4rem", "6.5rem"]} height="h-5" />
          <div className="mt-7 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <SkeletonText lines={1} widths={["72%"]} className="text-display-xl max-w-[18ch] [--skeleton-bar:0.74em]" />
              <SkeletonText lines={2} widths={["100%", "68%"]} className="text-lead mt-6 max-w-[56ch]" />
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <ButtonSkeleton size="lg" width="10.5rem" />
              <ButtonSkeleton size="lg" width="13rem" />
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm">
            <SkeletonInline width="6.5rem" />
            <SkeletonInline width="6rem" />
            <PillRowSkeleton className="ml-auto" widths={["6.5rem", "7rem", "5.5rem"]} />
          </div>
        </Container>
        {/* ProjectShowcase.tsx */}
        <Container size="wide" className="relative z-10 mt-14">
          <div className="-mb-[clamp(4rem,12vw,11rem)]">
            <div className="relative">
              <BrowserFrameSkeleton className="mx-auto max-w-295" />
              <PhoneFrameSkeleton className="absolute -bottom-10 right-[4%] hidden w-[17%] max-w-57.5 lg:block" />
            </div>
          </div>
        </Container>
      </section>

      {/* Overview + facts */}
      <section className="bg-paper-100 pb-[clamp(4rem,8vw,7rem)] pt-[calc(clamp(4rem,12vw,11rem)+clamp(4rem,7vw,6rem))]">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <SkeletonText lines={1} widths={["5rem"]} className="text-eyebrow mb-5" />
              <SkeletonText lines={5} className="text-[1.0625rem] leading-[1.75]" />
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-[1.4rem] bg-paper-50 p-7 ring-1 ring-ink-900/10">
                <div className="divide-y divide-ink-900/10">
                  {["5rem", "6.5rem", "7.5rem", "4rem", "5.5rem"].map((width, index) => (
                    <div key={index} className="grid grid-cols-[8.5rem_1fr] gap-4 py-3.5 text-[0.95rem] first:pt-0 last:pb-0">
                      <SkeletonText lines={1} widths={[width]} />
                      <SkeletonText lines={1} widths={["70%"]} />
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-ink-900/10 pt-6">
                  <SkeletonText lines={1} widths={["5.5rem"]} className="text-eyebrow mb-3" />
                  <PillRowSkeleton widths={["5rem", "6rem", "4.5rem", "5.5rem"]} height="h-8" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

// ---------------------------------------------------------------- /services

export function ServicesSkeleton() {
  return (
    <>
      <PageHeroSkeleton eyebrow="4.5rem" title={["100%", "70%"]} intro={3} />
      <section className="bg-paper-100 pb-[clamp(4rem,8vw,7rem)]">
        <Container>
          <div className="border-t border-ink-900/15">
            {[0, 1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="grid items-center gap-x-8 gap-y-3 border-b border-ink-900/15 py-8 md:grid-cols-[4rem_minmax(0,1.1fr)_minmax(0,1fr)_auto] md:py-10"
              >
                <SkeletonText lines={1} widths={["1.5rem"]} className="font-mono text-sm" />
                <div className="flex items-center gap-4 font-display text-[clamp(1.5rem,1.1rem+1.3vw,2.4rem)] leading-tight">
                  <Skeleton className="hidden size-7 shrink-0 rounded-lg md:block" />
                  <SkeletonText lines={1} widths={["78%"]} className="min-w-0 flex-1 [--skeleton-bar:0.7em]" />
                </div>
                <SkeletonText lines={2} widths={["100%", "72%"]} className="leading-relaxed" />
                <Skeleton className="hidden size-12 rounded-full md:block" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

// ---------------------------------------------------------------- /services/[slug]

export function ServiceSkeleton() {
  return (
    <>
      <PageHeroSkeleton crumbs={["2.6rem", "4rem", "9rem"]} eyebrow="3.5rem" title={["88%", "46%"]} actions={["11rem", "11.5rem"]} />
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SkeletonText lines={1} widths={["5rem"]} className="text-eyebrow mb-5" />
            <SkeletonText lines={6} className="text-[1.0625rem] leading-[1.75]" />
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-[1.4rem] bg-paper-100 p-7 ring-1 ring-ink-900/7">
              <SkeletonText lines={1} widths={["8rem"]} className="font-display text-xl [--skeleton-bar:0.7em]" />
              <div className="mt-6 space-y-4">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-3 leading-relaxed">
                    <Skeleton className="mt-0.5 size-6 shrink-0 rounded-full" />
                    <SkeletonText lines={1} widths={[item % 2 ? "70%" : "88%"]} className="flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

// ---------------------------------------------------------------- /about

export function AboutSkeleton() {
  return (
    <section className="relative overflow-x-clip bg-paper-100 pb-[clamp(3rem,7vw,6rem)] pt-[calc(var(--announce-h,0px)+8.5rem)] md:pt-[calc(var(--announce-h,0px)+10rem)]">
      <div className="bg-grid-paper pointer-events-none absolute inset-0 opacity-60 mask-fade-y" />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Eyebrow className="mb-6">
              <SkeletonInline width="3.5rem" />
            </Eyebrow>
            <SkeletonText lines={2} widths={["88%", "50%"]} className="text-display-xl [--skeleton-bar:0.74em]" />
            <SkeletonText lines={1} widths={["15rem"]} className="mt-5 text-xl" />
            <SkeletonText lines={3} className="text-lead mt-5 max-w-[56ch]" />
            <SkeletonText lines={1} widths={["9rem"]} className="mt-5" />
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonSkeleton size="lg" width="11rem" />
              <ButtonSkeleton size="lg" width="9rem" />
            </div>
            <PillRowSkeleton className="mt-8" widths={["6.5rem", "7rem", "6rem"]} />
          </div>
          <div className="lg:col-span-5">
            {/* ProfilePortrait.tsx */}
            <Skeleton className="mx-auto aspect-4/5 w-full max-w-md rounded-[1.75rem]" />
          </div>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- /contact

// components/features/Contact/InquiryForm.tsx → Field
function ContactFieldSkeleton({ label = "6rem", control = "h-13", className }: { label?: string; control?: string; className?: string }) {
  return (
    <div className={className}>
      <SkeletonText lines={1} widths={[label]} className="mb-2 text-sm" />
      <Skeleton className={cn("w-full rounded-xl", control)} />
    </div>
  );
}

export function ContactSkeleton() {
  return (
    <>
      <PageHeroSkeleton eyebrow="7.5rem" title={["96%", "56%"]} />
      <section className="bg-paper-100 pb-[clamp(4rem,8vw,7rem)]">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Inquiry form */}
            <div className="lg:col-span-8">
              <div className="rounded-[1.75rem] bg-paper-50/60 p-6 ring-1 ring-ink-900/10 sm:p-9">
                <div className="grid gap-5 sm:grid-cols-2">
                  <ContactFieldSkeleton label="5rem" />
                  <ContactFieldSkeleton label="7rem" />
                  <ContactFieldSkeleton label="7.5rem" />
                  <ContactFieldSkeleton label="4rem" />
                  <ContactFieldSkeleton label="8rem" />
                  <ContactFieldSkeleton label="4.5rem" />
                  <ContactFieldSkeleton label="9rem" className="sm:col-span-2" />
                  <ContactFieldSkeleton label="10rem" control="h-42" className="sm:col-span-2" />
                  <ContactFieldSkeleton label="6.5rem" />
                  <ContactFieldSkeleton label="7rem" />
                </div>
                <div className="mt-7">
                  <SkeletonText lines={1} widths={["10rem"]} className="mb-3 text-sm" />
                  <PillRowSkeleton widths={["5rem", "7rem", "5.5rem", "7rem"]} height="h-11" />
                </div>
                <div className="mt-8">
                  <ButtonSkeleton size="lg" width="11rem" />
                </div>
              </div>
            </div>

            {/* Aside */}
            <div className="space-y-6 lg:col-span-4">
              <div className="surface-dark rounded-[1.75rem] bg-ink-950 p-7">
                <SkeletonText lines={1} widths={["10.5rem"]} className="font-display text-xl [--skeleton-bar:0.7em]" />
                <div className="mt-6 space-y-5">
                  {[0, 1, 2].map((step) => (
                    <div key={step} className="flex gap-4">
                      <Skeleton className="size-7 shrink-0 rounded-full" />
                      <div className="flex-1">
                        <SkeletonText lines={1} widths={["8rem"]} />
                        <SkeletonText lines={2} widths={["100%", "70%"]} className="mt-1 text-sm leading-relaxed" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.75rem] bg-paper-50 p-7 ring-1 ring-ink-900/10">
                <SkeletonText lines={1} widths={["82%"]} className="font-display text-xl [--skeleton-bar:0.7em]" />
                <div className="mt-5 space-y-4 text-[0.97rem]">
                  {["12rem", "10rem", "8rem"].map((width, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Skeleton className="size-4 shrink-0 rounded-sm" />
                      <SkeletonText lines={1} widths={[width]} className="flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

// ---------------------------------------------------------------- /privacy, /terms

// components/features/Legal/LegalPage.tsx
export function LegalSkeleton() {
  return (
    <>
      <PageHeroSkeleton eyebrow="3rem" title={["72%"]} intro={1} />
      <section className="bg-paper-100 pb-[clamp(4rem,8vw,7rem)]">
        <Container size="narrow">
          <div className="rounded-[1.75rem] bg-paper-50 p-7 ring-1 ring-ink-900/10 sm:p-12">
            <div className="text-[1.0625rem] leading-[1.75]">
              <SkeletonText lines={4} />
              <SkeletonText lines={1} widths={["42%"]} className="mt-[1.8em] text-[1.6rem] leading-[1.2] [--skeleton-bar:0.7em]" />
              <SkeletonText lines={5} className="mt-[1.1em]" />
              <SkeletonText lines={3} className="mt-[1.1em]" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
