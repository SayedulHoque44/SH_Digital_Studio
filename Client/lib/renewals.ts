import type {
  IClientProject,
  IRenewal,
  TBillingCycle,
  TClientLinkKind,
  TClientProjectStatus,
  TCurrency,
  TRenewalKind,
} from "@/features/Admin/interface/admin.interface";

/*
 * Renewal helpers for the private client tracker. Same rules as the API
 * (Server/src/app/modules/ClientProject/clientProject.utils.ts): dates are
 * calendar days stored as UTC midnight.
 */

export type TRenewalState = "overdue" | "due-soon" | "ok" | "unscheduled" | "inactive";

const DAY_MS = 24 * 60 * 60 * 1000;

const todayUtc = () => {
  const now = new Date();
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
};

// "2027-04-13T00:00:00.000Z" -> "2027-04-13" (value of <input type="date">)
export const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : "");

export const todayInput = () => new Date(todayUtc()).toISOString().slice(0, 10);

export const daysUntil = (value: string) => {
  const due = new Date(value);
  return Math.round((Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate()) - todayUtc()) / DAY_MS);
};

export const renewalState = (renewal: Pick<IRenewal, "active" | "paidUntil" | "remindDaysBefore">) => {
  if (renewal.active === false) return { state: "inactive" as TRenewalState, daysLeft: null };
  if (!renewal.paidUntil) return { state: "unscheduled" as TRenewalState, daysLeft: null };
  const daysLeft = daysUntil(renewal.paidUntil);
  const state: TRenewalState = daysLeft < 0 ? "overdue" : daysLeft <= (renewal.remindDaysBefore ?? 30) ? "due-soon" : "ok";
  return { state, daysLeft };
};

const STATE_RANK: Record<TRenewalState, number> = { overdue: 0, "due-soon": 1, ok: 2, unscheduled: 3, inactive: 4 };

// The most urgent renewal of a project decides its place in the list
export const projectUrgency = (project: IClientProject) => {
  let worst: TRenewalState = "inactive";
  let soonest = Number.POSITIVE_INFINITY;
  (project.renewals || []).forEach((renewal) => {
    const { state, daysLeft } = renewalState(renewal);
    if (STATE_RANK[state] < STATE_RANK[worst]) worst = state;
    if (daysLeft !== null) soonest = Math.min(soonest, daysLeft);
  });
  return { state: worst, soonest };
};

export const compareByUrgency = (a: IClientProject, b: IClientProject) => {
  if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
  if ((a.status === "ended") !== (b.status === "ended")) return a.status === "ended" ? 1 : -1;
  const ua = projectUrgency(a);
  const ub = projectUrgency(b);
  return STATE_RANK[ua.state] - STATE_RANK[ub.state] || ua.soonest - ub.soonest || a.name.localeCompare(b.name);
};

export const formatDay = (value?: string | null, withYear = true) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(withYear ? { year: "numeric" } : {}),
        timeZone: "UTC",
      })
    : "";

export const describeDays = (daysLeft: number) => {
  if (daysLeft === 0) return "Due today";
  if (daysLeft < 0) return `${-daysLeft} day${daysLeft === -1 ? "" : "s"} overdue`;
  if (daysLeft === 1) return "Due tomorrow";
  if (daysLeft < 60) return `Due in ${daysLeft} days`;
  const months = Math.round(daysLeft / 30.4);
  return `Due in ${months} month${months === 1 ? "" : "s"}`;
};

export const formatMoney = (amount?: number | null, currency: TCurrency = "USD") => {
  if (amount === undefined || amount === null) return "";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

// Amount in taka using the stored rate (BDT per 1 unit of the currency)
export const formatBdt = (amount?: number | null, rate?: number | null, currency?: TCurrency) => {
  if (amount === undefined || amount === null || currency === "BDT" || !rate) return "";
  return `≈ ৳${Math.round(amount * rate).toLocaleString("en-US")}`;
};

export const CYCLE_MONTHS: Record<TBillingCycle, number> = { monthly: 1, quarterly: 3, "half-yearly": 6, yearly: 12, "one-time": 0 };

export const CYCLE_LABELS: Record<TBillingCycle, string> = {
  monthly: "Monthly",
  quarterly: "Every 3 months",
  "half-yearly": "Every 6 months",
  yearly: "Yearly",
  "one-time": "One-time",
};

export const CYCLE_SHORT: Record<TBillingCycle, string> = {
  monthly: "/mo",
  quarterly: "/3 mo",
  "half-yearly": "/6 mo",
  yearly: "/yr",
  "one-time": "",
};

// Oct 13 + 6 months = Apr 13; Jan 31 + 1 month = Feb 28/29
export const addMonthsToInput = (value: string, months: number) => {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay))).toISOString().slice(0, 10);
};

/**
 * Monthly recurring totals per currency for active, billable renewals.
 * `receivable` = what clients pay you, `payable` = what you pay providers.
 */
export const monthlyTotals = (projects: IClientProject[], direction: IRenewal["direction"]) => {
  const totals = new Map<TCurrency, { amount: number; bdt: number }>();
  projects
    .filter((project) => project.status !== "ended")
    .flatMap((project) => project.renewals || [])
    .filter((renewal) => renewal.active !== false && renewal.direction === direction && renewal.amount && CYCLE_MONTHS[renewal.cycle])
    .forEach((renewal) => {
      const monthly = renewal.amount! / CYCLE_MONTHS[renewal.cycle];
      const entry = totals.get(renewal.currency) || { amount: 0, bdt: 0 };
      entry.amount += monthly;
      entry.bdt += renewal.currency === "BDT" ? monthly : monthly * (renewal.exchangeRate || 0);
      totals.set(renewal.currency, entry);
    });
  return [...totals.entries()].map(([currency, value]) => ({ currency, ...value }));
};

export const CLIENT_STATUS_LABELS: Record<TClientProjectStatus, string> = {
  active: "Active",
  "on-hold": "On hold",
  ended: "Ended",
};

export const RENEWAL_KIND_LABELS: Record<TRenewalKind, string> = {
  domain: "Domain",
  hosting: "Hosting",
  maintenance: "Maintenance",
  server: "Server / API",
  database: "Database",
  email: "E-mail",
  ssl: "SSL certificate",
  subscription: "Subscription",
  other: "Other",
};

export const LINK_KIND_LABELS: Record<TClientLinkKind, string> = {
  live: "Live site",
  admin: "Admin panel",
  staging: "Staging",
  repository: "Repository",
  design: "Design",
  docs: "Docs",
  other: "Other",
};

export const CURRENCY_OPTIONS: TCurrency[] = ["USD", "BDT", "EUR", "GBP", "SAR", "AED", "INR"];

export const REMIND_PRESETS = [
  { value: 3, label: "3 days before" },
  { value: 7, label: "1 week before" },
  { value: 14, label: "2 weeks before" },
  { value: 30, label: "1 month before" },
  { value: 60, label: "2 months before" },
  { value: 90, label: "3 months before" },
];

export const hostOf = (url?: string) => {
  try {
    return url ? new URL(url).host.replace(/^www\./, "") : "";
  } catch {
    return url || "";
  }
};
