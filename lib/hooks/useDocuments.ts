import { useQuery } from "@tanstack/react-query";
import { Document } from "@prisma/client";

export interface DocumentWithAuthor extends Document {
  author: {
    name: string | null;
    email: string;
  };
}

/**
 * Custom hook for fetching user documents
 */
export function useDocuments(userId: string | undefined) {
  return useQuery<DocumentWithAuthor[]>({
    queryKey: ["all-documents", userId],
    queryFn: async () => {
      try {
        const response = await fetch("/api/documents/all");
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to fetch documents");
        }
        return response.json();
      } catch (error) {
        console.error("Document fetch error:", error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
