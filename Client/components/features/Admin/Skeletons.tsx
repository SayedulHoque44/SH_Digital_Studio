"use client";

import { Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { Skeleton, SkeletonStatus, SkeletonText } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

/*
 * Admin loading skeletons. They copy the shapes of the real screens (page
 * header, antd cards, tables, form fields, tabs) using the shared Skeleton
 * primitives, so every admin screen loads into its own layout instead of a
 * spinner or generic grey lines. Sizes follow the antd theme in
 * AdminProviders.tsx (controls 38px, cards radius 16, tab bar 46px).
 */

const range = (count: number) => Array.from({ length: count }, (_, index) => index);

// ------------------------------------------------------------------ basics

/** antd button (default size). */
export function AdminButtonSkeleton({ width = "7rem", className }: { width?: string; className?: string }) {
  return <Skeleton className={cn("h-9.5 shrink-0 rounded-[10px]", className)} style={{ width }} />;
}

/** PageHeader.tsx. Pass real text where it is static; omitted parts become placeholders. */
export function PageHeaderSkeleton({
  eyebrow = false,
  title,
  description = true,
  actions = 1,
}: {
  eyebrow?: ReactNode | boolean;
  title?: ReactNode;
  description?: ReactNode | boolean;
  actions?: number;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="mb-2 text-sm text-stone-600">{eyebrow === true ? <SkeletonText lines={1} widths={["5rem"]} /> : eyebrow}</div>}
        <div className="font-display text-[1.9rem] font-semibold leading-tight tracking-[-0.03em] text-ink-950">
          {title ?? <SkeletonText lines={1} widths={["16rem"]} className="[--skeleton-bar:0.7em]" />}
        </div>
        {description && (
          <div className="mt-2 max-w-2xl text-[0.95rem] text-stone-600">
            {description === true ? <SkeletonText lines={1} widths={["min(28rem,100%)"]} /> : description}
          </div>
        )}
      </div>
      {actions > 0 && (
        <div className="flex flex-wrap gap-2">
          {range(actions).map((index) => (
            <AdminButtonSkeleton key={index} width={index === actions - 1 ? "8.5rem" : "6.5rem"} />
          ))}
        </div>
      )}
    </div>
  );
}

/** antd vertical Form.Item: label (22px + 8px) above a control, 24px below. */
export function FieldSkeleton({ label = "38%", control = "h-9.5", className }: { label?: string; control?: string; className?: string }) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="mb-2 flex h-5.5 items-center">
        <Skeleton className="h-3 max-w-full rounded-sm" style={{ width: label }} />
      </div>
      <Skeleton className={cn("w-full rounded-[10px]", control)} />
    </div>
  );
}

