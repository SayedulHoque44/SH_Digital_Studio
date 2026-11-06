import type {
  IClientProject,
  ILedgerMonth,
  TCurrency,
  TLedgerCostCategory,
  TLedgerIncomeKind,
} from "@/features/Admin/interface/admin.interface";

/*
 * Monthly client budgets. Every total is in BDT: foreign amounts use the
 * month's rate (BDT per 1 unit). "Salary" is your pay; "fund" is money the
 * client sends for running costs, so only funds + carry-over pay for costs.
 */

export const toBdt = (amount: number | null | undefined, currency: TCurrency | undefined, rate?: number | null) => {
  if (amount === undefined || amount === null) return 0;
  if (!currency || currency === "BDT") return amount;
  return rate ? amount * rate : null;
};

export const monthTotals = (month: Partial<ILedgerMonth>) => {
  const rate = month.exchangeRate;
  let unconverted = 0;
  const bdt = (amount: number, currency: TCurrency) => {
    const value = toBdt(amount, currency, rate);
    if (value === null) unconverted += 1;
    return value || 0;
  };
  const sumIncome = (kind: TLedgerIncomeKind) =>
    (month.income || []).filter((item) => item?.kind === kind).reduce((sum, item) => sum + bdt(item.amount || 0, item.currency), 0);

  const salary = sumIncome("salary");
  const fund = sumIncome("fund");
  const carriedOver = month.carriedOver || 0;
  const available = fund + carriedOver;
  const foreign = new Map<TCurrency, number>();
  let costs = 0;
  (month.costs || []).forEach((item) => {
    if (!item) return;
    costs += bdt(item.amount || 0, item.currency);
    if (item.currency && item.currency !== "BDT") foreign.set(item.currency, (foreign.get(item.currency) || 0) + (item.amount || 0));
  });
  const localCosts = (month.costs || []).filter((item) => item?.currency === "BDT").reduce((sum, item) => sum + (item.amount || 0), 0);

  return {
    salary,
    fund,
    carriedOver,
    available,
    costs,
    localCosts,
    foreignCosts: [...foreign.entries()].map(([currency, amount]) => ({ currency, amount })),
    remaining: available - costs,
    unconverted,
  };
};

export type TMoneyStats = {
  months: number;
  salary: number;
  funds: number;
  costs: number;
  renewalIncome: number;
  balance: number;
  latestMonth?: string;
};

const inYear = (value: string | null | undefined, year?: string) => !year || (value || "").startsWith(year);

/**
 * Totals for one or many projects, optionally limited to a year ("2026").
 * `balance` is the money left after the latest recorded month of each project.
 */
export const moneyStats = (projects: IClientProject[], year?: string): TMoneyStats => {
  const stats: TMoneyStats = { months: 0, salary: 0, funds: 0, costs: 0, renewalIncome: 0, balance: 0 };
  projects.forEach((project) => {
    const months = [...(project.ledger || [])].sort((a, b) => a.month.localeCompare(b.month));
    months
      .filter((month) => inYear(month.month, year))
      .forEach((month) => {
        const totals = monthTotals(month);
        stats.months += 1;
        stats.salary += totals.salary;
        stats.funds += totals.fund;
        stats.costs += totals.costs;
      });
    const latest = months.filter((month) => inYear(month.month, year)).at(-1);
    if (latest) {
      stats.balance += monthTotals(latest).remaining;
      if (!stats.latestMonth || latest.month > stats.latestMonth) stats.latestMonth = latest.month;
    }
    project.renewals
      .filter((renewal) => renewal.direction === "receivable")
      .forEach((renewal) =>
        renewal.payments
          .filter((payment) => inYear(payment.paidOn, year))
          .forEach((payment) => {
            stats.renewalIncome += toBdt(payment.amount, payment.currency || renewal.currency, payment.exchangeRate ?? renewal.exchangeRate) || 0;
          }),
      );
  });
  return stats;
};

// Years that have ledger months or renewal payments, newest first
export const moneyYears = (projects: IClientProject[]) =>
  [
    ...new Set(
      projects.flatMap((project) => [
        ...(project.ledger || []).map((month) => month.month.slice(0, 4)),
        ...project.renewals.flatMap((renewal) => renewal.payments.map((payment) => (payment.paidOn || "").slice(0, 4))),
      ]),
    ),
  ]
    .filter(Boolean)
    .sort()
    .reverse();

export const formatTaka = (value: number) => {
  const rounded = Math.round(value);
  return `${rounded < 0 ? "−" : ""}৳${Math.abs(rounded).toLocaleString("en-US")}`;
};

// "2026-10" -> "October 2026"
export const monthLabel = (value?: string, short = false) => {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return value || "New month";
  const [year, month] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", { month: short ? "short" : "long", year: "numeric", timeZone: "UTC" });
};

export const nextMonth = (value?: string) => {
  const now = new Date();
  if (!value) return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [year, month] = value.split("-").map(Number);
  return month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
};

export const COST_CATEGORY_LABELS: Record<TLedgerCostCategory, string> = {
  hosting: "Hosting",
  server: "Server",
  database: "Database",
  storage: "Storage / cloud",
  api: "APIs",
  domain: "Domain",
  staff: "People / management",
  software: "Software",
  other: "Other",
};

export const INCOME_KIND_LABELS: Record<TLedgerIncomeKind, string> = {
  salary: "Salary (your pay)",
  fund: "Fund for costs",
};
