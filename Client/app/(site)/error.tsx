"use client";

import ErrorContent from "@/components/features/Errors/ErrorContent";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorContent error={error} reset={reset} />;
}
