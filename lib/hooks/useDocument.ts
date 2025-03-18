"use client";

import { useQuery } from "@tanstack/react-query";

export function useDocument(documentId: string) {
  return useQuery({
    queryKey: ["document", documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }
      return response.json();
    },
  });
}
