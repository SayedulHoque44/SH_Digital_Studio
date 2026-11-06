export const ServiceSearchFields = ["title", "slug", "shortDescription"];

export const ServiceSortOptions: Record<string, string> = {
  order: "sortOrder title",
  title: "title",
  newest: "-createdAt",
  updated: "-updatedAt",
};
