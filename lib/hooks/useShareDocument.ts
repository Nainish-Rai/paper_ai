import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useShareDocument = (documentId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to share document");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      toast({
        title: "Document shared successfully",
        description:
          "Anyone with the link can now collaborate on this document.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share document. Please try again.",
        variant: "destructive",
      });
    },
  });
};
