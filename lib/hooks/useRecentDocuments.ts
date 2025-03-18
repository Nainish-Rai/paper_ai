import { useAuth } from "../auth/provider";
import { useAuthQuery } from "./useAuthQuery";

export interface DocumentWithCollaborators {
  id: string;
  title: string;
  updatedAt: string;
  collaborators: number; // Count of users that can access this document
  roomId: string;
}

async function fetchRecentDocuments(
  token: string
): Promise<DocumentWithCollaborators[]> {
  try {
    const response = await fetch("/api/documents/recent", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.message || "Failed to fetch recent documents";
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch recent documents:", error);
    throw error;
  }
}

export function useRecentDocuments() {
  const { user } = useAuth();
  const queryKey = user?.id
    ? ["recentDocuments", user.id]
    : ["recentDocuments"];

  return useAuthQuery<DocumentWithCollaborators[]>(
    queryKey,
    fetchRecentDocuments,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      enabled: !!user?.id,
    }
  );
}
