"use client";

import { Alert, Button, Card, Empty, Input, Segmented, Tag } from "antd";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LuPin, LuPlus, LuSearch, LuShieldCheck } from "react-icons/lu";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import type { IClientProject, IRenewalAlert, TClientProjectStatus } from "@/features/Admin/interface/admin.interface";
import {
  CLIENT_STATUS_LABELS,
  compareByUrgency,
  formatDay,
  formatMoney,
  hostOf,
  monthlyTotals,
  projectUrgency,
  renewalState,
} from "@/lib/renewals";
import { cn } from "@/lib/utils";
import { moneyStats } from "@/lib/ledger";
import PageHeader from "../PageHeader";
import { ClientsBodySkeleton } from "../Skeletons";
import { MoneyTiles, YearFilter } from "./MoneyParts";
import { AttentionList, STATE_ACCENT, StatePill, usePaymentModal } from "./RenewalParts";

type TFilter = "all" | TClientProjectStatus;

const STATUS_TAG: Record<TClientProjectStatus, string> = { active: "green", "on-hold": "orange", ended: "default" };

function SummaryTile({ label, value, hint, tone }: { label: string; value: React.ReactNode; hint?: React.ReactNode; tone?: "error" | "warning" }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-paper-50 p-5 ring-1 ring-paper-300/70",
        tone === "error" && "bg-error/8 ring-error/30",
        tone === "warning" && "bg-warning/10 ring-warning/40",
      )}
    >
      <p className="text-sm text-stone-600">{label}</p>
      <p className="mt-2 font-display text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-ink-950">{value}</p>
      {hint && <p className="mt-2 text-xs text-stone-600">{hint}</p>}
    </div>
  );
}

// Every renewal that is overdue or inside its reminder window, most urgent first
const toAlerts = (projects: IClientProject[]): IRenewalAlert[] =>
  projects
    .filter((project) => project.status !== "ended" && !project.muteAlerts)
    .flatMap((project) =>
      project.renewals.flatMap((renewal) => {
        const { state, daysLeft } = renewalState(renewal);
        if ((state !== "overdue" && state !== "due-soon") || daysLeft === null) return [];
        return [
          {
            projectId: project._id,
            projectName: project.name,
            clientName: project.client.name,
            renewalId: renewal._id!,
            title: renewal.title,
            kind: renewal.kind,
            direction: renewal.direction,
            amount: renewal.amount ?? undefined,
            currency: renewal.currency,
            exchangeRate: renewal.exchangeRate ?? undefined,
            cycle: renewal.cycle,
            paidUntil: renewal.paidUntil!,
            daysLeft,
            state,
          },
        ];
      }),
    )
    .sort((a, b) => a.daysLeft - b.daysLeft);

