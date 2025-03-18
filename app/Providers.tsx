"use client";

import { LiveblocksProvider } from "@liveblocks/react";
import { PropsWithChildren } from "react";
import { authClient } from "@/lib/auth/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <LiveblocksProvider
          lostConnectionTimeout={30000}
          throttle={100}
          authEndpoint={async (room) => {
            // Get session
            const result = await authClient.getSession();
            if (!result?.data?.session) {
              throw new Error("Not authenticated");
            }

            // Make auth request
            const response = await fetch("/api/liveblocks-auth", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${result.data.session.token}`,
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) {
              throw new Error("Failed to authenticate with Liveblocks");
            }

            const data = await response.json();
            return data;
          }}
        >
          {children}
          <Toaster />
        </LiveblocksProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
