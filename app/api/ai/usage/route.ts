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

      const monthKey = `ai:ratelimit:${userId}:${now.getUTCFullYear()}:${
        now.getUTCMonth() + 1
      }:*`;

      // Get daily token usage
      const dailyTokens = (await redis.get<number>(dayKey)) || 0;

      // Get rate limit info for remaining requests
      const rateLimitInfo = await rateLimiter.checkRateLimit();

      // Get all keys for the current month
      const monthlyKeys = await redis.keys(monthKey);

      // Sum up all requests from the month
      let monthlyRequests = 0;
      if (monthlyKeys.length > 0) {
        const values = await redis.mget<number[]>(...monthlyKeys);
        monthlyRequests = values.reduce((sum, val) => sum + (val || 0), 0);
      }

      usage = {
        dailyTokens,
        monthlyRequests,
        remainingRequests: rateLimitInfo.remaining,
        maxTokensPerDay: RateLimiter.maxTokensPerDay,
      };
    } else {
      // Return mock data in development
      const rateLimitInfo = await rateLimiter.checkRateLimit();
      usage = {
        dailyTokens: 0,
        monthlyRequests: 0,
        remainingRequests: rateLimitInfo.remaining,
        maxTokensPerDay: RateLimiter.maxTokensPerDay,
      };
    }

    return new Response(JSON.stringify(usage), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    if (error.message.includes("Rate limit exceeded")) {
      // If rate limit error, return 0 remaining requests but don't fail the request
      return new Response(
        JSON.stringify({
          dailyTokens: 0,
          monthlyRequests: 0,
          remainingRequests: 0,
          maxTokensPerDay: RateLimiter.maxTokensPerDay,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      { status: error.status || 500 }
    );
  }
}
