import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { safeInternalPath } from "@/lib/site";

export const dynamic = "force-dynamic";

// GET /preview/exit?path=/projects/<slug> - turns Draft Mode off again.
export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  const path = safeInternalPath(request.nextUrl.searchParams.get("path"), "/admin/projects");
  return NextResponse.redirect(new URL(path, request.url));
}
