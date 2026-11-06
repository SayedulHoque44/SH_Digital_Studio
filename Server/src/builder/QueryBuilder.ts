import { FilterQuery, Query } from "mongoose";
import { escapeRegex } from "../app/modules/shared/shared.utils";

/**
 * Fluent helper for list endpoints: search -> filter -> sort -> paginate.
 *
 * Hardened compared to the original version:
 * - search terms are regex-escaped (no ReDoS / regex injection)
 * - only whitelisted fields can be filtered, and only with primitive values
 *   (no `?field[$ne]=x` operator injection)
 * - sorting uses a whitelist of named options
 * - page size is clamped
 * - the client can no longer choose the projection (`fields`), which could
 *   otherwise request hidden fields such as `+passwordHash`
 */
class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;
  private defaultLimit: number;

  constructor(
    modelQuery: Query<T[], T>,
    query: Record<string, unknown>,
    defaultLimit = 20,
  ) {
    this.modelQuery = modelQuery;
    this.query = query;
    this.defaultLimit = defaultLimit;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm;
    if (typeof searchTerm === "string" && searchTerm.trim()) {
      const pattern = escapeRegex(searchTerm.trim().slice(0, 100));
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          field =>
            ({
              [field]: { $regex: pattern, $options: "i" },
            }) as FilterQuery<T>,
        ),
      });
    }
    return this;
  }

  filter(allowedFields: string[] = []) {
    const filterQuery: Record<string, string | number | boolean> = {};
    allowedFields.forEach(field => {
      const value = this.query?.[field];
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        if (value !== "") filterQuery[field] = value;
      }
    });
    this.modelQuery = this.modelQuery.find(filterQuery as FilterQuery<T>);
    return this;
  }

  // Merges a filter built by the service (already validated/trusted).
  where(filter: FilterQuery<T>) {
    this.modelQuery = this.modelQuery.find(filter);
    return this;
  }

  sort(options: Record<string, string> = {}, fallback = "-createdAt") {
    const requested = this.query?.sort;
    const sort =
      typeof requested === "string" && options[requested]
        ? options[requested]
        : fallback;
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }

  private pageAndLimit() {
    const page = Math.max(1, Number(this.query?.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(this.query?.limit) || this.defaultLimit),
    );
    return { page, limit };
  }

  paginate() {
    const { page, limit } = this.pageAndLimit();
    this.modelQuery = this.modelQuery.skip((page - 1) * limit).limit(limit);
    return this;
  }

  fields(projection = "-__v") {
    this.modelQuery = this.modelQuery.select(projection);
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const { page, limit } = this.pageAndLimit();
    const totalPage = Math.max(1, Math.ceil(total / limit));

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
