import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/server/adminSession";
import { safeInternalPath } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * GET /preview?path=/projects/<slug>
 * Enables Next.js Draft Mode for a signed-in admin, then opens the page.
 * Draft content is only fetched with the admin's own session, so enabling
 * draft mode alone never reveals unpublished projects.
 */
export async function GET(request: NextRequest) {
  const path = safeInternalPath(request.nextUrl.searchParams.get("path"), "/");
  if (!path.startsWith("/projects/")) {
    return NextResponse.json({ message: "Previews are available for project pages" }, { status: 400 });
  }

  if (!(await hasValidAdminSession(request))) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", "/admin/projects");
    return NextResponse.redirect(login);
  }

  (await draftMode()).enable();
  return NextResponse.redirect(new URL(path, request.url));
}
