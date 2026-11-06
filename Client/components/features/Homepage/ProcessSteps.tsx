import type { CSSProperties } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { IFeatureItem } from "@/features/Public/interface/public.interface";

// Numbered, editable delivery process (Admin -> Site settings -> Homepage).
export default function ProcessSteps({
  heading,
  intro,
  steps,
  tone = "paper-alt",
  id = "process-heading",
}: {
  heading?: string;
  intro?: string;
  steps: IFeatureItem[];
  tone?: "paper" | "paper-alt" | "dark" | "white";
  id?: string;
}) {
  if (!steps.length) return null;
  const dark = tone === "dark";

  return (
    <Section tone={tone} aria-labelledby={id}>
      <SectionHeading id={id} eyebrow="Process" title={heading || "How a project runs"} intro={intro} />
      <ol className="grid gap-px overflow-hidden rounded-3xl bg-ink-900/10 sm:grid-cols-2 lg:grid-cols-5 [.surface-dark_&]:bg-white/10">
        {steps.map((step, index) => (
          <li
            key={step.title}
            data-reveal
            style={{ "--reveal-delay": index * 90 } as CSSProperties}
            className={dark ? "relative flex flex-col bg-ink-950 p-7" : "relative flex flex-col bg-paper-50 p-7"}
          >
            <span className="font-display text-[3.25rem] font-semibold leading-none tracking-[-0.04em] text-ink-900/15 [.surface-dark_&]:text-white/15">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span aria-hidden className="mt-6 block h-px w-10 bg-accent" />
            <h3 className="mt-6 font-display text-[1.2rem] font-semibold tracking-[-0.02em]">{step.title}</h3>
            {step.description && (
              <p className="mt-3 text-[0.95rem] leading-relaxed text-stone-600 [.surface-dark_&]:text-ink-300">
                {step.description}
              </p>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
