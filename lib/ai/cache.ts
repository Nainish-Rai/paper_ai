import { Redis } from "@upstash/redis";
import { AIResponse, StyleAnalysis, DocumentTemplate } from "./types";

export class AICache {
  private redis: Redis;
  private readonly TTL = 60 * 60 * 24; // 24 hours cache TTL

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  private generateKey(type: string, input: string): string {
    return `ai:${type}:${Buffer.from(input).toString("base64")}`;
  }

  async get<T>(type: string, input: string): Promise<T | null> {
    const key = this.generateKey(type, input);
    const cached = await this.redis.get<T>(key);
    return cached;
  }

  async set(type: string, input: string, result: any): Promise<void> {
    const key = this.generateKey(type, input);
    await this.redis.set(key, result, { ex: this.TTL });
  }

  async getGrammarCheck(text: string): Promise<AIResponse | null> {
    return this.get<AIResponse>("grammar", text);
  }

  async setGrammarCheck(text: string, result: AIResponse): Promise<void> {
    await this.set("grammar", text, result);
  }

  async getStyleAnalysis(text: string): Promise<StyleAnalysis | null> {
    return this.get<StyleAnalysis>("style", text);
  }

  async setStyleAnalysis(text: string, result: StyleAnalysis): Promise<void> {
    await this.set("style", text, result);
  }

  async getTemplate(type: string): Promise<DocumentTemplate | null> {
    return this.get<DocumentTemplate>("template", type);
  }

  async setTemplate(type: string, result: DocumentTemplate): Promise<void> {
    await this.set("template", type, result);
  }
}
