"use client";

import { Card } from "@/components/ui/card";
import { useAIUsage } from "@/hooks/useAIUsage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Icons } from "@/components/icons";

interface AIUsageCardProps {
  userId: string;
}

export function AIUsageCard({ userId }: AIUsageCardProps) {
  const { data: usage, isLoading, error } = useAIUsage(userId);

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <Icons.warning className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="font-semibold text-lg">AI Usage Stats</h3>
            <p className="text-sm text-red-500">
              Failed to load usage statistics
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (isLoading || !usage) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner className="h-5 w-5" />
          <span>Loading AI usage stats...</span>
        </div>
      </Card>
    );
  }

  const tokenUsagePercent = Math.round(
    (usage.dailyTokens / usage.maxTokensPerDay) * 100
  );

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">AI Usage Statistics</h3>
          <Icons.sparkles className="h-5 w-5 text-blue-500" />
        </div>

        <div className="grid gap-4">
          {/* Daily Tokens Usage */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Daily Token Usage</span>
              <span className="font-medium">
                {usage.dailyTokens.toLocaleString()} /{" "}
                {usage.maxTokensPerDay.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${tokenUsagePercent}%` }}
              />
            </div>
          </div>

          {/* Monthly Requests */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm">Monthly Requests</span>
            <span className="font-medium">
              {usage.monthlyRequests.toLocaleString()}
            </span>
          </div>

          {/* Remaining Rate Limit */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm">Remaining Requests (per min)</span>
            <span className="font-medium">{usage.remainingRequests}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Auto-updates every 30 seconds
        </div>
      </div>
    </Card>
  );
}
