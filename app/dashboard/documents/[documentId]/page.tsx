import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import DocumentPageClient from "./documentPage";
import { authClient } from "@/lib/auth/client";
import { headers } from "next/headers";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  // Initialize QueryClient on the server
  const queryClient = new QueryClient();

  // Prefetch document data on the server
  await queryClient.prefetchQuery({
    queryKey: ["document", documentId],
    queryFn: async () => {
      try {
        // Get base URL for constructing absolute URLs in server components
        const headersList = headers();
        const host = (await headersList).get("host") || "localhost:3000";
        const protocol =
          process.env.NODE_ENV === "production" ? "https" : "http";
        const baseUrl = `${protocol}://${host}`;

        const response = await fetch(`${baseUrl}/api/documents/${documentId}`, {
          headers: await headers(),
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        console.error("Server prefetch error:", error);
        return null;
      }
    },
  });

  // Try to prefetch session data with proper error handling
  try {
    const session = await authClient.getSession();
    if (session) {
      queryClient.setQueryData(["session"], session);
    }
  } catch (error) {
    console.error(
      "Session prefetch error:",
      error instanceof Error ? error.message : String(error)
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DocumentPageClient documentId={documentId} />
    </HydrationBoundary>
  );
}