function ProjectCard({ project }: { project: IClientProject }) {
  const urgency = projectUrgency(project);
  const live = project.links.find((link) => link.kind === "live") || project.links.find((link) => link.kind === "admin");
  const done = project.checklist.filter((item) => item.done).length;
  return (
    <Link
      href={`/admin/clients/${project._id}`}
      className={cn(
        "group flex h-full flex-col rounded-2xl border-l-4 bg-paper-50 p-4 ring-1 sm:p-5 ring-paper-300/70 transition-shadow hover:shadow-md",
        project.status === "ended" ? "border-l-paper-300 opacity-75" : STATE_ACCENT[urgency.state],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 truncate font-display text-lg font-semibold tracking-[-0.02em] text-ink-950">
            {project.pinned && <LuPin aria-label="Pinned" className="size-4 shrink-0 text-stone-600" />}
            <span className="truncate group-hover:underline">{project.name}</span>
          </h3>
          <p className="mt-0.5 truncate text-sm text-stone-600">
            {project.client.name}
            {project.client.relation ? ` · ${project.client.relation}` : ""}
          </p>
        </div>
        <Tag color={STATUS_TAG[project.status]} className="m-0! shrink-0">
          {CLIENT_STATUS_LABELS[project.status]}
        </Tag>
      </div>

      {live && <p className="mt-2 truncate text-xs text-stone-600">{hostOf(live.url)}</p>}

      <ul className="mt-4 flex-1 space-y-2 border-t border-paper-200 pt-3">
        {project.renewals.length ? (
          project.renewals.map((renewal) => {
            const { state, daysLeft } = renewalState(renewal);
            return (
              <li key={renewal._id} className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0">
                  {/* Long titles (domains, URLs) wrap to 2 lines instead of being cut off on phones */}
                  <span className="line-clamp-2 text-ink-900 wrap-anywhere">{renewal.title}</span>
                  <span className="block text-xs text-stone-600">
                    {[formatMoney(renewal.amount, renewal.currency), renewal.paidUntil && `until ${formatDay(renewal.paidUntil)}`]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </span>
                </span>
                <StatePill state={state} daysLeft={daysLeft} className="mt-0.5 shrink-0" />
              </li>
            );
          })
        ) : (
          <li className="text-sm text-stone-500">No renewals tracked</li>
        )}
      </ul>

      {project.muteAlerts && <p className="mt-3 text-xs text-stone-600">Alerts muted</p>}

      {project.checklist.length > 0 && (
        <p className="mt-3 text-xs text-stone-600">
          Checklist {done}/{project.checklist.length}
        </p>
      )}
    </Link>
  );
}

export default function ClientsManager() {
  const { data, isLoading, isError, refetch } = AdminHooks.useClientProjects();
  const [filter, setFilter] = useState<TFilter>("all");
  const [search, setSearch] = useState("");
  const payment = usePaymentModal();
  const [year, setYear] = useState("all");

  const projects = useMemo(() => [...(data || [])].sort(compareByUrgency), [data]);
  const alerts = useMemo(() => toAlerts(projects), [projects]);
  const income = useMemo(() => monthlyTotals(projects, "receivable"), [projects]);
  const costs = useMemo(() => monthlyTotals(projects, "payable"), [projects]);

  const visible = projects.filter((project) => {
    if (filter !== "all" && project.status !== filter) return false;
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [project.name, project.client.name, project.client.company, project.client.relation, ...(project.tags || []), ...project.links.map((link) => link.url)]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(term));
  });

  const overdue = alerts.filter((alert) => alert.state === "overdue").length;
  const dueSoon = alerts.length - overdue;
  const countOf = (status: TClientProjectStatus) => projects.filter((project) => project.status === status).length;

  const openPayment = (alert: IRenewalAlert) => {
    const project = projects.find((item) => item._id === alert.projectId);
    const renewal = project?.renewals.find((item) => item._id === alert.renewalId);
    if (project && renewal) payment.open(project, renewal);
  };

  return (
    <>
      <PageHeader
        title="Clients"
        description="Client projects, accounts, renewals and payments in one place."
        actions={
          <Link href="/admin/clients/new">
            <Button type="primary" icon={<LuPlus aria-hidden />}>
              New client project
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <ClientsBodySkeleton />
      ) : isError ? (
        <Alert type="error" showIcon title="Could not load client projects" action={<Button onClick={() => refetch()}>Retry</Button>} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile label="Active projects" value={countOf("active")} hint={`${countOf("on-hold")} on hold · ${countOf("ended")} ended`} />
            <SummaryTile
              label="Overdue"
              value={overdue}
              tone={overdue ? "error" : undefined}
              hint={overdue ? "Past the paid-until date" : "Nothing overdue"}
            />
            <SummaryTile
              label="Due soon"
              value={dueSoon}
              tone={dueSoon ? "warning" : undefined}
              hint="Inside each renewal's reminder window"
            />
            <SummaryTile
              label="Monthly income"
              value={income.length ? income.map((item) => formatMoney(item.amount, item.currency)).join(" + ") : "—"}
              hint={
                <>
                  {income.some((item) => item.bdt) && `≈ ৳${Math.round(income.reduce((sum, item) => sum + item.bdt, 0)).toLocaleString("en-US")} / month`}
                  {costs.length > 0 && ` · costs ${costs.map((item) => formatMoney(item.amount, item.currency)).join(" + ")}/mo`}
                  {!income.length && "From active client renewals"}
                </>
              }
            />
          </div>

          {projects.some((project) => project.ledger?.length || project.renewals.some((renewal) => renewal.payments.length)) && (
            <section aria-label="Money across all clients" className="mt-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-950">Money across all clients</h2>
                <YearFilter projects={projects} value={year} onChange={setYear} />
              </div>
              <MoneyTiles stats={moneyStats(projects, year === "all" ? undefined : year)} />
            </section>
          )}

          <Card
            className="mt-6!"
            classNames={{ body: "p-3! sm:p-6!" }}
            title={
              <span className="flex items-center gap-2">
                Needs attention
                {alerts.length > 0 && <Tag color={overdue ? "red" : "gold"} className="m-0!">{alerts.length}</Tag>}
              </span>
            }
          >
            <AttentionList alerts={alerts} onRecordPayment={openPayment} />
          </Card>

          <div className="mt-8 mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Segmented<TFilter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: `All (${projects.length})` },
                { value: "active", label: "Active" },
                { value: "on-hold", label: "On hold" },
                { value: "ended", label: "Ended" },
              ]}
            />
            <Input
              allowClear
              prefix={<LuSearch aria-hidden className="text-stone-500" />}
              placeholder="Search project, client, tag or domain"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="md:max-w-sm!"
            />
          </div>

          {visible.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          ) : (
            <Card>
              <Empty
                description={projects.length ? "No client projects match" : "No client projects yet"}
              >
                {!projects.length && (
                  <Link href="/admin/clients/new">
                    <Button type="primary" icon={<LuPlus aria-hidden />}>
                      Add your first client project
                    </Button>
                  </Link>
                )}
              </Empty>
            </Card>
          )}

          <p className="mt-6 flex items-center gap-2 text-xs text-stone-600">
            <LuShieldCheck aria-hidden className="size-4" /> Private to signed-in admins. Never shown on the website.
          </p>
        </>
      )}
      {payment.modal}
    </>
  );
}
