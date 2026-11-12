import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import type { CSSProperties } from "react";
import { LuSearch } from "react-icons/lu";
import AutoSubmit from "@/components/features/Projects/AutoSubmit";
import ProjectCard from "@/components/features/Projects/ProjectCard";
import WorkResults from "@/components/features/Projects/WorkResults";
import EmptyState from "@/components/shared/EmptyState";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import { getCategories, getProjects, getSettings } from "@/features/Public/apis/public.api";
import type { IProjectCard, TProjectType } from "@/features/Public/interface/public.interface";
import { PROJECT_TYPE_PLURALS } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { readWorkFilters } from "@/lib/workFilters";

const PAGE_SIZE = 24;
const SORTS = [
  { value: "order", label: "Curated order" },
  { value: "newest", label: "Newest first" },
  { value: "title", label: "A–Z" },
];

type TSearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) || "";

export async function generateMetadata({ searchParams }: { searchParams: TSearchParams }): Promise<Metadata> {
  const settings = await getSettings();
  const params = await searchParams;
  const filtered = Object.keys(params).length > 0;
  return buildMetadata({
    settings,
    title: "Work — websites & applications",
    description:
      "Explore live websites, concept demos and applications by SH Digital Studio. Filter by project type or industry.",
    path: "/work",
    image: "/og/pages/work",
    // Filtered variations stay crawlable but are not indexed separately
    noIndex: filtered,
  });
}

const buildHref = (params: Record<string, string>) => {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value));
  const qs = query.toString();
  return qs ? `/work?${qs}` : "/work";
};

/**
 * All listed projects are fetched once (cached) and filtered here on the
 * server, so filters are real URLs (/work?type=website) that work without
 * JavaScript and give accurate counts. For catalogues well beyond 100
 * projects, switch to the API's server-side filtering + pagination.
 */
