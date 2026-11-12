import type { ILedgerMonth, IRenewal, TBillingCycle, TCurrency } from "@/features/Admin/interface/admin.interface";
import { COST_CATEGORY_LABELS, formatTaka, monthLabel, monthTotals, toBdt } from "./ledger";
import { describeDays, formatDay, formatMoney as formatAnyMoney, renewalState } from "./renewals";

/*
 * Plain-text statements the owner copies from the admin and sends to a
 * client (WhatsApp, e-mail). Plain text only: no markdown, no tables, so it
 * reads the same in every app. Internal renewal/month notes are left out;
 * payment notes are included because they explain the amount.
 */

// Taka always as ৳1,234 (Intl prints "BDT 1,234")
const formatMoney = (amount?: number | null, currency: TCurrency = "USD") =>
  amount === undefined || amount === null ? "" : currency === "BDT" ? formatTaka(amount) : formatAnyMoney(amount, currency);

const PER_CYCLE: Record<TBillingCycle, string> = {
  monthly: "per month",
  quarterly: "every 3 months",
  "half-yearly": "every 6 months",
  yearly: "per year",
  "one-time": "one-time",
};

// "$20 × 126 = ৳2,520" for foreign amounts with a rate; otherwise just the amount
const withBdt = (amount: number | null | undefined, currency: TCurrency, rate?: number | null) => {
  const money = formatMoney(amount, currency);
  if (!money || currency === "BDT" || !rate) return money;
  return `${money} × ${rate} = ${formatTaka(amount! * rate)}`;
};

const sumByCurrency = (items: { amount?: number | null; currency: TCurrency }[]) => {
  const totals = new Map<TCurrency, number>();
  items.forEach((item) => {
    if (item.amount === undefined || item.amount === null) return;
    totals.set(item.currency, (totals.get(item.currency) || 0) + item.amount);
  });
  return [...totals.entries()].map(([currency, amount]) => formatMoney(amount, currency)).join(" + ");
};

export function renewalStatement(renewal: Partial<IRenewal>, projectName?: string) {
  const currency = renewal.currency || "USD";
  const payments = [...(renewal.payments || [])]
    .filter((payment) => payment?.paidOn)
    .sort((a, b) => a.paidOn.localeCompare(b.paidOn));
  const lines: string[] = [];

  lines.push(`${renewal.title || "Renewal"} — payment statement`);
  if (projectName) lines.push(`Project: ${projectName}`);
  if (renewal.amount !== undefined && renewal.amount !== null) {
    lines.push(`Plan: ${withBdt(renewal.amount, currency, renewal.exchangeRate)} ${renewal.cycle ? PER_CYCLE[renewal.cycle] : ""}`.trim());
  }
  if (renewal.paidUntil) {
    const { state, daysLeft } = renewalState({
      active: renewal.active ?? true,
      paidUntil: renewal.paidUntil,
      remindDaysBefore: renewal.remindDaysBefore ?? 0,
    });
    const status =
      daysLeft === null
        ? ""
        : state === "overdue"
          ? ` (${describeDays(daysLeft)})`
          : daysLeft > 0
            ? ` (${describeDays(daysLeft).replace("Due in", "").trim()} left)`
            : ` (${describeDays(daysLeft)})`;
    lines.push(`Paid until: ${formatDay(renewal.paidUntil)}${status}`);
  }

  lines.push("", `Payments (${payments.length})`);
  if (!payments.length) lines.push("No payments recorded yet.");
  payments.forEach((payment, index) => {
    const amount = withBdt(payment.amount, payment.currency || currency, payment.exchangeRate ?? renewal.exchangeRate);
    lines.push(`${index + 1}. ${formatDay(payment.paidOn)}${amount ? ` — ${amount}` : ""}`);
    if (payment.periodFrom || payment.periodTo) {
      lines.push(`   Covers: ${formatDay(payment.periodFrom) || "?"} → ${formatDay(payment.periodTo) || "?"}`);
    }
    if (payment.note?.trim()) lines.push(`   Note: ${payment.note.trim()}`);
  });

  const paid = payments
    .filter((payment) => payment.amount !== undefined && payment.amount !== null)
    .map((payment) => ({ amount: payment.amount!, currency: payment.currency || currency, rate: payment.exchangeRate ?? renewal.exchangeRate }));
  if (paid.length) {
    const sameCurrency = paid.every((item) => item.currency === paid[0].currency);
    const sameRate = paid.every((item) => item.rate === paid[0].rate);
    const allConverted = paid.every((item) => item.currency === "BDT" || item.rate);
    const total =
      sameCurrency && sameRate
        ? withBdt(paid.reduce((sum, item) => sum + item.amount, 0), paid[0].currency, paid[0].rate)
        : allConverted && paid.some((item) => item.currency !== "BDT")
          ? `${sumByCurrency(paid)} = ${formatTaka(paid.reduce((sum, item) => sum + (toBdt(item.amount, item.currency, item.rate) || 0), 0))}`
          : sumByCurrency(paid);
    lines.push("", `Total paid: ${total}`);
  }
  if (renewal.active !== false && renewal.paidUntil && renewal.cycle !== "one-time") {
    const next = withBdt(renewal.amount, currency, renewal.exchangeRate);
    lines.push(`Next payment due: ${formatDay(renewal.paidUntil)}${next ? ` — ${next}` : ""}`);
  }
  return lines.join("\n");
}

