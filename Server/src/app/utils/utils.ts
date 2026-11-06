// Builds a { [targetField]: { $gte, $lte } } filter from `gte` / `lte` query
// values (ISO dates). Invalid dates are ignored.
const dateFillterGteLte = (
  query: Record<string, unknown>,
  targetField: string,
) => {
  if (!targetField) {
    return {};
  }

  const isValidDate = (date: unknown): date is string =>
    typeof date === "string" && !isNaN(Date.parse(date));

  const range: Record<string, Date> = {};
  if (isValidDate(query.gte)) range.$gte = new Date(query.gte);
  if (isValidDate(query.lte)) {
    // Include the whole "to" day when only a date (YYYY-MM-DD) is given
    const end = new Date(query.lte);
    if (/^\d{4}-\d{2}-\d{2}$/.test(query.lte)) end.setUTCHours(23, 59, 59, 999);
    range.$lte = end;
  }

  return Object.keys(range).length ? { [targetField]: range } : {};
};

export const utils = {
  dateFillterGteLte,
};
