"use client"; // Error components must be Client Components

import ErrorContent from "@/components/features/Errors/ErrorContent";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorContent error={error} reset={reset} />;
}
