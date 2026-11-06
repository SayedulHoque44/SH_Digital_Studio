import { z } from "zod";
import {
  externalUrl,
  idParams,
  objectId,
  optionalExternalUrl,
  optionalText,
  stringList,
  text,
} from "../shared/shared.validation";
import {
  BILLING_CYCLES,
  CLIENT_LINK_KINDS,
  CLIENT_PROJECT_STATUSES,
  CURRENCIES,
  DEFAULT_REMIND_DAYS,
  LEDGER_COST_CATEGORIES,
  LEDGER_INCOME_KINDS,
  RENEWAL_DIRECTIONS,
  RENEWAL_KINDS,
} from "./clientProject.constant";

// "" or null clears a date; "2027-04-13" is stored as that day at UTC midnight
const optionalDate = z
  .union([z.literal(""), z.null(), z.coerce.date()])
  .optional()
  .transform(value => (value instanceof Date ? value : null));
const requiredDate = z.coerce.date({ errorMap: () => ({ message: "Enter a valid date" }) });
const optionalAmount = z.number().min(0).max(1_000_000_000).nullable().optional();
const optionalEmail = z
  .union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid e-mail").max(160)])
  .optional();

const payment = z.object({
  _id: objectId.optional(),
  paidOn: requiredDate,
  amount: optionalAmount,
  currency: z.enum(CURRENCIES).optional(),
  exchangeRate: optionalAmount,
  periodFrom: optionalDate,
  periodTo: optionalDate,
  note: optionalText(300),
});

const renewal = z.object({
  _id: objectId.optional(),
  title: text(120).min(1, "Name this renewal"),
  kind: z.enum(RENEWAL_KINDS).default("other"),
  direction: z.enum(RENEWAL_DIRECTIONS).default("receivable"),
  provider: optionalText(120),
  amount: optionalAmount,
  currency: z.enum(CURRENCIES).default("USD"),
  exchangeRate: optionalAmount,
  cycle: z.enum(BILLING_CYCLES).default("monthly"),
  paidFrom: optionalDate,
  paidUntil: optionalDate,
  remindDaysBefore: z.number().int().min(0).max(365).default(DEFAULT_REMIND_DAYS),
  autoRenew: z.boolean().optional(),
  active: z.boolean().default(true),
  notes: optionalText(2000),
  payments: z.array(payment).max(500).default([]),
});

const money = z.number().min(0).max(1_000_000_000);

const ledgerMonth = z.object({
  _id: objectId.optional(),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Pick a month"),
  exchangeRate: optionalAmount,
  // Can be negative when the previous month overspent
  carriedOver: z.number().min(-1_000_000_000).max(1_000_000_000).nullable().optional(),
  income: z
    .array(
      z.object({
        _id: objectId.optional(),
        kind: z.enum(LEDGER_INCOME_KINDS).default("fund"),
        label: optionalText(120),
        amount: money,
        currency: z.enum(CURRENCIES).default("BDT"),
      }),
    )
    .max(30)
    .default([]),
  costs: z
    .array(
      z.object({
        _id: objectId.optional(),
        label: text(120).min(1, "Name this cost"),
        category: z.enum(LEDGER_COST_CATEGORIES).default("other"),
        amount: money,
        currency: z.enum(CURRENCIES).default("USD"),
        usage: optionalText(80),
        note: optionalText(300),
      }),
    )
    .max(60)
    .default([]),
  notes: optionalText(2000),
});

const clientProjectBody = z.object({
  name: text(160).min(2, "Project name is required"),
  status: z.enum(CLIENT_PROJECT_STATUSES).default("active"),
  pinned: z.boolean().optional(),
  muteAlerts: z.boolean().optional(),
  summary: optionalText(1000),
  tags: stringList(20, 40).optional(),
  startDate: optionalDate,
  handoverDate: optionalDate,
  techLead: optionalText(120),
  client: z.object({
    name: text(120).min(1, "Client name is required"),
    relation: optionalText(160),
    company: optionalText(160),
    email: optionalEmail,
    phone: optionalText(40),
    whatsapp: optionalText(40),
    country: optionalText(80),
  }),
  links: z
    .array(
      z.object({
        _id: objectId.optional(),
        kind: z.enum(CLIENT_LINK_KINDS).default("other"),
        label: optionalText(120),
        url: externalUrl,
      }),
    )
    .max(40)
    .default([]),
  accounts: z
    .array(
      z.object({
        _id: objectId.optional(),
        provider: text(80).min(1, "Which service is this?"),
        icon: z.string().trim().regex(/^[a-z0-9-]{0,30}$/).optional(),
        purpose: optionalText(300),
        // An account e-mail or username - never a password
        login: optionalText(160),
        projectName: optionalText(120),
        dashboardUrl: optionalExternalUrl,
        notes: optionalText(1000),
      }),
    )
    .max(40)
    .default([]),
  renewals: z.array(renewal).max(40).default([]),
  checklist: z
    .array(z.object({ _id: objectId.optional(), text: text(300).min(1), done: z.boolean().default(false) }))
    .max(100)
    .default([]),
  ledger: z
    .array(ledgerMonth)
    .max(600)
    .default([])
    .refine(months => new Set(months.map(item => item.month)).size === months.length, "Each month can only appear once"),
  envSets: z
    .array(
      z.object({
        _id: objectId.optional(),
        label: text(120).min(1, "Name this set, e.g. Server (production)"),
        note: optionalText(300),
        // Pasted .env text (KEY=VALUE lines, comments...)
        content: z.string().max(50000).default(""),
      }),
    )
    .max(20)
    .default([]),
  notes: optionalText(20000),
});

const createClientProjectSchema = z.object({ body: clientProjectBody });

const updateClientProjectSchema = z.object({ params: idParams, body: clientProjectBody });

const listClientProjectsSchema = z.object({
  query: z.object({
    status: z.enum(CLIENT_PROJECT_STATUSES).optional(),
    searchTerm: z.string().trim().max(100).optional(),
  }),
});

const recordPaymentSchema = z.object({
  params: z.object({ id: objectId, renewalId: objectId }),
  body: z.object({
    paidOn: requiredDate,
    // Number of billing cycles this payment covers (ignored for one-time items)
    cycles: z.number().int().min(1).max(60).default(1),
    // Explicit end of the paid period; overrides `cycles`
    periodTo: optionalDate,
    amount: optionalAmount,
    currency: z.enum(CURRENCIES).optional(),
    exchangeRate: optionalAmount,
    note: optionalText(300),
  }),
});

export const ClientProjectValidations = {
  createClientProjectSchema,
  updateClientProjectSchema,
  listClientProjectsSchema,
  recordPaymentSchema,
};
