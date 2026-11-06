"use client";

/**
 * Asks the Next.js server to refresh cached public pages after the admin
 * saves content (POST /revalidate verifies the admin session). Failures are
 * non-fatal: pages also refresh on their own within a few minutes.
 */
export async function revalidateSite() {
  try {
    const response = await fetch("/revalidate", { method: "POST", credentials: "same-origin" });
    return response.ok;
  } catch {
    return false;
  }
}
