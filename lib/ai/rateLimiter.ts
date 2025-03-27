import { RateLimitError, RateLimitInfo, AI_RATE_LIMIT } from "./types";
import { getRedis } from "../redis";
import { Redis } from "@upstash/redis";

const RATE_LIMIT_PREFIX = "ai:ratelimit:";
const TOKEN_USAGE_PREFIX = "ai:tokens:";

// In-memory storage for development
const inMemoryStorage = new Map<string, { count: number; expires: number }>();
const inMemoryTokens = new Map<string, { tokens: number; expires: number }>();

export class RateLimiter {
  private redis: Redis | null;

  constructor(private readonly userId: string) {
    this.redis = getRedis();
  }

  // Static getters for rate limit constants
  static get maxRequestsPerMinute(): number {
    return AI_RATE_LIMIT.MAX_REQUESTS_PER_MINUTE;
  }

  static get maxTokensPerDay(): number {
    return AI_RATE_LIMIT.MAX_TOKENS_PER_DAY;
  }

  private getMinuteKey(): string {
    const now = new Date();
    return `${RATE_LIMIT_PREFIX}${this.userId}:${now.getUTCFullYear()}:${
      now.getUTCMonth() + 1
    }:${now.getUTCDate()}:${now.getUTCHours()}:${now.getUTCMinutes()}`;
  }

  private getDayKey(): string {
    const now = new Date();
    return `${TOKEN_USAGE_PREFIX}${this.userId}:${now.getUTCFullYear()}:${
      now.getUTCMonth() + 1
    }:${now.getUTCDate()}`;
  }

  private async getInMemoryRequestCount(key: string): Promise<number> {
    const now = Date.now();
    const data = inMemoryStorage.get(key);

    if (!data || data.expires < now) {
      inMemoryStorage.set(key, { count: 1, expires: now + 60000 });
      return 1;
    }

    data.count += 1;
    inMemoryStorage.set(key, data);
    return data.count;
  }

  private async getInMemoryTokenCount(key: string): Promise<number> {
    const now = Date.now();
    const data = inMemoryTokens.get(key);

    if (!data || data.expires < now) {
      return 0;
    }

    return data.tokens;
  }

  async checkRateLimit(): Promise<RateLimitInfo> {
    const minuteKey = this.getMinuteKey();
    const dayKey = this.getDayKey();
    const now = Date.now();

    let requestCount: number;
    let tokenCount: number;

    if (this.redis) {
      // Use Redis in production
      [requestCount, tokenCount] = await Promise.all([
        this.redis.incr(minuteKey),
        this.redis.get<number>(dayKey).then((val) => val ?? 0),
      ]);

      // Set expiry for minute counter
      if (requestCount === 1) {
        await this.redis.expire(minuteKey, 60);
      }
    } else {
      // Use in-memory storage in development
      [requestCount, tokenCount] = await Promise.all([
        this.getInMemoryRequestCount(minuteKey),
        this.getInMemoryTokenCount(dayKey),
      ]);
    }

    const resetTime = Math.ceil(now / 60000) * 60000; // Next minute
    const remaining = Math.max(
      0,
      RateLimiter.maxRequestsPerMinute - requestCount
    );

    if (requestCount > RateLimiter.maxRequestsPerMinute) {
      const retryAfter = Math.ceil((resetTime - now) / 1000);
      throw new RateLimitError(
        "Rate limit exceeded. Please try again later.",
        retryAfter
      );
    }

    if (tokenCount >= RateLimiter.maxTokensPerDay) {
      const nextDay = new Date();
      nextDay.setUTCHours(24, 0, 0, 0);
      const retryAfter = Math.ceil((nextDay.getTime() - now) / 1000);
      throw new RateLimitError(
        "Daily token limit exceeded. Please try again tomorrow.",
        retryAfter
      );
    }

    return {
      limit: RateLimiter.maxRequestsPerMinute,
      remaining,
      reset: Math.floor(resetTime / 1000),
    };
  }

  async trackTokenUsage(tokens: number): Promise<void> {
    const dayKey = this.getDayKey();
    const now = Date.now();

    if (this.redis) {
      // Use Redis in production
      await this.redis.incrby(dayKey, tokens);

      // Set expiry for first token usage of the day
      const exists = await this.redis.exists(dayKey);
      if (!exists) {
        const tomorrow = new Date(now);
        tomorrow.setUTCHours(24, 0, 0, 0);
        const secondsUntilTomorrow = Math.ceil(
          (tomorrow.getTime() - now) / 1000
        );
        await this.redis.expire(dayKey, secondsUntilTomorrow);
      }
    } else {
      // Use in-memory storage in development
      const data = inMemoryTokens.get(dayKey) || { tokens: 0, expires: 0 };
      if (data.expires < now) {
        const tomorrow = new Date(now);
        tomorrow.setUTCHours(24, 0, 0, 0);
        data.expires = tomorrow.getTime();
        data.tokens = 0;
      }
      data.tokens += tokens;
      inMemoryTokens.set(dayKey, data);
    }
  }
}
