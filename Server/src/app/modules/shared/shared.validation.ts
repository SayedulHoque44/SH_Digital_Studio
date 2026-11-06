import { z } from "zod";
import { PUBLISH_STATUSES, SIMPLE_PUBLISH_STATUSES, TEXT_LIMITS } from "./shared.constant";

// ---------------------------------------------------------------------------
// URL helpers
// Only http(s) URLs are accepted for external links; `javascript:`, `data:`
// and other schemes are rejected so stored links can never execute script.
// ---------------------------------------------------------------------------

export const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

// "/media/x.webp" is allowed, protocol-relative "//evil.com" is not.
export const isRootRelativePath = (value: string) =>
  value.startsWith("/") && !value.startsWith("//") && !value.includes("\\");

const isSafeHref = (value: string) =>
  isRootRelativePath(value) ||
  isHttpUrl(value) ||
  /^mailto:[^\s]+$/i.test(value) ||
  /^tel:[+\d\s()-]+$/i.test(value) ||
  /^#[\w-]+$/.test(value);

export const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid id");

export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only");

export const externalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(isHttpUrl, "Enter a full URL starting with https://");

export const optionalExternalUrl = z.union([z.literal(""), externalUrl]).optional();

// Images/videos: absolute http(s) URL or a path served by the website itself.
export const mediaUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    value => isHttpUrl(value) || isRootRelativePath(value),
    "Enter an https:// URL or a site path starting with /",
  );

export const optionalMediaUrl = z.union([z.literal(""), mediaUrl]).optional();

export const href = z
  .string()
  .trim()
  .max(2048)
  .refine(isSafeHref, "Enter a site path (/contact), a full URL, mailto: or tel: link");

export const optionalHref = z.union([z.literal(""), href]).optional();

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

export const text = (max: number = TEXT_LIMITS.short) => z.string().trim().max(max);
export const optionalText = (max: number = TEXT_LIMITS.short) => text(max).optional();
export const markdown = z.string().max(TEXT_LIMITS.markdown).optional();
export const stringList = (maxItems = 40, maxLength: number = TEXT_LIMITS.short) =>
  z.array(text(maxLength).min(1)).max(maxItems);

// ---------------------------------------------------------------------------
// Shared object schemas
// ---------------------------------------------------------------------------

export const mediaRef = z.object({
  url: mediaUrl,
  alt: optionalText(TEXT_LIMITS.medium),
  caption: optionalText(TEXT_LIMITS.medium),
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
  assetId: objectId.optional(),
});

export const optionalMediaRef = mediaRef.optional().nullable();

export const videoRef = z.object({
  url: externalUrl.or(mediaUrl),
  title: optionalText(TEXT_LIMITS.short),
  posterUrl: optionalMediaUrl,
  captionsUrl: optionalMediaUrl,
  transcript: z.string().max(TEXT_LIMITS.markdown).optional(),
});

export const seo = z.object({
  title: optionalText(70),
  description: optionalText(200),
  ogImage: optionalMediaUrl,
  canonicalUrl: optionalExternalUrl,
  noIndex: z.boolean().optional(),
});

export const cta = z.object({
  heading: optionalText(TEXT_LIMITS.short),
  text: optionalText(TEXT_LIMITS.medium),
  buttonLabel: optionalText(60),
  buttonHref: optionalHref,
});

export const faq = z.object({
  _id: objectId.optional(),
  question: text(240).min(3, "Question is required"),
  answer: text(TEXT_LIMITS.long * 2).min(1, "Answer is required"),
});

export const featureItem = z.object({
  _id: objectId.optional(),
  title: text(120).min(1, "Title is required"),
  description: optionalText(TEXT_LIMITS.long),
  icon: optionalText(40),
});

export const publishStatus = z.enum(PUBLISH_STATUSES);
export const simplePublishStatus = z.enum(SIMPLE_PUBLISH_STATUSES);

// ---------------------------------------------------------------------------
// Content blocks
// Each block type validates its own data. Markdown is rendered on the
// frontend without raw HTML support, so stored text cannot inject markup.
// ---------------------------------------------------------------------------

const block = <T extends string, D extends z.ZodTypeAny>(type: T, data: D) =>
  z.object({ _id: objectId.optional(), type: z.literal(type), data });

