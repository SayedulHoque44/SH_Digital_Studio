import { flattenForSet } from "../shared/shared.utils";
import { DEFAULT_SITE_SETTINGS } from "./siteSettings.defaults";
import { TSiteSettings } from "./siteSettings.interface";
import { SiteSettingsModel } from "./siteSettings.model";

// Returns the singleton, creating it from defaults the first time.
const getSettingsDoc = async () => {
  const existing = await SiteSettingsModel.findOne({ key: "main" }).lean();
  if (existing) return existing;
  await SiteSettingsModel.updateOne(
    { key: "main" },
    { $setOnInsert: DEFAULT_SITE_SETTINGS },
    { upsert: true },
  );
  return SiteSettingsModel.findOne({ key: "main" }).lean();
};

const getSettingsFromDB = async () => getSettingsDoc();

const updateSettingsIntoDB = async (payload: Partial<TSiteSettings>) => {
  const current = await getSettingsDoc();
  const update = flattenForSet(payload as Record<string, unknown>);
  // The legal pages show "last updated" - only move it when their text changes,
  // not on every settings save that happens to include the legal section
  const legalChanged = (["privacyPolicy", "terms"] as const).some(
    field =>
      payload.legal?.[field] !== undefined &&
      payload.legal[field] !== current?.legal?.[field],
  );
  if (legalChanged) update["legal.updatedAt"] = new Date();
  return SiteSettingsModel.findOneAndUpdate(
    { key: "main" },
    { $set: update },
    { new: true, runValidators: true },
  ).lean();
};

export const SiteSettingsServices = {
  getSettingsDoc,
  getSettingsFromDB,
  updateSettingsIntoDB,
};
