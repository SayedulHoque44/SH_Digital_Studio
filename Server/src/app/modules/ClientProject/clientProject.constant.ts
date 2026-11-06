export const CLIENT_PROJECT_STATUSES = ["active", "on-hold", "ended"] as const;

export const CLIENT_LINK_KINDS = ["live", "admin", "staging", "repository", "design", "docs", "other"] as const;

export const RENEWAL_KINDS = [
  "domain",
  "hosting",
  "maintenance",
  "server",
  "database",
  "email",
  "ssl",
  "subscription",
  "other",
] as const;

// receivable = the client pays you · payable = you pay a provider
export const RENEWAL_DIRECTIONS = ["receivable", "payable"] as const;

export const BILLING_CYCLES = ["monthly", "quarterly", "half-yearly", "yearly", "one-time"] as const;

// Months covered by one billing cycle ("one-time" never renews)
export const CYCLE_MONTHS: Record<(typeof BILLING_CYCLES)[number], number> = {
  monthly: 1,
  quarterly: 3,
  "half-yearly": 6,
  yearly: 12,
  "one-time": 0,
};

export const CURRENCIES = ["USD", "BDT", "EUR", "GBP", "SAR", "AED", "INR"] as const;

export const DEFAULT_REMIND_DAYS = 30;

// Monthly budget: "salary" is your pay; "fund" is money the client sends for running costs
export const LEDGER_INCOME_KINDS = ["salary", "fund"] as const;

export const LEDGER_COST_CATEGORIES = [
  "hosting",
  "server",
  "database",
  "storage",
  "api",
  "domain",
  "staff",
  "software",
  "other",
] as const;

export const ClientProjectSearchFields = ["name", "client.name", "client.company", "client.email", "tags"];
