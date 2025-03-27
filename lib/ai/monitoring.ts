import { Redis } from "@upstash/redis";

interface PerformanceMetrics {
  responseTime: number;
  tokenCount: number;
  success: boolean;
  errorType?: string;
  endpoint: string;
}

interface DailyMetrics extends Record<string, unknown> {
  totalCalls: number;
  totalTime: number;
  totalTokens: number;
  successCount: number;
  errorCount: number;
}

interface ErrorMetrics extends Record<string, unknown> {
  count: number;
  lastError: string;
  timestamp: number;
}

interface EnhancedDailyMetrics extends DailyMetrics {
  date: string;
  avgResponseTime: number;
  avgTokens: number;
  successRate: number;
}

export class AIMonitoring {
  private redis: Redis;
  private readonly METRICS_TTL = 60 * 60 * 24 * 7; // 7 days
  private readonly ERROR_TTL = 60 * 60 * 24; // 24 hours

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  private async incrementCounter(key: string): Promise<void> {
    await this.redis.incr(key);
  }

  async trackPerformance(metrics: PerformanceMetrics): Promise<void> {
    const date = new Date().toISOString().split("T")[0];
    const key = `metrics:${metrics.endpoint}:${date}`;

    const dailyMetrics: DailyMetrics = {
      totalCalls: 1,
      totalTime: metrics.responseTime,
      totalTokens: metrics.tokenCount,
      successCount: metrics.success ? 1 : 0,
      errorCount: metrics.success ? 0 : 1,
    };

    await this.redis.hset(key, dailyMetrics);
    await this.redis.expire(key, this.METRICS_TTL);
  }

  async trackError(endpoint: string, error: Error): Promise<void> {
    const key = `errors:${endpoint}`;
    const count = ((await this.redis.hget<number>(key, "count")) || 0) + 1;

    const errorMetrics: ErrorMetrics = {
      count,
      lastError: error.message,
      timestamp: Date.now(),
    };

    await this.redis.hset(key, errorMetrics);
    await this.redis.expire(key, this.ERROR_TTL);
  }

  async getPerformanceMetrics(
    endpoint: string,
    days: number = 7
  ): Promise<EnhancedDailyMetrics[]> {
    const metrics: EnhancedDailyMetrics[] = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = `metrics:${endpoint}:${date.toISOString().split("T")[0]}`;
      const rawMetrics = await this.redis.hgetall(key);

      if (rawMetrics && Object.keys(rawMetrics).length > 0) {
        // Convert string values to numbers
        const dayMetrics: DailyMetrics = {
          totalCalls: parseInt(rawMetrics.totalCalls as string) || 0,
          totalTime: parseInt(rawMetrics.totalTime as string) || 0,
          totalTokens: parseInt(rawMetrics.totalTokens as string) || 0,
          successCount: parseInt(rawMetrics.successCount as string) || 0,
          errorCount: parseInt(rawMetrics.errorCount as string) || 0,
        };

        const enhancedMetrics: EnhancedDailyMetrics = {
          ...dayMetrics,
          date: date.toISOString().split("T")[0],
          avgResponseTime: dayMetrics.totalTime / dayMetrics.totalCalls || 0,
          avgTokens: dayMetrics.totalTokens / dayMetrics.totalCalls || 0,
          successRate:
            (dayMetrics.successCount / dayMetrics.totalCalls) * 100 || 0,
        };

        metrics.push(enhancedMetrics);
      }
    }

    return metrics;
  }

  async getErrorMetrics(endpoint: string): Promise<ErrorMetrics | null> {
    const key = `errors:${endpoint}`;
    const rawMetrics = await this.redis.hgetall(key);

    if (!rawMetrics) return null;

    return {
      count: parseInt(rawMetrics.count as string) || 0,
      lastError: (rawMetrics.lastError as string) || "",
      timestamp: parseInt(rawMetrics.timestamp as string) || 0,
    };
  }
}
