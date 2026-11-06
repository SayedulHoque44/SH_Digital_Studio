import type { CSSProperties } from "react";
import { LuArrowRight } from "react-icons/lu";
import ProfilePortrait from "@/components/features/About/ProfilePortrait";
import ButtonLink from "@/components/ui/ButtonLink";
import { Eyebrow, Section } from "@/components/ui/Section";
import type { IHomeData } from "@/features/Public/interface/public.interface";

export default function AboutPreview({ data }: { data: IHomeData["about"] }) {
  const { profile } = data;
  return (
    <Section tone="white" aria-labelledby="about-heading">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5" data-reveal>
          <ProfilePortrait
            name={profile.name}
            photo={profile.photo}
            availability={profile.availability}
            className="mx-auto max-w-md lg:max-w-none"
          />
        </div>
        <div className="lg:col-span-7" data-reveal style={{ "--reveal-delay": 120 } as CSSProperties}>
          <Eyebrow className="mb-5">About</Eyebrow>
          <h2 id="about-heading" className="text-display-lg">
            {data.heading || "The developer behind the studio"}
          </h2>
          {data.text && <p className="text-lead mt-6 max-w-2xl text-stone-600">{data.text}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div>
              <p className="font-display text-xl font-semibold tracking-[-0.02em]">{profile.name}</p>
              {profile.title && <p className="text-stone-600">{profile.title}</p>}
            </div>
            <ButtonLink href="/about" variant="primary" rightIcon={<LuArrowRight aria-hidden className="size-4" />}>
              {data.ctaLabel || "More about me"}
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}
