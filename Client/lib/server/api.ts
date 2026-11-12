import "server-only";

/**
 * Server-side access to the Express API, used by server components, route
 * handlers, the sitemap and Open Graph images.
 *
 * Caching: every public request is tagged "content" and cached for
 * REVALIDATE_SECONDS. When the admin saves anything, the dashboard calls
 * /revalidate which expires the tag, so changes appear on the next request
 * without a redeploy.
 */

export const API_ORIGIN = (process.env.API_ORIGIN || "http://localhost:8080").replace(/\/+$/, "");
export const CONTENT_TAG = "content";
export const REVALIDATE_SECONDS = 300;

export class ApiUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiUnavailableError";
  }
}

export const internalHeaders = (): Record<string, string> =>
  process.env.INTERNAL_API_KEY ? { "x-internal-key": process.env.INTERNAL_API_KEY } : {};

type TRequestOptions = {
  // Bypass the data cache (draft previews, authenticated checks)
  noStore?: boolean;
  headers?: Record<string, string>;
};

/**
 * GET helper. Returns `null` for 404 so pages can call notFound(); throws
 * ApiUnavailableError when the API cannot be reached so the nearest error
 * boundary renders a friendly retry state (and ISR keeps serving the last
 * good version of a page).
 */
export async function apiGet<T>(path: string, options: TRequestOptions = {}): Promise<T | null> {
  let response: Response;
  try {
    response = await fetch(`${API_ORIGIN}/api${path}`, {
      headers: { accept: "application/json", ...internalHeaders(), ...options.headers },
      ...(options.noStore
        ? { cache: "no-store" as const }
        : { next: { revalidate: REVALIDATE_SECONDS, tags: [CONTENT_TAG] } }),
    });
  } catch (error) {
    throw new ApiUnavailableError(`API unreachable (${(error as Error).message})`);
  }

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new ApiUnavailableError(`API responded with ${response.status} for ${path}`);
  }
  const json = (await response.json()) as { data: T };
  return json.data;
}
