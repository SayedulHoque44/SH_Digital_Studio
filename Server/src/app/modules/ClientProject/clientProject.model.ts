import { Schema, model } from "mongoose";
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
import { TClientProject, TLedgerMonth, TRenewal, TRenewalPayment } from "./clientProject.interface";

// Private admin records: nothing in this collection is ever served publicly.

const paymentSchema = new Schema<TRenewalPayment>({
  paidOn: { type: Date, required: true },
  amount: Number,
  currency: { type: String, enum: CURRENCIES },
  exchangeRate: Number,
  periodFrom: Date,
  periodTo: Date,
  note: String,
});

const renewalSchema = new Schema<TRenewal>({
  title: { type: String, required: true, trim: true },
  kind: { type: String, enum: RENEWAL_KINDS, default: "other" },
  direction: { type: String, enum: RENEWAL_DIRECTIONS, default: "receivable" },
  provider: String,
  amount: Number,
  currency: { type: String, enum: CURRENCIES, default: "USD" },
  exchangeRate: Number,
  cycle: { type: String, enum: BILLING_CYCLES, default: "monthly" },
  paidFrom: Date,
  paidUntil: Date,
  remindDaysBefore: { type: Number, default: DEFAULT_REMIND_DAYS },
  autoRenew: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  notes: String,
  payments: { type: [paymentSchema], default: [] },
});

const ledgerMonthSchema = new Schema<TLedgerMonth>({
  month: { type: String, required: true },
  exchangeRate: Number,
  carriedOver: Number,
  income: {
    type: [
      {
        kind: { type: String, enum: LEDGER_INCOME_KINDS, default: "fund" },
        label: String,
        amount: { type: Number, required: true },
        currency: { type: String, enum: CURRENCIES, default: "BDT" },
      },
    ],
    default: [],
  },
  costs: {
    type: [
      {
        label: { type: String, required: true },
        category: { type: String, enum: LEDGER_COST_CATEGORIES, default: "other" },
        amount: { type: Number, required: true },
        currency: { type: String, enum: CURRENCIES, default: "USD" },
        usage: String,
        note: String,
      },
    ],
    default: [],
  },
  notes: String,
});

const clientProjectSchema = new Schema<TClientProject>(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: CLIENT_PROJECT_STATUSES, default: "active" },
    pinned: { type: Boolean, default: false },
    muteAlerts: { type: Boolean, default: false },
    summary: String,
    tags: { type: [String], default: [] },
    startDate: Date,
    handoverDate: Date,
    techLead: String,
    client: {
      name: { type: String, required: true, trim: true },
      relation: String,
      company: String,
      email: { type: String, lowercase: true, trim: true },
      phone: String,
      whatsapp: String,
      country: String,
    },
    links: {
      type: [{ kind: { type: String, enum: CLIENT_LINK_KINDS, default: "other" }, label: String, url: { type: String, required: true } }],
      default: [],
    },
    accounts: {
      type: [
        {
          provider: { type: String, required: true },
          icon: String,
          purpose: String,
          login: String,
          projectName: String,
          dashboardUrl: String,
          notes: String,
        },
      ],
      default: [],
    },
    renewals: { type: [renewalSchema], default: [] },
    checklist: {
      type: [{ text: { type: String, required: true }, done: { type: Boolean, default: false } }],
      default: [],
    },
    ledger: { type: [ledgerMonthSchema], default: [] },
    envSets: {
      type: [
        {
          label: { type: String, required: true },
          note: String,
          // "enc:v1:..." ciphertext, never plain text
          content: { type: String, default: "" },
        },
      ],
      default: [],
    },
    notes: String,
  },
  { timestamps: true },
);

clientProjectSchema.index({ status: 1, updatedAt: -1 });
clientProjectSchema.index({ "renewals.paidUntil": 1 });

export const ClientProjectModel = model<TClientProject>("ClientProject", clientProjectSchema);
