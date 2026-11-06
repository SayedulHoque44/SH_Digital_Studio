import "server-only";
import { cookies, draftMode } from "next/headers";
import { cache } from "react";
import { apiGet } from "@/lib/server/api";
import type {
  ICategoryCard,
  ICategoryDetail,
  IHomeData,
  IPaginated,
  IProjectCard,
  IProjectDetail,
  IPublicProfile,
  IPublicSettings,
  IServiceCard,
  IServiceDetail,
  ISitemapData,
  TRedirect,
} from "../interface/public.interface";

/*
 * Public content used by server components. Functions are wrapped in React
 * `cache` so `generateMetadata` and the page share one request per render.
 */

// Minimal fallback so the header/footer can still render if the API is
// briefly unreachable; page content shows its own error state.
export const FALLBACK_SETTINGS: IPublicSettings = {
  brand: {
    name: "SH Digital Studio",
    tagline: "Digital experiences built to move businesses forward.",
  },
  theme: { accent: "#C8F25C" },
  announcement: { enabled: false },
  navigation: {
    header: [
      { label: "Work", href: "/work" },
      { label: "Industries", href: "/industries" },
      { label: "Services", href: "/services" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  footer: { services: [], industries: [] },
  contact: {},
  socialLinks: [],
  seo: { titleTemplate: "%s — SH Digital Studio" },
  inquiry: { budgetRanges: [] },
};

export const getSettings = cache(async (): Promise<IPublicSettings> => {
  try {
    return (await apiGet<IPublicSettings>("/public/settings")) || FALLBACK_SETTINGS;
  } catch {
    return FALLBACK_SETTINGS;
  }
});

export const getHome = cache(() => apiGet<IHomeData>("/public/home"));

export const getProjects = cache((query = "") =>
  apiGet<IPaginated<IProjectCard>>(`/public/projects${query ? `?${query}` : ""}`),
);

export const getCategories = cache(() => apiGet<ICategoryCard[]>("/public/categories"));

export const getCategory = cache((slug: string) =>
  apiGet<ICategoryDetail | TRedirect>(`/public/categories/${encodeURIComponent(slug)}`),
);

export const getServices = cache(() => apiGet<IServiceCard[]>("/public/services"));

export const getService = cache((slug: string) =>
  apiGet<IServiceDetail | TRedirect>(`/public/services/${encodeURIComponent(slug)}`),
);

export const getProfile = cache(() => apiGet<IPublicProfile>("/public/profile"));

export const getLegal = cache((doc: "privacy" | "terms") =>
  apiGet<{ content: string; updatedAt?: string }>(`/public/legal/${doc}`),
);

export const getSitemapData = cache(() => apiGet<ISitemapData>("/public/sitemap"));

/**
 * Project by slug. When Draft Mode is on (enabled by an authenticated admin
 * via /preview), the admin preview endpoint is used with the admin's own
 * session cookie, so unpublished projects render exactly like the public
 * page. Without a valid admin session the API refuses and the public
 * version is used.
 */
export const getProject = cache(
  async (slug: string): Promise<(IProjectDetail & { isPreview?: boolean }) | TRedirect | null> => {
    const { isEnabled } = await draftMode();
    if (isEnabled) {
      const session = (await cookies()).get("shds_session")?.value;
      if (session) {
        try {
          const preview = await apiGet<IProjectDetail>(
            `/admin/projects/preview/${encodeURIComponent(slug)}`,
            { noStore: true, headers: { cookie: `shds_session=${session}` } },
          );
          if (preview) return { ...preview, isPreview: true };
        } catch {
          // fall through to the public version
        }
      }
    }
    return apiGet<IProjectDetail | TRedirect>(`/public/projects/${encodeURIComponent(slug)}`);
  },
);

export const isRedirect = (value: unknown): value is TRedirect =>
  !!value && typeof value === "object" && "redirectSlug" in value;
