"use client";

import React, { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ApiError } from "@/lib/api/client";

const config: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // A 4xx is the backend's considered answer — retrying just repeats it.
      // Other failures (network blips, 5xx) are worth a couple of attempts.
      retry: (failureCount, error) => {
        if (
          error instanceof ApiError &&
          error.statusCode >= 400 &&
          error.statusCode < 500
        ) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Mutations are not idempotent — never retry them automatically.
      retry: false,
    },
  },
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState (not a module singleton) so each browser session gets its own cache
  // and server renders never share one client across requests.
  const [queryClient] = useState(() => new QueryClient(config));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
