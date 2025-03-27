import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import {
  AIContextState,
  AIError,
  AIResponse,
  DEFAULT_MODEL_CONFIG,
} from "./types";
import { RateLimiter } from "./rateLimiter";

const MODEL_NAME = "llama-3.1-8b-instant";

export class AIService {
  private openai: OpenAI;
  private rateLimiter: RateLimiter;

  constructor(userId: string) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      baseURL: "https://api.groq.com/openai/v1",
    });
    this.rateLimiter = new RateLimiter(userId);
  }

  private async createCompletion(
    prompt: string,
    context?: Partial<AIContextState>
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    await this.rateLimiter.checkRateLimit();

    try {
      const response = await this.openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        ...DEFAULT_MODEL_CONFIG,
        ...(context?.modelConfig || {}),
      });

      if (response.usage) {
        await this.rateLimiter.trackTokenUsage(response.usage.total_tokens);
      }

      return response;
    } catch (error: any) {
      throw new AIError(
        error.message || "AI service error",
        error.code || "AI_ERROR",
        error.status || 500
      );
    }
  }

  async streamCompletion(
    prompt: string,
    context?: Partial<AIContextState>
  ): Promise<StreamingTextResponse> {
    await this.rateLimiter.checkRateLimit();

    try {
      const response = await this.openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        ...DEFAULT_MODEL_CONFIG,
        ...(context?.modelConfig || {}),
        stream: true,
      });

      return new StreamingTextResponse(OpenAIStream(response as any));
    } catch (error: any) {
      throw new AIError(
        error.message || "AI service error",
        error.code || "AI_ERROR",
        error.status || 500
      );
    }
  }

  async checkGrammar(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const prompt = `Please check the following text for grammatical errors and suggest corrections. Respond with a JSON object containing "corrections" (array of objects with "original", "correction", and "explanation" fields) and "improvedText" (the full corrected text):

${text}`;

    const response = await this.createCompletion(prompt, context);
    return { content: response.choices[0].message.content || "" };
  }

  async improveStyle(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const prompt = `Please improve the writing style of the following text while maintaining its meaning. Consider clarity, conciseness, and engagement. Respond with a JSON object containing "improvements" (array of suggested changes with explanations) and "improvedText" (the enhanced version):

${text}`;

    const response = await this.createCompletion(prompt, context);
    return { content: response.choices[0].message.content || "" };
  }

  async generateSummary(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const prompt = `Please provide a concise summary of the following text, highlighting the key points. Respond with a JSON object containing "summary" (the main summary) and "keyPoints" (array of important points):

${text}`;

    const response = await this.createCompletion(prompt, context);
    return { content: response.choices[0].message.content || "" };
  }

  async expandContent(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const prompt = `Please expand the following text with relevant details, examples, or explanations while maintaining the original tone and style:

${text}`;

    const response = await this.createCompletion(prompt, context);
    return { content: response.choices[0].message.content || "" };
  }

  async generateTemplate(
    type: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const prompt = `Please generate a template for a ${type} document. Include placeholders and structural elements that would be typical for this type of content:`;

    const response = await this.createCompletion(prompt, context);
    return { content: response.choices[0].message.content || "" };
  }
}