export function monthStatement(month: Partial<ILedgerMonth>, projectName?: string) {
  const totals = monthTotals(month);
  const rate = month.exchangeRate;
  const lines: string[] = [];

  lines.push(`${monthLabel(month.month)} — monthly budget`);
  if (projectName) lines.push(`Project: ${projectName}`);

  const funds = (month.income || []).filter((item) => item?.kind === "fund");
  lines.push("", "Money received");
  funds.forEach((item) => {
    lines.push(`• ${item.label?.trim() || "Fund"}: ${withBdt(item.amount, item.currency, rate)}`);
  });
  if (totals.carriedOver) lines.push(`• Carried over from last month: ${formatTaka(totals.carriedOver)}`);
  if (!funds.length && !totals.carriedOver) lines.push("• Nothing received");
  lines.push(`Available: ${formatTaka(totals.available)}`);

  const costs = (month.costs || []).filter(Boolean);
  lines.push("", "Costs");
  if (!costs.length) lines.push("• No costs");
  costs.forEach((item) => {
    const extra = [item.usage?.trim() && `usage ${item.usage.trim()}`, item.note?.trim()].filter(Boolean).join(", ");
    lines.push(
      `• ${item.label || COST_CATEGORY_LABELS[item.category] || "Cost"}: ${withBdt(item.amount, item.currency, rate)}` +
        (extra ? ` — ${extra}` : ""),
    );
  });
  // "Total costs: $50 × 131 + ৳1,500 = ৳8,050" when foreign costs are converted
  const foreignPart = rate
    ? totals.foreignCosts.map((item) => `${formatMoney(item.amount, item.currency)} × ${rate}`).join(" + ")
    : "";
  const breakdown = foreignPart ? [foreignPart, totals.localCosts ? formatTaka(totals.localCosts) : ""].filter(Boolean).join(" + ") : "";
  lines.push(`Total costs: ${breakdown ? `${breakdown} = ` : ""}${formatTaka(totals.costs)}`);

  lines.push("", totals.remaining < 0 ? `Overspent: ${formatTaka(totals.remaining)}` : `Remaining: ${formatTaka(totals.remaining)} (carries to next month)`);
  if (totals.salary) lines.push(`Salary this month: ${formatTaka(totals.salary)} (separate from the fund)`);
  if (totals.unconverted) lines.push(`Note: ${totals.unconverted} foreign amount(s) have no BDT rate and are not in the totals.`);
  return lines.join("\n");
}
