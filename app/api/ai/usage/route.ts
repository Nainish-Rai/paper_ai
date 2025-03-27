import { getRedis } from "@/lib/redis";
import { RateLimiter } from "@/lib/ai/rateLimiter";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: "Missing user ID",
        }),
        { status: 400 }
      );
    }

    const rateLimiter = new RateLimiter(userId);
    const redis = getRedis();

    let usage;
    if (redis) {
      // Get usage from Redis in production
      const now = new Date();
      const dayKey = `ai:tokens:${userId}:${now.getUTCFullYear()}:${
        now.getUTCMonth() + 1
      }:${now.getUTCDate()}`;

      const monthKey = `ai:tokens:${userId}:${now.getUTCFullYear()}:${
        now.getUTCMonth() + 1
      }:*`;

      const [dailyTokens, requests] = await Promise.all([
        redis.get<number>(dayKey),
        redis.keys(monthKey),
      ]);

      usage = {
        dailyTokens: dailyTokens || 0,
        monthlyRequests: requests.length,
        remainingRequests: RateLimiter.maxRequestsPerMinute,
        maxTokensPerDay: RateLimiter.maxTokensPerDay,
      };
    } else {
      // Return mock data in development
      usage = {
        dailyTokens: 0,
        monthlyRequests: 0,
        remainingRequests: RateLimiter.maxRequestsPerMinute,
        maxTokensPerDay: RateLimiter.maxTokensPerDay,
      };
    }

    return new Response(JSON.stringify(usage), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      { status: error.status || 500 }
    );
  }
}
