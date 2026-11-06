import httpStatus from "http-status";
import { Model, Types } from "mongoose";
import AppError from "../../error/AppError";

export const slugify = (value: string) =>
  value
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents: "Café" -> "Cafe"
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";

type TSluggable = { slug: string; previousSlugs?: string[] };

// A slug is "taken" if another document uses it now or used it before (old
// slugs keep redirecting to their document, so they cannot be reused).
const isSlugTaken = async <T extends TSluggable>(
  model: Model<T>,
  slug: string,
  excludeId?: Types.ObjectId | string,
) => {
  const filter: Record<string, unknown> = {
    $or: [{ slug }, { previousSlugs: slug }],
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return !!(await model.exists(filter));
};

export const generateUniqueSlug = async <T extends TSluggable>(
  model: Model<T>,
  source: string,
  excludeId?: Types.ObjectId | string,
) => {
  const base = slugify(source);
  let candidate = base;
  let counter = 2;
  while (await isSlugTaken(model, candidate, excludeId)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
};

/**
 * Applies a requested slug change. The old slug is stored in `previousSlugs`
 * so shared links keep working (the public page issues a permanent redirect).
 */
export const resolveSlugChange = async <T extends TSluggable>(
  model: Model<T>,
  current: { _id: Types.ObjectId; slug: string; previousSlugs?: string[] },
  requestedSlug?: string,
) => {
  if (!requestedSlug) return {};
  const nextSlug = slugify(requestedSlug);
  if (nextSlug === current.slug) return {};

  if (await isSlugTaken(model, nextSlug, current._id)) {
    throw new AppError(
      httpStatus.CONFLICT,
      `The URL slug "${nextSlug}" is already used by another item`,
    );
  }

  const previousSlugs = Array.from(
    new Set([...(current.previousSlugs || []), current.slug]),
  ).filter(item => item !== nextSlug);

  return { slug: nextSlug, previousSlugs };
};

// Sets sortOrder = position for an ordered list of ids in one round trip.
export const applyOrder = async <T>(model: Model<T>, ids: string[]) => {
  if (!ids.length) return;
  await model.bulkWrite(
    ids.map((id, index) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { sortOrder: index } },
      },
    })) as any,
  );
};

export const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

/**
 * Converts a nested partial payload into MongoDB dot-paths for `$set`, so
 * updating `{ home: { heroHeadline } }` changes only that field instead of
 * replacing the whole `home` object. Arrays and media objects (anything with
 * a `url`) are replaced as a whole so no stale fields survive.
 */
export const flattenForSet = (
  payload: Record<string, unknown>,
  prefix = "",
  out: Record<string, unknown> = {},
) => {
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value) && !("url" in value)) {
      flattenForSet(value, path, out);
    } else {
      out[path] = value;
    }
  });
  return out;
};

// "" -> null for optional references coming from admin forms
export const emptyToNull = (value: unknown) => (value === "" ? null : value);

export const uniqueIds = (ids: unknown[] = []) =>
  Array.from(new Set(ids.map(id => String(id)))).filter(Boolean);
