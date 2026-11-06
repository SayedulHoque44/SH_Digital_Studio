import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { isSealed, isSecretBoxConfigured, open, seal } from "../../utils/secretBox";
import { escapeRegex } from "../shared/shared.utils";
import { ClientProjectSearchFields } from "./clientProject.constant";
import { TClientProject, TClientProjectStatus, TCurrency } from "./clientProject.interface";
import { ClientProjectModel } from "./clientProject.model";
import { collectRenewalAlerts, periodEnd } from "./clientProject.utils";

/*
 * Private client-project tracker (handover details, accounts, renewals).
 * Admin-only: no public route or mapper ever reads this collection.
 */

// ----------------------------- Env values (encrypted at rest) -----------------------------
type TEnvSets = TClientProject["envSets"];
const KEY_MISSING = "Set DATA_ENCRYPTION_KEY in the server environment to store env values (see Server/README.md)";

// Plain values for the admin; locked = some stored value cannot be decrypted
const openEnvSets = (envSets: TEnvSets = []) => {
  let locked = false;
  const sets = envSets.map(set => {
    if (!isSealed(set.content)) return { ...set, content: set.content || "" };
    try {
      if (!isSecretBoxConfigured()) throw new Error("no key");
      return { ...set, content: open(set.content) };
    } catch {
      locked = true;
      return { ...set, content: "" };
    }
  });
  return { sets, locked };
};

const sealEnvSets = (envSets: TEnvSets = []) => {
  if (envSets.some(set => set.content) && !isSecretBoxConfigured()) throw new AppError(httpStatus.BAD_REQUEST, KEY_MISSING);
  return envSets.map(set => ({ ...set, content: set.content ? seal(set.content) : "" }));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const forAdmin = (project: any) => {
  const { sets, locked } = openEnvSets(project.envSets);
  return { ...project, envSets: sets, envLocked: locked };
};

const getClientProjectsFromDB = async (query: { status?: TClientProjectStatus; searchTerm?: string }) => {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.searchTerm) {
    const pattern = new RegExp(escapeRegex(query.searchTerm.slice(0, 100)), "i");
    filter.$or = ClientProjectSearchFields.map(field => ({ [field]: pattern }));
  }
  // A freelancer's client list is small; the admin sorts it by urgency itself
  // Env values never leave the server in the list
  return ClientProjectModel.find(filter).select("-envSets").sort({ pinned: -1, updatedAt: -1 }).limit(500).lean();
};

const getSingleClientProjectFromDB = async (id: string) => {
  const project = await ClientProjectModel.findById(id).lean();
  if (!project) throw new AppError(httpStatus.NOT_FOUND, "Client project not found");
  return forAdmin(project);
};

const createClientProjectIntoDB = async (payload: TClientProject) => {
  const project = await ClientProjectModel.create({ ...payload, envSets: sealEnvSets(payload.envSets) });
  return forAdmin(project.toObject());
};

const updateClientProjectIntoDB = async (id: string, payload: TClientProject) => {
  const existing = await ClientProjectModel.findById(id).select("envSets").lean();
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, "Client project not found");

  // When stored values can't be decrypted the editor only saw blanks: keep
  // what is stored instead of overwriting it, unless new values were typed.
  const { envSets, ...rest } = payload;
  const update: Record<string, unknown> = { ...rest };
  if (!openEnvSets(existing.envSets).locked) update.envSets = sealEnvSets(envSets);
  else if (envSets?.some(set => set.content)) throw new AppError(httpStatus.BAD_REQUEST, KEY_MISSING);

  const project = await ClientProjectModel.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, runValidators: true },
  ).lean();
  if (!project) throw new AppError(httpStatus.NOT_FOUND, "Client project not found");
  return forAdmin(project);
};

const deleteClientProjectFromDB = async (id: string) => {
  const project = await ClientProjectModel.findByIdAndDelete(id);
  if (!project) throw new AppError(httpStatus.NOT_FOUND, "Client project not found");
};

type TPaymentPayload = {
  paidOn: Date;
  cycles: number;
  periodTo?: Date | null;
  amount?: number | null;
  currency?: TCurrency;
  exchangeRate?: number | null;
  note?: string;
};

/**
 * Records a payment and moves the renewal's due date forward. The paid
 * period starts where the previous one ended (or on the payment date when
 * nothing was paid before), so paying late never shortens the next period.
 */
const recordPaymentIntoDB = async (id: string, renewalId: string, payload: TPaymentPayload) => {
  const project = await ClientProjectModel.findById(id);
  if (!project) throw new AppError(httpStatus.NOT_FOUND, "Client project not found");
  const renewal = project.renewals.find(item => String(item._id) === renewalId);
  if (!renewal) throw new AppError(httpStatus.NOT_FOUND, "Renewal not found");

  const periodFrom = renewal.paidUntil || payload.paidOn;
  const periodTo = payload.periodTo || periodEnd(periodFrom, renewal.cycle, payload.cycles);
  if (periodTo && periodTo <= periodFrom) {
    throw new AppError(httpStatus.BAD_REQUEST, "The paid period must end after it starts");
  }

  renewal.payments.push({
    paidOn: payload.paidOn,
    amount: payload.amount ?? (renewal.amount ? renewal.amount * payload.cycles : undefined),
    currency: payload.currency || renewal.currency,
    exchangeRate: payload.exchangeRate ?? renewal.exchangeRate,
    periodFrom,
    periodTo,
    note: payload.note,
  });
  if (periodTo) renewal.paidUntil = periodTo;
  if (!renewal.paidFrom) renewal.paidFrom = periodFrom;
  await project.save();
  return forAdmin(project.toObject());
};

const findAlerts = async () => {
  const projects = await ClientProjectModel.find({ status: { $ne: "ended" }, "renewals.0": { $exists: true } })
    .select("name client.name status muteAlerts renewals")
    .lean();
  return collectRenewalAlerts(projects);
};

// Small summary for the dashboard and the sidebar badge
const getRenewalAlertsFromDB = async () => {
  const alerts = await findAlerts();
  return {
    overdue: alerts.filter(alert => alert.state === "overdue").length,
    dueSoon: alerts.filter(alert => alert.state === "due-soon").length,
    items: alerts.slice(0, 8),
  };
};

export const ClientProjectServices = {
  getClientProjectsFromDB,
  getSingleClientProjectFromDB,
  createClientProjectIntoDB,
  updateClientProjectIntoDB,
  deleteClientProjectFromDB,
  recordPaymentIntoDB,
  getRenewalAlertsFromDB,
};