/** A grid of form fields, optionally ending with a full-width text area. */
export function FieldsSkeleton({ fields = 6, columns = 2, textarea = true }: { fields?: number; columns?: 1 | 2 | 3; textarea?: boolean }) {
  return (
    <>
      <div className={cn("grid gap-x-4", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-3")}>
        {range(fields).map((index) => (
          <FieldSkeleton key={index} label={["32%", "46%", "28%", "40%"][index % 4]} />
        ))}
      </div>
      {textarea && <FieldSkeleton label="22%" control="h-28" />}
    </>
  );
}

/** antd Tabs bar (46px, ink bar under the first tab). */
export function TabsSkeleton({ tabs = 6 }: { tabs?: number }) {
  return (
    <div className="mb-4 flex gap-8 overflow-hidden border-b border-paper-200">
      {range(tabs).map((index) => (
        <div key={index} className={cn("flex h-11.5 shrink-0 items-center", index === 0 && "border-b-2 border-ink-900/25")}>
          <Skeleton className="h-3.5 rounded-sm" style={{ width: `${4 + ((index * 1.7) % 3.5)}rem` }} />
        </div>
      ))}
    </div>
  );
}

/** The tabbed form card used by every editor. */
export function TabsCardSkeleton({ tabs = 6, fields = 6 }: { tabs?: number; fields?: number }) {
  return (
    <Card>
      <TabsSkeleton tabs={tabs} />
      <FieldsSkeleton fields={fields} />
    </Card>
  );
}

/** Small side card of an editor (Publishing, Notes …). */
function SideCardSkeleton({ fields }: { fields: number }) {
  return (
    <Card title={<SkeletonText lines={1} widths={["7rem"]} />}>
      {range(fields).map((index) => (
        <FieldSkeleton key={index} label={index % 2 ? "45%" : "30%"} className="last:mb-0" />
      ))}
    </Card>
  );
}

/** Stat / summary tile (Dashboard Stat, Clients SummaryTile, renewal tiles). */
function TileSkeleton({ value = "h-8" }: { value?: string }) {
  return (
    <div className="rounded-2xl bg-paper-50 p-5 ring-1 ring-paper-300/70">
      <SkeletonText lines={1} widths={["58%"]} className="text-sm" />
      <Skeleton className={cn("mt-2 w-24 rounded-md", value)} />
      <SkeletonText lines={1} widths={["70%"]} className="mt-2 text-xs" />
    </div>
  );
}

function TilesSkeleton({ count = 4, value }: { count?: number; value?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {range(count).map((index) => (
        <TileSkeleton key={index} value={value} />
      ))}
    </div>
  );
}

/** Two-line rows inside a card (recent inquiries, renewals, changes). */
function ListRowsSkeleton({ rows = 3, tag = true }: { rows?: number; tag?: boolean }) {
  return (
    <div className="divide-y divide-paper-200">
      {range(rows).map((index) => (
        <div key={index} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <div className="min-w-0 flex-1">
            <SkeletonText lines={1} widths={[index % 2 ? "55%" : "70%"]} />
            <SkeletonText lines={1} widths={["40%"]} className="text-xs" />
          </div>
          {tag && <Skeleton className="h-5.5 w-16 shrink-0 rounded-md" />}
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ tables

/** Placeholder cells for a real antd Table (see skeletonColumns). */
export const SkeletonCell = {
  line: (width = "60%") => <Skeleton className="h-3.5 max-w-full rounded-sm" style={{ width }} />,
  lines: (first = "70%", second = "45%") => (
    <div className="min-w-24">
      <Skeleton className="h-3.5 max-w-full rounded-sm" style={{ width: first }} />
      <Skeleton className="mt-2 h-3 max-w-full rounded-sm" style={{ width: second }} />
    </div>
  ),
  /** Thumbnail + two lines (projects table) */
  media: () => (
    <div className="flex items-center gap-3">
      <Skeleton className="h-12 w-20 shrink-0 rounded-md" />
      <div className="min-w-24 flex-1">
        <Skeleton className="h-3.5 w-[70%] rounded-sm" />
        <Skeleton className="mt-2 h-3 w-[45%] rounded-sm" />
      </div>
    </div>
  ),
  /** Icon tile + two lines (services table) */
  icon: () => (
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 shrink-0 rounded-xl" />
      <div className="min-w-24 flex-1">
        <Skeleton className="h-3.5 w-[60%] rounded-sm" />
        <Skeleton className="mt-2 h-3 w-[85%] rounded-sm" />
      </div>
    </div>
  ),
  tag: () => <Skeleton className="h-5.5 w-16 rounded-md" />,
  /** Small switch */
  toggle: () => <Skeleton className="h-4 w-7 rounded-full" />,
  /** Switch with "Published"/"Draft" text */
  labelledToggle: () => <Skeleton className="h-5.5 w-20 rounded-full" />,
  actions: (count = 2) => (
    <div className="flex justify-end gap-2">
      {range(count).map((index) => (
        <Skeleton key={index} className="size-6 rounded-md" />
      ))}
    </div>
  ),
};

/**
 * Columns for a real antd Table showing skeleton rows: same headers, widths
 * and responsive breakpoints, each cell replaced by `cells[column key or
 * dataIndex]` (a text line by default).
 */
export function skeletonColumns<T>(columns: ColumnsType<T>, cells: Record<string, ReactNode>): ColumnsType<T> {
  return columns.map((column) => {
    const id = String(column.key ?? ("dataIndex" in column ? column.dataIndex : "") ?? "");
    return { ...column, render: () => cells[id] ?? SkeletonCell.line(), onCell: undefined, sorter: undefined } as typeof column;
  });
}

/** Placeholder rows for skeletonColumns (tables use rowKey="_id"). */
export const skeletonRows = <T,>(count = 8) => range(count).map((index) => ({ _id: `skeleton-${index}` }) as unknown as T);

/** Stand-alone table (before the real table mounts). */
export function TableSkeleton({ columns = 5, rows = 8 }: { columns?: number; rows?: number }) {
  return (
    <div className="overflow-hidden rounded-[10px] bg-white">
      <div className="flex gap-6 border-b border-paper-200 bg-paper-100 px-4 py-4.5">
        {range(columns).map((index) => (
          <div key={index} className={cn("flex-1", index === 0 && "flex-2", index > 2 && "hidden md:block")}>
            <Skeleton className="h-3.5 w-16 rounded-sm" />
          </div>
        ))}
      </div>
      {range(rows).map((row) => (
        <div key={row} className="flex items-center gap-6 border-b border-paper-200 px-4 py-4 last:border-b-0">
          {range(columns).map((index) => (
            <div key={index} className={cn("min-w-0 flex-1", index === 0 && "flex-2", index > 2 && "hidden md:block")}>
              {index === 0 ? SkeletonCell.lines() : SkeletonCell.line(index === columns - 1 ? "40%" : "65%")}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Search / filter controls above a list. */
function FilterBarSkeleton({ widths }: { widths: string[] }) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      {widths.map((width, index) => (
        <Skeleton key={index} className="h-9.5 max-w-full rounded-[10px]" style={{ width }} />
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ screen bodies

/** Dashboard.tsx below its header. */
export function DashboardBodySkeleton() {
  return (
    <>
      <SkeletonStatus label="Loading the dashboard…" />
      <TilesSkeleton />
      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-7" title={<SkeletonText lines={1} widths={["8rem"]} />}>
          <Skeleton className="mb-4 h-2 w-full rounded-full" />
          <div className="divide-y divide-paper-200">
            {range(8).map((index) => (
              <div key={index} className="flex items-center gap-3 py-3">
                <Skeleton className="size-5 shrink-0 rounded-full" />
                <SkeletonText lines={1} widths={[["60%", "45%", "70%", "52%"][index % 4]]} className="flex-1 text-[0.95rem]" />
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-6 xl:col-span-5">
          {[3, 3, 2].map((rows, index) => (
            <Card key={index} title={<SkeletonText lines={1} widths={["7.5rem"]} />}>
              <ListRowsSkeleton rows={rows} />
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

/** ClientsManager.tsx below its header. */
export function ClientsBodySkeleton() {
  return (
    <>
      <SkeletonStatus label="Loading client projects…" />
      <TilesSkeleton value="h-7" />
      <Card className="mt-6!" title={<SkeletonText lines={1} widths={["8rem"]} />}>
        <ListRowsSkeleton rows={2} />
      </Card>
      <div className="mb-4 mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-8 w-full max-w-80 rounded-[10px]" />
        <Skeleton className="h-9.5 w-full rounded-[10px] md:max-w-sm" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {range(6).map((index) => (
          <div key={index} className="flex flex-col rounded-2xl border-l-4 border-l-paper-300 bg-paper-50 p-5 ring-1 ring-paper-300/70">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <SkeletonText lines={1} widths={["65%"]} className="font-display text-lg [--skeleton-bar:0.7em]" />
                <SkeletonText lines={1} widths={["45%"]} className="mt-0.5 text-sm" />
              </div>
              <Skeleton className="h-5.5 w-14 shrink-0 rounded-md" />
            </div>
            <div className="mt-4 space-y-2 border-t border-paper-200 pt-3">
              {range(2).map((row) => (
                <div key={row} className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <SkeletonText lines={1} widths={["55%"]} className="text-sm" />
                    <SkeletonText lines={1} widths={["70%"]} className="text-xs" />
                  </div>
                  <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** MediaLibrary.tsx grid ("library") and MediaPickerModal.tsx grid ("picker"). */
export function MediaGridSkeleton({ variant = "library", count = 12 }: { variant?: "library" | "picker"; count?: number }) {
  if (variant === "picker") {
    return (
      <>
        <SkeletonStatus label="Loading media…" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {range(count).map((index) => (
            <Skeleton key={index} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      </>
    );
  }
  return (
    <>
      <SkeletonStatus label="Loading media…" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
        {range(count).map((index) => (
          <div key={index} className="overflow-hidden rounded-xl bg-paper-50 ring-1 ring-paper-300/70">
            <Skeleton className="aspect-4/3 w-full rounded-none" />
            <div className="px-3 py-2">
              <SkeletonText lines={1} widths={["75%"]} className="text-sm" />
              <SkeletonText lines={1} widths={["50%"]} className="text-xs" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Record editors (project, service, client project). `eyebrow` is the real
 * "← Back" link so it stays usable while the record loads.
 */
export function EditorSkeleton({
  eyebrow,
  tabs = 6,
  sidebar = false,
  tiles = 0,
  label = "Loading…",
}: {
  eyebrow?: ReactNode;
  tabs?: number;
  /** Project editor: settings column on the right */
  sidebar?: boolean;
  /** Client editor: renewal overview tiles above the form */
  tiles?: number;
  label?: string;
}) {
  return (
    <>
      <SkeletonStatus label={label} />
      <PageHeaderSkeleton eyebrow={eyebrow ?? true} description={false} actions={1} />
      {tiles > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {range(tiles).map((index) => (
            <TileSkeleton key={index} value="h-5" />
          ))}
        </div>
      )}
      {sidebar ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <TabsCardSkeleton tabs={tabs} />
          <div className="space-y-4">
            <SideCardSkeleton fields={3} />
            <SideCardSkeleton fields={2} />
            <SideCardSkeleton fields={1} />
          </div>
        </div>
      ) : (
        <TabsCardSkeleton tabs={tabs} />
      )}
    </>
  );
}

/** Category editor drawer body (tabs + fields). */
export function DrawerFormSkeleton({ tabs = 5 }: { tabs?: number }) {
  return (
    <>
      <SkeletonStatus label="Loading category…" />
      <TabsSkeleton tabs={tabs} />
      <FieldSkeleton label="18%" />
      <FieldSkeleton label="24%" />
      <FieldsSkeleton fields={2} />
    </>
  );
}

// ------------------------------------------------------------------ whole screens

/** List screens before their table mounts (shell check, Suspense fallbacks). */
function ListPageSkeleton({ title, actions, filters, chips = 0, columns }: { title: string; actions: number; filters: string[]; chips?: number; columns: number }) {
  return (
    <>
      <PageHeaderSkeleton title={title} actions={actions} />
      {chips > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {range(chips).map((index) => (
            <Skeleton key={index} className="h-8 rounded-full" style={{ width: `${4.5 + (index % 3)}rem` }} />
          ))}
        </div>
      )}
      <FilterBarSkeleton widths={filters} />
      <TableSkeleton columns={columns} />
    </>
  );
}

/**
 * Skeleton of the admin screen at `pathname` — used while the shell checks
 * the session and as the Suspense fallback of pages that read the URL.
 * Static page titles are real text; everything that comes from data is a
 * placeholder.
 */
export function AdminPageSkeleton({ pathname }: { pathname: string }) {
  const path = pathname.replace(/\/+$/, "") || "/admin";
  const [, , section, id] = path.split("/");

  switch (section) {
    case undefined:
      return (
        <>
          <PageHeaderSkeleton title="Dashboard" actions={2} />
          <DashboardBodySkeleton />
        </>
      );
    case "projects":
      return id ? <EditorSkeleton tabs={7} sidebar /> : <ListPageSkeleton title="Projects" actions={2} filters={["18rem", "9rem", "11rem", "12.5rem", "10rem"]} columns={6} />;
    case "categories":
      return <ListPageSkeleton title="Categories" actions={2} filters={["18rem"]} columns={5} />;
    case "services":
      return id ? <EditorSkeleton tabs={6} /> : <ListPageSkeleton title="Services" actions={2} filters={[]} columns={4} />;
    case "inquiries":
      return <ListPageSkeleton title="Inquiries" actions={0} chips={8} filters={["18rem", "12rem", "16rem", "9rem"]} columns={5} />;
    case "clients":
      return id ? (
        <EditorSkeleton tabs={9} tiles={id === "new" ? 0 : 2} />
      ) : (
        <>
          <PageHeaderSkeleton title="Clients" actions={1} />
          <ClientsBodySkeleton />
        </>
      );
    case "media":
      return (
        <>
          <PageHeaderSkeleton title="Media library" actions={1} />
          <FilterBarSkeleton widths={["20rem", "13rem"]} />
          <MediaGridSkeleton />
        </>
      );
    case "profile":
      return (
        <>
          <PageHeaderSkeleton title="Profile & about page" actions={2} />
          <TabsCardSkeleton tabs={6} />
        </>
      );
    case "settings":
      return (
        <>
          <PageHeaderSkeleton title="Site settings" actions={2} />
          <TabsCardSkeleton tabs={9} />
        </>
      );
    case "account":
      return (
        <>
          <PageHeaderSkeleton title="Account & security" actions={0} />
          <div className="space-y-6">
            {[2, 3, 1].map((fields, index) => (
              <Card key={index} title={<SkeletonText lines={1} widths={["8rem"]} />}>
                <FieldsSkeleton fields={fields} columns={1} textarea={false} />
              </Card>
            ))}
          </div>
        </>
      );
    default:
      return (
        <>
          <PageHeaderSkeleton />
          <TabsCardSkeleton />
        </>
      );
  }
}

/** AdminShell while it checks the session: the whole shell, with the current screen inside. */
export function AdminShellSkeleton({ pathname }: { pathname: string }) {
  return (
    <div className="min-h-dvh bg-paper-100">
      <SkeletonStatus label="Checking your session…" />
      {/* Sidebar (a drawer below lg) */}
      <aside className="surface-dark fixed inset-y-0 left-0 z-20 hidden w-62 flex-col bg-ink-950 lg:flex">
        <div className="flex h-16 items-center px-6">
          <Logo tone="light" size="sm" />
        </div>
        <div className="flex-1 space-y-1 px-2 pt-1">
          {range(9).map((index) => (
            <div key={index} className="mx-1 flex h-10 items-center gap-2.5 px-4">
              <Skeleton className="size-4.5 shrink-0 rounded-sm" />
              <Skeleton className="h-3 rounded-sm" style={{ width: `${4.5 + ((index * 1.3) % 3)}rem` }} />
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 p-3">
          <div className="flex h-10 items-center gap-3 px-3">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-3 w-24 rounded-sm" />
          </div>
        </div>
      </aside>
      <div className="lg:ml-62">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-paper-300/70 bg-paper-50 px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg lg:hidden" />
            <span className="hidden text-sm text-stone-600 sm:inline">SH Digital Studio · Content manager</span>
          </div>
          <div className="flex items-center gap-2.5 px-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="hidden space-y-1.5 sm:block">
              <Skeleton className="h-3 w-24 rounded-sm" />
              <Skeleton className="h-2.5 w-32 rounded-sm" />
            </div>
          </div>
        </header>
        <div className="px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto w-full max-w-350">
            <AdminPageSkeleton pathname={pathname} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Sign-in page before the form mounts (it reads ?next= from the URL). */
export function LoginSkeleton() {
  return (
    <div className="surface-dark relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink-950 px-4 py-16">
      <div aria-hidden className="bg-grid-ink pointer-events-none absolute inset-0 opacity-70 mask-fade-y" />
      <SkeletonStatus label="Loading sign-in…" />
      <div className="relative w-full max-w-105">
        <div className="mb-8 flex justify-center">
          <Logo tone="light" size="md" />
        </div>
        <div className="surface-light rounded-3xl bg-paper-50 p-8 shadow-2xl ring-1 ring-white/10 sm:p-10">
          <p className="font-display text-2xl font-semibold tracking-[-0.025em] text-ink-950">Sign in to the studio</p>
          <p className="mt-2 text-sm text-stone-600">Manage projects, pages, settings and inquiries.</p>
          <div className="mt-6">
            <FieldSkeleton label="2.5rem" control="h-12" />
            <FieldSkeleton label="4rem" control="h-12" />
            <Skeleton className="h-12 w-full rounded-[10px]" />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-ink-400">
          Admin accounts are created with <code className="text-ink-300">npm run seed:admin</code> on the server.
        </p>
      </div>
    </div>
  );
}
