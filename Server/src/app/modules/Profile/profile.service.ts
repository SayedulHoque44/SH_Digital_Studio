import { emptyToNull, flattenForSet, uniqueIds } from "../shared/shared.utils";
import { DEFAULT_PROFILE } from "./profile.defaults";
import { TProfile } from "./profile.interface";
import { ProfileModel } from "./profile.model";

const getProfileDoc = async () => {
  const existing = await ProfileModel.findOne({ key: "main" }).lean();
  if (existing) return existing;
  await ProfileModel.updateOne(
    { key: "main" },
    { $setOnInsert: DEFAULT_PROFILE },
    { upsert: true },
  );
  return ProfileModel.findOne({ key: "main" }).lean();
};

const getProfileFromDB = async () => getProfileDoc();

const updateProfileIntoDB = async (payload: Partial<TProfile>) => {
  await getProfileDoc();
  const data: Record<string, unknown> = { ...payload };
  if (payload.featuredProjects) data.featuredProjects = uniqueIds(payload.featuredProjects);
  if (payload.testimonials) {
    data.testimonials = payload.testimonials.map(item => ({
      ...item,
      project: emptyToNull(item.project),
    }));
  }
  return ProfileModel.findOneAndUpdate(
    { key: "main" },
    { $set: flattenForSet(data) },
    { new: true, runValidators: true },
  ).lean();
};

export const ProfileServices = { getProfileDoc, getProfileFromDB, updateProfileIntoDB };
