import type { CSSProperties } from "react";
import { LuArrowRight } from "react-icons/lu";
import ProjectCard from "@/components/features/Projects/ProjectCard";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import type { IHomeData } from "@/features/Public/interface/public.interface";
import { HERO_OVERLAP } from "./heroLayout";

// Editorial rhythm for the grid: wide/narrow pairs, then an even row.
const SPANS = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7", "lg:col-span-6", "lg:col-span-6"];

export default function SelectedWork({ data }: { data: IHomeData["selectedWork"] }) {
  if (!data.projects.length) return null;

  return (
    <section
      aria-labelledby="selected-work-heading"
      className="relative bg-paper-100 pb-[clamp(4.5rem,9vw,8.5rem)]"
      style={{ paddingTop: `calc(${HERO_OVERLAP} + clamp(4rem, 8vw, 7rem))` }}
    >
      <Container>
        <SectionHeading
          id="selected-work-heading"
          eyebrow="Portfolio"
          title={data.heading || "Selected work"}
          intro={data.intro}
          action={
            <ButtonLink href="/work" variant="outline" rightIcon={<LuArrowRight aria-hidden className="size-4" />}>
              View all work
            </ButtonLink>
          }
        />
        <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-12">
          {data.projects.map((project, index) => (
            <div
              key={project.id}
              data-reveal
              className={cn(SPANS[index % SPANS.length], index % 2 === 1 && "lg:mt-24")}
              style={{ "--reveal-delay": (index % 2) * 120 } as CSSProperties}
            >
              <ProjectCard project={project} size={index % 2 === 0 ? "lg" : "md"} priority={index < 2} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
