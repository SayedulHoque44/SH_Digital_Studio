import { Types } from "mongoose";
import {
  BILLING_CYCLES,
  LEDGER_COST_CATEGORIES,
  LEDGER_INCOME_KINDS,
  CLIENT_LINK_KINDS,
  CLIENT_PROJECT_STATUSES,
  CURRENCIES,
  RENEWAL_DIRECTIONS,
  RENEWAL_KINDS,
} from "./clientProject.constant";

export type TClientLinkKind = (typeof CLIENT_LINK_KINDS)[number];
export type TClientProjectStatus = (typeof CLIENT_PROJECT_STATUSES)[number];
export type TRenewalKind = (typeof RENEWAL_KINDS)[number];
export type TRenewalDirection = (typeof RENEWAL_DIRECTIONS)[number];
export type TBillingCycle = (typeof BILLING_CYCLES)[number];
export type TCurrency = (typeof CURRENCIES)[number];

export type TRenewalPayment = {
  _id?: Types.ObjectId;
  paidOn: Date;
  amount?: number;
  currency?: TCurrency;
  exchangeRate?: number;
  periodFrom?: Date;
  periodTo?: Date;
  note?: string;
};

export type TRenewal = {
  _id?: Types.ObjectId;
  title: string;
  kind: TRenewalKind;
  direction: TRenewalDirection;
  provider?: string;
  amount?: number;
  currency: TCurrency;
  // Local currency per 1 unit of `currency` (e.g. 126 BDT per USD)
  exchangeRate?: number;
  cycle: TBillingCycle;
  paidFrom?: Date | null;
  // The next due date: the service is paid up to this day
  paidUntil?: Date | null;
  remindDaysBefore: number;
  autoRenew?: boolean;
  // false = tracked but not billed yet (e.g. "free for now")
  active: boolean;
  notes?: string;
  payments: TRenewalPayment[];
};

// One month of a client's running budget (amounts converted to BDT for totals)
export type TLedgerMonth = {
  _id?: Types.ObjectId;
  // "2026-10"
  month: string;
  // BDT per 1 USD (or other currency) used for this month's totals
  exchangeRate?: number;
  // BDT left over from the previous month, available again this month
  carriedOver?: number;
  income: {
    _id?: Types.ObjectId;
    kind: (typeof LEDGER_INCOME_KINDS)[number];
    label?: string;
    amount: number;
    currency: TCurrency;
  }[];
  costs: {
    _id?: Types.ObjectId;
    label: string;
    category: (typeof LEDGER_COST_CATEGORIES)[number];
    amount: number;
    currency: TCurrency;
    // e.g. "1,802 GB"
    usage?: string;
    note?: string;
  }[];
  notes?: string;
};

export type TClientProject = {
  name: string;
  status: TClientProjectStatus;
  pinned?: boolean;
  // Still tracked, but left out of the admin's renewal alerts
  muteAlerts?: boolean;
  summary?: string;
  tags?: string[];
  startDate?: Date | null;
  handoverDate?: Date | null;
  techLead?: string;
  client: {
    name: string;
    relation?: string;
    company?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    country?: string;
  };
  links: { _id?: Types.ObjectId; kind: TClientLinkKind; label?: string; url: string }[];
  accounts: {
    _id?: Types.ObjectId;
    provider: string;
    // Icon key chosen in the admin (e.g. "vercel"); empty = guessed from the name
    icon?: string;
    purpose?: string;
    login?: string;
    projectName?: string;
    dashboardUrl?: string;
    notes?: string;
  }[];
  renewals: TRenewal[];
  checklist: { _id?: Types.ObjectId; text: string; done: boolean }[];
  ledger: TLedgerMonth[];
  // Environment variables per app/target; values are encrypted at rest
  envSets: {
    _id?: Types.ObjectId;
    label: string;
    note?: string;
    // The whole .env text; stored as "enc:v1:..." ciphertext
    content: string;
  }[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
