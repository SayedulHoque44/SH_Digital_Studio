import { CYCLE_MONTHS } from "./clientProject.constant";
import { TClientProject, TRenewal } from "./clientProject.interface";

/*
 * Renewal dates are calendar dates (stored as UTC midnight), so every
 * calculation here works on whole UTC days.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

const utcDay = (date: Date) => Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

export const daysUntil = (due: Date, now = new Date()) => Math.round((utcDay(due) - utcDay(now)) / DAY_MS);

// Oct 13 + 6 months = Apr 13; Jan 31 + 1 month = Feb 28/29
export const addMonths = (date: Date, months: number) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay)));
};

export const periodEnd = (from: Date, cycle: TRenewal["cycle"], cycles = 1) =>
  CYCLE_MONTHS[cycle] ? addMonths(from, CYCLE_MONTHS[cycle] * cycles) : undefined;

export type TRenewalState = "overdue" | "due-soon" | "ok" | "unscheduled" | "inactive";

export const renewalState = (
  renewal: Pick<TRenewal, "active" | "paidUntil" | "remindDaysBefore">,
  now = new Date(),
): { state: TRenewalState; daysLeft: number | null } => {
  if (!renewal.active) return { state: "inactive", daysLeft: null };
  if (!renewal.paidUntil) return { state: "unscheduled", daysLeft: null };
  const daysLeft = daysUntil(new Date(renewal.paidUntil), now);
  if (daysLeft < 0) return { state: "overdue", daysLeft };
  return { state: daysLeft <= renewal.remindDaysBefore ? "due-soon" : "ok", daysLeft };
};

export type TRenewalAlert = {
  projectId: string;
  projectName: string;
  clientName: string;
  renewalId: string;
  title: string;
  kind: TRenewal["kind"];
  direction: TRenewal["direction"];
  amount?: number;
  currency: TRenewal["currency"];
  exchangeRate?: number;
  cycle: TRenewal["cycle"];
  paidUntil: Date;
  daysLeft: number;
  state: "overdue" | "due-soon";
};

type TProjectDoc = Pick<TClientProject, "name" | "client" | "status" | "renewals" | "muteAlerts"> & { _id: unknown };

// Renewals that are overdue or inside their reminder window, most urgent first
export const collectRenewalAlerts = (projects: TProjectDoc[], now = new Date()): TRenewalAlert[] =>
  projects
    .filter(project => project.status !== "ended" && !project.muteAlerts)
    .flatMap(project =>
      (project.renewals || []).flatMap(renewal => {
        const { state, daysLeft } = renewalState(renewal, now);
        if ((state !== "overdue" && state !== "due-soon") || daysLeft === null) return [];
        return [
          {
            projectId: String(project._id),
            projectName: project.name,
            clientName: project.client?.name,
            renewalId: String(renewal._id),
            title: renewal.title,
            kind: renewal.kind,
            direction: renewal.direction,
            amount: renewal.amount ?? undefined,
            currency: renewal.currency,
            exchangeRate: renewal.exchangeRate ?? undefined,
            cycle: renewal.cycle,
            paidUntil: renewal.paidUntil as Date,
            daysLeft,
            state,
          },
        ];
      }),
    )
    .sort((a, b) => a.daysLeft - b.daysLeft);
