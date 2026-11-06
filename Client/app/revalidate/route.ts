import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { CONTENT_TAG } from "@/lib/server/api";
import { hasValidAdminSession } from "@/lib/server/adminSession";

export const dynamic = "force-dynamic";

/**
 * POST /revalidate - called by the admin dashboard after every save so the
 * public site shows the change on the next request (no redeploy needed).
 * Only a signed-in admin can trigger it.
 */
export async function POST(request: NextRequest) {
  if (!(await hasValidAdminSession(request))) {
    return NextResponse.json({ revalidated: false, message: "Unauthorized" }, { status: 401 });
  }
  // expire: 0 -> the next visitor gets fresh content immediately
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
