import Markdown from "@/components/shared/Markdown";
import type { IProjectDetail } from "@/features/Public/interface/public.interface";

// Display order and headings. Only filled-in fields render, so a short demo
// and a full case study both look complete - never empty sections.
const SECTIONS: { key: keyof IProjectDetail["caseStudy"]; label: string }[] = [
  { key: "goals", label: "Goals" },
  { key: "problem", label: "The problem" },
  { key: "solution", label: "The solution" },
  { key: "targetAudience", label: "Who it's for" },
  { key: "role", label: "My role" },
  { key: "collaboration", label: "Team & collaboration" },
  { key: "process", label: "Process" },
  { key: "designDecisions", label: "Design decisions" },
  { key: "challenges", label: "Technical challenges" },
  { key: "implementation", label: "Implementation" },
  { key: "timeline", label: "Timeline" },
  { key: "outcomes", label: "Outcomes" },
  { key: "lessons", label: "Lessons learned" },
];

export default function CaseStudySections({ caseStudy }: { caseStudy: IProjectDetail["caseStudy"] }) {
  const sections = SECTIONS.filter((section) => caseStudy[section.key]?.trim());
  if (!sections.length) return null;
  return (
    <div className="divide-y divide-ink-900/10 border-y border-ink-900/10">
      {sections.map((section) => (
        <section key={section.key} data-reveal className="grid gap-4 py-10 md:grid-cols-12 md:gap-10">
          <h2 className="font-display text-[1.35rem] font-semibold tracking-[-0.02em] md:col-span-4">{section.label}</h2>
          <Markdown className="md:col-span-8">{caseStudy[section.key]}</Markdown>
        </section>
      ))}
    </div>
  );
}
