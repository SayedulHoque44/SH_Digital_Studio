/**
 * /work filter state. Read the same way by the page (server) and by the
 * results skeleton (browser), so both agree on whether a navigation will
 * show different results.
 */
export type TWorkFilters = {
  type: string;
  category: string;
  query: string;
  sort: string;
  page: number;
};

/** `get` returns the first value of a query-string parameter. */
export function readWorkFilters(get: (name: string) => string | null | undefined): TWorkFilters {
  return {
    type: get("type") || "",
    category: get("category") || "",
    query: (get("q") || "").trim(),
    sort: get("sort") || "order",
    page: Math.max(1, Number(get("page")) || 1),
  };
}

/** Identity of a result list: equal keys mean identical results. */
export const workFiltersKey = (filters: TWorkFilters) =>
  JSON.stringify([filters.type, filters.category, filters.query, filters.sort, filters.page]);
