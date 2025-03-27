import { useQuery } from "@tanstack/react-query";

interface AIUsageStats {
  dailyTokens: number;
  monthlyRequests: number;
  remainingRequests: number;
  maxTokensPerDay: number;
}

export function useAIUsage(userId: string) {
  return useQuery<AIUsageStats>({
    queryKey: ["ai-usage", userId],
    queryFn: async () => {
      const response = await fetch(`/api/ai/usage?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch AI usage stats");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
