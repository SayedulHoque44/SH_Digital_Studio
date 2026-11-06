"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import React, { useState } from "react";

// Devtools are only loaded in development (never shipped to visitors).
const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools), {
        ssr: false,
      })
    : () => null;

const TanstackProvider = ({ children }: { children: React.ReactNode }) => {
  // Create QueryClient only once using useState
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      {children}
    </QueryClientProvider>
  );
};

export default TanstackProvider;
