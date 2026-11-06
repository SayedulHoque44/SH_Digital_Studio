export const CategorySearchFields = ["name", "slug", "shortDescription"];

export const CategorySortOptions: Record<string, string> = {
  order: "sortOrder name",
  name: "name",
  newest: "-createdAt",
  updated: "-updatedAt",
};
