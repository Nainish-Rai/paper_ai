// filepath: c:\Users\Nainish\Developement\paper_ai\lib\hooks\useFavoriteDocument.ts
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook for toggling document favorite status
 */
export const useFavoriteDocument = (documentId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/favorite`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update favorite status");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      queryClient.invalidateQueries({ queryKey: ["all-documents"] });

      toast({
        title: data.favorite ? "Added to favorites" : "Removed from favorites",
        description: data.favorite
          ? "Document added to your favorites"
          : "Document removed from your favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      });
    },
  });
};