export const contentBlock = z.discriminatedUnion("type", [
  block("richText", z.object({ markdown: z.string().min(1).max(TEXT_LIMITS.markdown) })),
  block(
    "heading",
    z.object({
      eyebrow: optionalText(60),
      heading: text(160).min(1),
      text: markdown,
    }),
  ),
  block(
    "image",
    z.object({
      image: mediaRef,
      layout: z.enum(["contained", "wide", "full"]).default("contained"),
    }),
  ),
  block(
    "gallery",
    z.object({
      heading: optionalText(),
      images: z.array(mediaRef).min(1).max(24),
      columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
    }),
  ),
  block("video", z.object({ heading: optionalText(), video: videoRef })),
  block(
    "imageText",
    z.object({
      image: mediaRef,
      heading: optionalText(),
      markdown: z.string().min(1).max(TEXT_LIMITS.markdown),
      imagePosition: z.enum(["left", "right"]).default("left"),
    }),
  ),
  block(
    "featureGrid",
    z.object({
      heading: optionalText(),
      intro: optionalText(TEXT_LIMITS.medium),
      items: z.array(featureItem).min(1).max(24),
      columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
    }),
  ),
  block(
    "techList",
    z.object({ heading: optionalText(), items: stringList(60, 60).min(1) }),
  ),
  block(
    "stats",
    z.object({
      heading: optionalText(),
      // A source is mandatory: statistics must be backed by real evidence.
      items: z
        .array(
          z.object({
            value: text(24).min(1),
            label: text(80).min(1),
            source: text(200).min(2, "Add where this number comes from"),
          }),
        )
        .min(1)
        .max(8),
    }),
  ),
  block(
    "comparison",
    z.object({
      heading: optionalText(),
      leftTitle: text(60).min(1),
      rightTitle: text(60).min(1),
      rows: z
        .array(
          z.object({
            label: text(120).min(1),
            left: text(TEXT_LIMITS.medium),
            right: text(TEXT_LIMITS.medium),
          }),
        )
        .min(1)
        .max(20),
    }),
  ),
  block(
    "quote",
    z.object({
      quote: text(TEXT_LIMITS.long).min(1),
      author: text(120).min(1, "Who said this?"),
      role: optionalText(120),
      // Rendered publicly only when the quote is real and approved.
      approved: z.boolean().default(false),
    }),
  ),
  block(
    "callout",
    z.object({
      tone: z.enum(["info", "note", "warning", "success"]).default("note"),
      title: optionalText(),
      markdown: z.string().min(1).max(TEXT_LIMITS.long * 4),
    }),
  ),
  block(
    "embed",
    z.object({
      title: text(120).min(1, "Describe the embedded content"),
      url: externalUrl.refine(value => value.startsWith("https://"), "Embeds must use https://"),
      aspectRatio: z.enum(["16:9", "4:3", "1:1", "9:16"]).default("16:9"),
    }),
  ),
  block(
    "beforeAfter",
    z.object({
      heading: optionalText(),
      before: mediaRef,
      after: mediaRef,
      beforeLabel: optionalText(40),
      afterLabel: optionalText(40),
      caption: optionalText(TEXT_LIMITS.medium),
    }),
  ),
  block(
    "timeline",
    z.object({
      heading: optionalText(),
      items: z
        .array(
          z.object({
            title: text(120).min(1),
            date: optionalText(60),
            description: optionalText(TEXT_LIMITS.long),
          }),
        )
        .min(1)
        .max(30),
    }),
  ),
  block(
    "cta",
    z.object({
      heading: text(160).min(1),
      text: optionalText(TEXT_LIMITS.medium),
      buttonLabel: text(60).min(1),
      buttonHref: href,
    }),
  ),
]);

export const contentBlocks = z.array(contentBlock).max(60);

// ---------------------------------------------------------------------------
// Common query/params schemas
// ---------------------------------------------------------------------------

export const idParams = z.object({ id: objectId });
export const slugParams = z.object({ slug: z.string().trim().toLowerCase().max(120) });

export const paginationQuery = {
  page: z.coerce.number().int().min(1).max(10000).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  searchTerm: z.string().trim().max(100).optional(),
};

export const reorderSchema = z.object({
  body: z.object({
    // Full ordered list of ids; sortOrder becomes the array index.
    ids: z.array(objectId).min(1).max(500),
  }),
});
