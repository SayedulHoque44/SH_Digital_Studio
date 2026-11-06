import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { LuArrowRight, LuMail, LuMapPin, LuQuote } from "react-icons/lu";
import ProfilePortrait from "@/components/features/About/ProfilePortrait";
import ProjectCard from "@/components/features/Projects/ProjectCard";
import CtaBand from "@/components/shared/CtaBand";
import JsonLd from "@/components/shared/JsonLd";
import Markdown from "@/components/shared/Markdown";
import SocialIcon, { socialLabel } from "@/components/shared/SocialIcon";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import { Eyebrow, Section, SectionHeading } from "@/components/ui/Section";
import { getProfile, getSettings } from "@/features/Public/apis/public.api";
import { formatYearMonth } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, profile] = await Promise.all([getSettings(), getProfile()]);
  return buildMetadata({
    settings,
    title: profile?.seo?.title || `About ${profile?.name || "the studio"}`,
    description: profile?.seo?.description || profile?.shortIntro,
    path: "/about",
    image: "/og/pages/about",
    seo: profile?.seo,
    type: "profile",
  });
}

const period = (start?: string, end?: string, current?: boolean) =>
  [formatYearMonth(start), current ? "Present" : formatYearMonth(end)].filter(Boolean).join(" — ");

export default async function AboutPage() {
  const [profile, settings] = await Promise.all([getProfile(), getSettings()]);
  if (!profile) throw new Error("Profile unavailable");

  return (
    <>
      {/* Introduction */}
      <section className="relative overflow-x-clip bg-paper-100 pb-[clamp(3rem,7vw,6rem)] pt-[calc(var(--announce-h,0px)+8.5rem)] md:pt-[calc(var(--announce-h,0px)+10rem)]">
        <div aria-hidden className="bg-grid-paper pointer-events-none absolute inset-0 opacity-60 mask-fade-y" />
        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Eyebrow className="animate-fade-in mb-6">About</Eyebrow>
              <h1 className="animate-rise text-display-xl [--delay:60]">
                Hi, I&apos;m <span className="font-serif font-normal italic tracking-[-0.02em]">{profile.name}</span>.
              </h1>
              {profile.title && <p className="animate-rise mt-5 text-xl font-medium text-ink-800 [--delay:140]">{profile.title}</p>}
              {profile.shortIntro && (
                <p className="animate-rise text-lead mt-5 max-w-[56ch] text-stone-600 [--delay:220]">{profile.shortIntro}</p>
              )}
              {profile.location && (
                <p className="mt-5 inline-flex items-center gap-2 text-stone-600">
                  <LuMapPin aria-hidden className="size-4" /> {profile.location}
                </p>
              )}
              <div className="animate-rise mt-9 flex flex-wrap gap-3 [--delay:320]">
                <ButtonLink href="/contact" variant="primary" size="lg" rightIcon={<LuArrowRight aria-hidden className="size-4" />}>
                  Start a project
                </ButtonLink>
                {profile.contact.email && (
                  <ButtonLink href={`mailto:${profile.contact.email}`} variant="outline" size="lg" leftIcon={<LuMail aria-hidden className="size-4" />}>
                    Email me
                  </ButtonLink>
                )}
                {profile.resumeUrl && (
                  <ButtonLink href={profile.resumeUrl} variant="ghost" size="lg">
                    Résumé
                  </ButtonLink>
                )}
              </div>
              {profile.socialLinks.length > 0 && (
                <ul className="mt-8 flex flex-wrap gap-2" aria-label="Social profiles">
                  {profile.socialLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer me"
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-paper-50 px-4 text-sm ring-1 ring-ink-900/10 hover:ring-ink-900/30"
                      >
                        <SocialIcon platform={link.platform} className="size-4" />
                        {link.label || socialLabel(link.platform)}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="lg:col-span-5">
              <ProfilePortrait
                name={profile.name}
                photo={profile.photo}
                availability={profile.availability}
                priority
                className="mx-auto max-w-md"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Biography */}
      {(profile.bio || profile.specializations.length > 0) && (
        <Section tone="white" aria-labelledby="bio-heading">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h2 id="bio-heading" className="text-display-md mb-8">
                How I work
              </h2>
              <Markdown className="text-[1.1rem]">{profile.bio}</Markdown>
            </div>
            <div className="space-y-6 lg:col-span-5">
              {profile.specializations.length > 0 && (
                <div className="rounded-[1.4rem] bg-paper-100 p-7 ring-1 ring-ink-900/[0.07]">
                  <h3 className="text-eyebrow text-stone-600">Specializations</h3>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {profile.specializations.map((item) => (
                      <li key={item} className="rounded-full bg-paper-50 px-3.5 py-2 text-sm font-medium ring-1 ring-ink-900/10">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {profile.workingArrangements.length > 0 && (
                <div className="rounded-[1.4rem] bg-paper-100 p-7 ring-1 ring-ink-900/[0.07]">
                  <h3 className="text-eyebrow text-stone-600">Working together</h3>
                  <ul className="mt-5 space-y-3">
                    {profile.workingArrangements.map((item) => (
                      <li key={item} className="flex gap-3 leading-relaxed">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-[1px] bg-ink-900" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* Skills - grouped, without invented percentage scores */}
      {profile.skillGroups.length > 0 && (
        <Section tone="dark" aria-labelledby="skills-heading">
          <SectionHeading
            id="skills-heading"
            eyebrow="Skills"
            title="Tools of the trade"
            intro="Technologies I use to design, build and ship websites and web applications."
          />
          <div className="divide-y divide-white/10 border-y border-white/10">
            {profile.skillGroups.map((group) => (
              <div key={group.category} data-reveal className="grid gap-5 py-8 md:grid-cols-12">
                <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-paper-50 md:col-span-4">{group.category}</h3>
                <ul className="flex flex-wrap gap-2 md:col-span-8">
                  {group.skills.map((skill) => (
                    <li
                      key={skill.name}
                      title={skill.description}
                      className="rounded-full bg-white/[0.06] px-4 py-2 text-[0.95rem] text-ink-100 ring-1 ring-white/10"
                    >
                      {skill.name}
                      {skill.proficiencyLabel && <span className="ml-2 text-xs text-ink-400">{skill.proficiencyLabel}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Experience & education (only when added in the admin) */}
      {(profile.experience.length > 0 || profile.education.length > 0) && (
        <Section tone="paper" aria-labelledby="experience-heading">
          <div className="grid gap-16 lg:grid-cols-12">
            {profile.experience.length > 0 && (
              <div className="lg:col-span-7">
                <h2 id="experience-heading" className="text-display-md mb-10">
                  Experience
                </h2>
                <ol className="space-y-10">
                  {profile.experience.map((item) => (
                    <li key={`${item.organization}-${item.startDate}`} data-reveal className="grid gap-2 border-t border-ink-900/10 pt-8">
                      <p className="text-eyebrow text-stone-600">{period(item.startDate, item.endDate, item.isCurrent)}</p>
                      <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">
                        {item.position} <span className="font-normal text-stone-600">· {item.organization}</span>
                      </h3>
                      {(item.employmentType || item.location) && (
                        <p className="text-sm text-stone-600">{[item.employmentType, item.location].filter(Boolean).join(" · ")}</p>
                      )}
                      {item.description && <p className="mt-2 leading-relaxed text-stone-700">{item.description}</p>}
                      {item.responsibilities.length > 0 && (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-700">
                          {item.responsibilities.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      )}
                      {item.achievements.length > 0 && (
                        <ul className="mt-2 space-y-1 text-stone-700">
                          {item.achievements.map((line) => (
                            <li key={line} className="flex gap-2">
                              <span aria-hidden>→</span>
                              {line}
                            </li>
                          ))}
                        </ul>
                      )}
                      {item.technologies.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {item.technologies.map((tech) => (
                            <li key={tech} className="rounded-full bg-paper-200 px-3 py-1 text-xs font-medium">
                              {tech}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {profile.education.length > 0 && (
              <div className="lg:col-span-5">
                <h2 className="text-display-md mb-10">Education</h2>
                <ol className="space-y-8">
                  {profile.education.map((item) => (
                    <li key={`${item.institution}-${item.qualification}`} className="rounded-2xl bg-paper-50 p-6 ring-1 ring-ink-900/10">
                      <p className="text-eyebrow text-stone-600">{period(item.startDate, item.endDate)}</p>
                      <h3 className="mt-2 font-display text-lg font-semibold tracking-[-0.02em]">{item.qualification}</h3>
                      <p className="text-stone-600">
                        {item.institution}
                        {item.field ? ` · ${item.field}` : ""}
                      </p>
                      {item.description && <p className="mt-3 text-sm leading-relaxed text-stone-700">{item.description}</p>}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </Section>
      )}

      {profile.capabilities.length > 0 && (
        <Section tone="white" aria-labelledby="capabilities-heading">
          <SectionHeading id="capabilities-heading" eyebrow="Strengths" title="What I bring to a project" size="md" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {profile.capabilities.map((item, index) => (
              <li
                key={item.title}
                data-reveal
                style={{ "--reveal-delay": index * 70 } as CSSProperties}
                className="rounded-2xl bg-paper-100 p-6 ring-1 ring-ink-900/[0.07]"
              >
                <h3 className="font-display text-lg font-semibold tracking-[-0.02em]">{item.title}</h3>
                {item.description && <p className="mt-2 leading-relaxed text-stone-600">{item.description}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {profile.featuredProjects.length > 0 && (
        <Section tone="paper" aria-labelledby="about-work-heading">
          <SectionHeading
            id="about-work-heading"
            eyebrow="Selected work"
            title="Recent projects"
            size="md"
            action={
              <ButtonLink href="/work" variant="outline" rightIcon={<LuArrowRight aria-hidden className="size-4" />}>
                All work
              </ButtonLink>
            }
          />
          <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
            {profile.featuredProjects.map((project) => (
              <li key={project.id} data-reveal>
                <ProjectCard project={project} size="sm" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {profile.workingProcess.length > 0 && (
        <Section tone="paper-alt" aria-labelledby="working-process-heading">
          <SectionHeading id="working-process-heading" eyebrow="Process" title="Working together" size="md" />
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {profile.workingProcess.map((step, index) => (
              <li key={step.title} data-reveal style={{ "--reveal-delay": index * 70 } as CSSProperties} className="rounded-2xl bg-paper-50 p-6 ring-1 ring-ink-900/10">
                <span className="font-mono text-xs text-stone-500">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.02em]">{step.title}</h3>
                {step.description && <p className="mt-2 text-[0.95rem] leading-relaxed text-stone-600">{step.description}</p>}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Trust: only genuine, approved testimonials and real certifications */}
      {(profile.testimonials.length > 0 || profile.certifications.length > 0) && (
        <Section tone="white" aria-labelledby="trust-heading">
          <SectionHeading id="trust-heading" eyebrow="Trust" title="In their words" size="md" />
          {profile.testimonials.length > 0 && (
            <ul className="grid gap-5 md:grid-cols-2">
              {profile.testimonials.map((item) => (
                <li key={item.quote} className="rounded-[1.4rem] bg-paper-100 p-8 ring-1 ring-ink-900/[0.07]">
                  <LuQuote aria-hidden className="size-6 text-stone-500" />
                  <blockquote className="mt-4 font-display text-[1.2rem] leading-snug tracking-[-0.015em]">{item.quote}</blockquote>
                  <p className="mt-5 text-sm text-stone-600">
                    <span className="font-medium text-ink-900">{item.author}</span>
                    {[item.role, item.company].filter(Boolean).length ? `, ${[item.role, item.company].filter(Boolean).join(", ")}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {profile.certifications.length > 0 && (
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profile.certifications.map((item) => (
                <li key={item.name} className="rounded-2xl bg-paper-100 p-5 ring-1 ring-ink-900/[0.07]">
                  <p className="font-medium">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                        {item.name}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      item.name
                    )}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">{[item.issuer, formatYearMonth(item.date)].filter(Boolean).join(" · ")}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      <CtaBand
        heading="Let's build something together"
        text="Tell me about your business and what you'd like to achieve. I'll reply personally with honest next steps."
        settings={settings}
        whatsappContext={{ page: "About page" }}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absoluteUrl("/about"),
          ...(profile.updatedAt ? { dateModified: profile.updatedAt } : {}),
          mainEntity: {
            "@type": "Person",
            name: profile.name,
            ...(profile.title ? { jobTitle: profile.title } : {}),
            ...(profile.shortIntro ? { description: profile.shortIntro } : {}),
            ...(profile.photo ? { image: absoluteUrl(profile.photo.url) } : {}),
            url: absoluteUrl("/about"),
            worksFor: { "@type": "Organization", name: settings.brand.name, url: absoluteUrl("/") },
            ...(profile.socialLinks.length ? { sameAs: profile.socialLinks.map((link) => link.url) } : {}),
            knowsAbout: profile.skillGroups.flatMap((group) => group.skills.map((skill) => skill.name)).slice(0, 20),
          },
        }}
      />
    </>
  );
}
