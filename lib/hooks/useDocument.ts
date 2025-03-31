"use client";

import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";

export function useDocument<TData = any>(
  documentId: string,
  options?: Partial<UseQueryOptions<TData, Error, TData, QueryKey>>
) {
  return useQuery({
    queryKey: ["document", documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }
      return response.json();
    },
    // Default staleTime of 1 minute for general use
    staleTime: 1000 * 60,
    // Apply any additional query options passed in
    ...options,
  });
}
