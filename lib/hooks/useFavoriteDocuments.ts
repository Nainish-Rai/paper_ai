// filepath: c:\Users\Nainish\Developement\paper_ai\lib\hooks\useFavoriteDocuments.ts
import { useQuery } from "@tanstack/react-query";
import { Document } from "@prisma/client";

export interface DocumentWithAuthor extends Document {
  author: {
    name: string | null;
    email: string;
  };
}

/**
 * Custom hook for fetching user's favorite documents
 */
export function useFavoriteDocuments(userId: string | undefined) {
  return useQuery<DocumentWithAuthor[]>({
    queryKey: ["favorite-documents", userId],
    queryFn: async () => {
      try {
        const response = await fetch("/api/documents/favorites");
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to fetch favorite documents");
        }
        return response.json();
      } catch (error) {
        console.error("Favorite documents fetch error:", error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