export default async function WorkPage({ searchParams }: { searchParams: TSearchParams }) {
  const params = await searchParams;
  // Shared with the results skeleton (WorkResults), which reads the same
  // filters from the URL a visitor is navigating to
  const filters = readWorkFilters((name) => first(params[name]));
  const { type, category, query, sort, page } = filters;

  const [all, categories] = await Promise.all([getProjects("limit=100&sort=order"), getCategories()]);
  const projects = all?.result || [];

  // Facet counts per project type
  const typeCounts = projects.reduce<Partial<Record<TProjectType, number>>>((acc, project) => {
    acc[project.projectType] = (acc[project.projectType] || 0) + 1;
    return acc;
  }, {});

  const categoryOptions = (categories || []).filter((item) => item.projectCount > 0);
  const selectedCategory = categoryOptions.find((item) => item.slug === category);
  const childSlugs = selectedCategory
    ? new Set(
        [selectedCategory.slug, ...(categories || []).filter((item) => item.parentId === selectedCategory.id).map((item) => item.slug)],
      )
    : null;

  const needle = query.toLowerCase();
  const matches = (project: IProjectCard) =>
    !needle ||
    [project.title, project.summary, project.subcategory, project.brandName, ...project.tags, ...project.techStack]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(needle));

  let filtered = projects.filter(
    (project) =>
      (!type || project.projectType === type) &&
      (!childSlugs || project.categories.some((item) => childSlugs.has(item.slug))) &&
      matches(project),
  );
  if (sort === "newest") {
    filtered = [...filtered].sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
  } else if (sort === "title") {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  }

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const baseParams = { type, category, q: query, sort: sort === "order" ? "" : sort };
  const hasFilters = Boolean(type || category || query);

  return (
    <>
      <PageHero
        eyebrow="Work"
        title={
          <>
            Websites & applications,{" "}
            <span className="font-serif font-normal italic tracking-[-0.02em]">built to perform</span>.
          </>
        }
        intro="Live websites, concept demos and applications. Filter by type or industry, or search for something specific."
      />

      <section aria-label="Projects" className="bg-paper-100 pb-[clamp(4.5rem,9vw,8rem)]">
        <Container>
          {/* Project type tabs */}
          <nav aria-label="Filter by project type" className="no-scrollbar -mx-4 overflow-x-auto px-4">
            <ul className="flex min-w-max gap-2">
              {[{ key: "", label: "All work", count: projects.length }, ...(Object.keys(typeCounts) as TProjectType[]).map((key) => ({ key, label: PROJECT_TYPE_PLURALS[key], count: typeCounts[key] || 0 }))].map(
                (tab) => {
                  const active = tab.key === type;
                  return (
                    <li key={tab.key || "all"}>
                      <Link
                        href={buildHref({ ...baseParams, type: tab.key })}
                        aria-current={active ? "page" : undefined}
                        scroll={false}
                        className={cn(
                          "inline-flex h-11 items-center gap-2 rounded-full px-5 text-[0.95rem] font-medium transition-colors",
                          active ? "bg-ink-950 text-paper-50" : "bg-paper-50 text-ink-800 ring-1 ring-ink-900/10 hover:ring-ink-900/30",
                        )}
                      >
                        {tab.label}
                        <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-white/15" : "bg-paper-200")}>
                          {tab.count}
                        </span>
                      </Link>
                    </li>
                  );
                },
              )}
            </ul>
          </nav>

          {/* Search, industry and sort (GET form - works without JavaScript) */}
          <Form action="/work" scroll={false} className="mt-6 grid gap-3 rounded-[1.4rem] bg-paper-50 p-3 ring-1 ring-ink-900/10 md:grid-cols-[minmax(0,1fr)_220px_200px_auto]">
            <AutoSubmit />
            {type && <input type="hidden" name="type" value={type} />}
            <label className="relative block">
              <span className="sr-only">Search projects</span>
              <LuSearch aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search by name, feature or technology"
                className="peer h-12 w-full rounded-full bg-paper-100 pl-11 pr-4 text-[0.95rem] outline-none ring-1 ring-transparent placeholder:text-transparent focus:ring-ink-900/40"
              />
              {/* Visual placeholder (native one stays for assistive tech); hidden once the visitor types */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-11 right-4 hidden items-center overflow-hidden whitespace-nowrap text-[0.95rem] text-stone-500 peer-placeholder-shown:flex"
              >
                Search by&nbsp;
                <span className="search-hint-words grid font-medium text-ink-800">
                  <span className="search-hint-word">name</span>
                  <span className="search-hint-word">feature</span>
                  <span className="search-hint-word">technology</span>
                </span>
                <span className="search-hint-static">name, feature or technology</span>
              </span>
            </label>
            <label className="block">
              <span className="sr-only">Industry</span>
              <select
                name="category"
                defaultValue={category}
                className="h-12 w-full appearance-none rounded-full bg-paper-100 px-5 text-[0.95rem] outline-none focus:ring-1 focus:ring-ink-900/40"
              >
                <option value="">All industries</option>
                {categoryOptions.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.parentId ? `— ${item.name}` : item.name} ({item.projectCount})
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">Sort</span>
              <select
                name="sort"
                defaultValue={sort}
                className="h-12 w-full appearance-none rounded-full bg-paper-100 px-5 text-[0.95rem] outline-none focus:ring-1 focus:ring-ink-900/40"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="h-12 rounded-full bg-ink-950 px-6 text-[0.95rem] font-medium text-paper-50 hover:bg-ink-700">
              Apply
            </button>
          </Form>

          <div className="mb-10 mt-8 flex flex-wrap items-center justify-between gap-3" aria-live="polite">
            <p className="text-stone-600">
              Showing <strong className="font-semibold text-ink-900">{filtered.length}</strong>{" "}
              {filtered.length === 1 ? "project" : "projects"}
              {selectedCategory ? ` in ${selectedCategory.name}` : ""}
              {query ? ` matching “${query}”` : ""}
            </p>
            {hasFilters && (
              <Link href="/work" scroll={false} className="text-sm font-medium underline underline-offset-4">
                Clear filters
              </Link>
            )}
          </div>

          {/* Shows card skeletons while a filter, search or "Show more" request loads */}
          <WorkResults
            filters={filters}
            more={
              filtered.length > visible.length ? (
                <div className="mt-14 flex justify-center">
                  <ButtonLink href={buildHref({ ...baseParams, page: String(page + 1) })} variant="outline" size="lg">
                    Show more projects
                  </ButtonLink>
                </div>
              ) : null
            }
          >
            {visible.length ? (
              <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
                {visible.map((project, index) => (
                  <li key={project.id} data-reveal style={{ "--reveal-delay": (index % 3) * 90 } as CSSProperties}>
                    <ProjectCard project={project} size="sm" priority={index < 3} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No projects match those filters"
                description="Try a different search or industry — or tell us what you have in mind and we'll show you relevant work."
                action={
                  <>
                    <ButtonLink href="/work" variant="primary">
                      Show all work
                    </ButtonLink>
                    <ButtonLink href="/contact" variant="outline">
                      Start a project
                    </ButtonLink>
                  </>
                }
              />
            )}
          </WorkResults>
        </Container>
      </section>
    </>
  );
}
