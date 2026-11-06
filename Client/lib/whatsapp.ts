/**
 * Builds a wa.me link from the number and message template configured in
 * Admin -> Site settings -> Contact. The template supports {page},
 * {project} and {industry} placeholders so each page sends useful context.
 */
export const buildWhatsAppLink = (
  number?: string,
  template?: string,
  context: { page?: string; project?: string; industry?: string } = {},
) => {
  if (!number) return undefined;
  const digits = number.replace(/[^\d]/g, "");
  if (digits.length < 7) return undefined;

  const message = (template || "Hi! I'd like to talk about a project. ({page})")
    .replace(/\{page\}/g, context.page || "")
    .replace(/\{project\}/g, context.project || "")
    .replace(/\{industry\}/g, context.industry || "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};
