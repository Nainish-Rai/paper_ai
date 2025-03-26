import { useAuthQuery } from "./useAuthQuery";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface ProfileUpdate {
  name?: string;
  image?: string;
}

export function useProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    error,
  } = useAuthQuery(["profile"], async () => {
    const response = await fetch("/api/auth/profile");
    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }
    return response.json() as Promise<Profile>;
  });

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileUpdate) => {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json() as Promise<Profile>;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["profile"], updatedProfile);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
  };
}
