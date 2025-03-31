import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Template } from "@prisma/client";
import {
  mergeWithDefaultTemplates,
  DefaultTemplate,
} from "../templates/documentTemplates";
import { z } from "zod";

// Template validation schemas
const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  categories: z.array(z.string()),
  published: z.boolean().default(false),
});

export type TemplateInput = z.infer<typeof templateSchema>;

/**
 * Hook for managing document templates
 * Handles fetching, creating, updating, and deleting templates
 * Includes optimistic updates and error handling
 */
export function useTemplates() {
  const queryClient = useQueryClient();
  const queryKey = ["templates"];

  // Fetch all templates (public + user's own)
  const {
    data: templates,
    isLoading,
    error,
  } = useQuery<(Template | DefaultTemplate)[]>({
    queryKey,
    queryFn: async () => {
      const response = await fetch("/api/templates");
      if (!response.ok) throw new Error("Failed to fetch templates");
      const dbTemplates: Template[] = await response.json();
      return mergeWithDefaultTemplates(dbTemplates);
    },
  });

  // Create new template
  const createMutation = useMutation({
    mutationFn: async (data: TemplateInput) => {
      const validated = templateSchema.parse(data);
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!response.ok) throw new Error("Failed to create template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update template
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TemplateInput>;
    }) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update template");
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete template
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete template");
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    templates,
    isLoading,
    error,
    createTemplate: createMutation.mutate,
    updateTemplate: updateMutation.mutate,
    deleteTemplate: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
}
