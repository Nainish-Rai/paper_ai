// filepath: c:\Users\Nainish\Developement\paper_ai\components\dashboard\favorite-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDocumentStore } from "@/lib/stores/documentStore";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface FavoriteButtonProps {
  documentId: string;
  isFavorite: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "link"
    | "destructive";
  showText?: boolean;
}

export function FavoriteButton({
  documentId,
  isFavorite,
  className,
  size = "icon",
  variant = "ghost",
  showText = false,
}: FavoriteButtonProps) {
  const { toggleFavorite } = useDocumentStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleToggleFavorite = async (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    try {
      await toggleFavorite(documentId);

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["favorite-documents"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });

      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite
          ? "Document removed from favorites"
          : "Document added to favorites",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleToggleFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Star
        className={cn(
          "h-4 w-4",
          isFavorite && "fill-yellow-500 text-yellow-500"
        )}
      />
      {showText && (
        <span className="ml-2">{isFavorite ? "Unfavorite" : "Favorite"}</span>
      )}
    </Button>
  );
}
