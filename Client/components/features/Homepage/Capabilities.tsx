import type { CSSProperties } from "react";
import Icon from "@/components/shared/Icon";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { IHomeData } from "@/features/Public/interface/public.interface";

export default function Capabilities({ data }: { data: IHomeData["capabilities"] }) {
  if (!data.items.length && !data.technologies.length) return null;

  return (
    <Section tone="dark" aria-labelledby="capabilities-heading" className="overflow-hidden">
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            id="capabilities-heading"
            eyebrow="Capabilities"
            title={data.heading || "Where craft meets engineering"}
            intro={data.intro}
            className="lg:sticky lg:top-32"
          />
        </div>
        <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:col-span-7">
          {data.items.map((item, index) => (
            <li key={item.title} data-reveal style={{ "--reveal-delay": (index % 2) * 100 } as CSSProperties}>
              <span className="flex size-11 items-center justify-center rounded-xl bg-white/[0.06] text-accent ring-1 ring-white/10">
                <Icon name={item.icon} className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-[1.2rem] font-semibold tracking-[-0.02em] text-paper-50">{item.title}</h3>
              {item.description && <p className="mt-2.5 leading-relaxed text-ink-300">{item.description}</p>}
            </li>
          ))}
        </ul>
      </div>

      {data.technologies.length > 0 && (
        <div className="mt-20 border-t border-white/10 pt-10">
          <p className="text-eyebrow mb-6 text-ink-400">Technologies we work with</p>
          {/* Marquee (pauses on hover, static for reduced motion) */}
          <div className="mask-fade-x relative overflow-hidden" aria-hidden>
            <div className="animate-marquee flex w-max gap-3 hover:[animation-play-state:paused]">
              {[...data.technologies, ...data.technologies].map((tech, index) => (
                <span
                  key={`${tech}-${index}`}
                  className="rounded-full px-5 py-2.5 font-display text-lg tracking-[-0.01em] text-ink-200 ring-1 ring-white/12"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          {/* Accessible, non-animated list for assistive technology */}
          <ul className="sr-only">
            {data.technologies.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
