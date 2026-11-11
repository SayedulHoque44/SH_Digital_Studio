import { type NextRequest } from "next/server";
import { API_ORIGIN, internalHeaders } from "@/lib/server/api";

/**
 * Same-origin proxy: browser -> /api/* (this site) -> Express API.
 *
 * Why a proxy instead of calling the API domain directly:
 * - the admin session cookie stays first-party, HttpOnly and SameSite=Strict
 *   (cross-site cookies are blocked by modern browsers)
 * - no CORS configuration is needed for the browser
 * - the real visitor IP is forwarded (with the internal key proving it came
 *   from this server) so rate limits apply per visitor
 *
 * Only the public and admin API areas are reachable, and only an allowlist
 * of headers is forwarded in either direction.
 */

export const dynamic = "force-dynamic";

const ALLOWED_PREFIXES = ["public/", "admin/"];
const MAX_BODY_BYTES = 1_100_000;

const REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "content-type",
  "cookie",
  "origin",
  "referer",
  "user-agent",
  "x-requested-with",
];
const RESPONSE_HEADERS = [
  "content-type",
  "cache-control",
  "retry-after",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
  "x-ratelimit-reset",
];

// Marks requests this proxy sends. If one comes back in, API_ORIGIN points at
// this Next.js server (e.g. `next dev` moved to port 3001 when 3000 was busy)
// and forwarding again would loop until every request times out.
const PROXY_MARKER = "x-shds-proxied";

const json = (status: number, message: string) =>
  Response.json({ success: false, message, errorSources: [] }, { status });

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (request.headers.has(PROXY_MARKER)) {
    console.error(`[api proxy] API_ORIGIN (${API_ORIGIN}) points at this Next.js server - start the API or fix API_ORIGIN`);
    return json(508, "API proxy loop: API_ORIGIN points at the website itself");
  }

  const { path } = await params;
  const joined = path.join("/");

  if (!ALLOWED_PREFIXES.some((prefix) => joined.startsWith(prefix)) || path.some((segment) => segment === ".." || segment === ".")) {
    return json(404, "API Not Found !!");
  }

  const target = new URL(`${API_ORIGIN}/api/${path.map(encodeURIComponent).join("/")}`);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  REQUEST_HEADERS.forEach((name) => {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  });
  Object.entries(internalHeaders()).forEach(([name, value]) => headers.set(name, value));
  headers.set(PROXY_MARKER, "1");
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  if (clientIp && process.env.INTERNAL_API_KEY) headers.set("x-client-ip", clientIp);

  let body: ArrayBuffer | undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    body = await request.arrayBuffer();
    if (body.byteLength > MAX_BODY_BYTES) return json(413, "Request body is too large");
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    return json(503, "The service is temporarily unavailable. Please try again shortly.");
  }

  const responseHeaders = new Headers();
  RESPONSE_HEADERS.forEach((name) => {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  });
  // Multiple Set-Cookie headers must be forwarded individually
  upstream.headers.getSetCookie().forEach((cookie) => responseHeaders.append("set-cookie", cookie));

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
