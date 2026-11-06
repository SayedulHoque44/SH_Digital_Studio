import "server-only";
import type { NextRequest } from "next/server";
import { API_ORIGIN, internalHeaders } from "./api";

/**
 * Verifies the admin session carried by the incoming request's HttpOnly
 * cookie by asking the API (the single source of truth for sessions).
 * Used by Next-side admin actions: draft previews and cache revalidation.
 */
export async function hasValidAdminSession(request: NextRequest) {
  const session = request.cookies.get("shds_session")?.value;
  if (!session) return false;
  try {
    const response = await fetch(`${API_ORIGIN}/api/admin/auth/me`, {
      headers: { cookie: `shds_session=${session}`, ...internalHeaders() },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}
