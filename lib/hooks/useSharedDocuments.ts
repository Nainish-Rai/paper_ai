// filepath: c:\Users\Nainish\Developement\paper_ai\lib\hooks\useSharedDocuments.ts
import { useQuery } from "@tanstack/react-query";
import { Document } from "@prisma/client";

export interface DocumentWithAuthor extends Document {
  author: {
    name: string | null;
    email: string;
  };
}

/**
 * Custom hook for fetching documents shared with the user
 */
export function useSharedDocuments(userId: string | undefined) {
  return useQuery<DocumentWithAuthor[]>({
    queryKey: ["shared-documents", userId],
    queryFn: async () => {
      try {
        const response = await fetch("/api/documents/shared");
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to fetch shared documents");
        }
        return response.json();
      } catch (error) {
        console.error("Shared documents fetch error:", error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
