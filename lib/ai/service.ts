import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import {
  AIContextState,
  AIError,
  AIResponse,
  StyleAnalysis,
  DocumentTemplate,
  DEFAULT_MODEL_CONFIG,
} from "./types";
import { RateLimiter } from "./rateLimiter";
import { AICache } from "./cache";
import { AIMonitoring } from "./monitoring";

const MODEL_NAME = "llama-3.1-8b-instant";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class AIService {
  private openai: OpenAI;
  private rateLimiter: RateLimiter;
  private cache: AICache;
  private monitoring: AIMonitoring;

  constructor(userId: string) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      baseURL: "https://api.groq.com/openai/v1",
    });
    this.rateLimiter = new RateLimiter(userId);
    this.cache = new AICache();
    this.monitoring = new AIMonitoring();
  }

  private async retryWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    endpoint: string,
    context?: Partial<AIContextState>
  ): Promise<T> {
    let lastError: Error | null = null;
    const startTime = Date.now();

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const result = await operation();

        // Track successful performance
        await this.monitoring.trackPerformance({
          endpoint,
          responseTime: Date.now() - startTime,
          tokenCount:
            context?.modelConfig?.max_tokens || DEFAULT_MODEL_CONFIG.max_tokens,
          success: true,
        });

        return result;
      } catch (error: any) {
        lastError = error;
        await this.monitoring.trackError(endpoint, error);

        if (attempt < MAX_RETRIES - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt))
          );
        }
      }
    }

    throw lastError || new Error("Operation failed after multiple retries");
  }

  private async createCompletion(
    prompt: string,
    endpoint: string,
    context?: Partial<AIContextState>
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    await this.rateLimiter.checkRateLimit();

    return this.retryWithExponentialBackoff(
      async () => {
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
      },
      endpoint,
      context
    );
  }

  async streamCompletion(
    prompt: string,
    context?: Partial<AIContextState>
  ): Promise<StreamingTextResponse> {
    await this.rateLimiter.checkRateLimit();

    const response = await this.retryWithExponentialBackoff(
      async () => {
        return this.openai.chat.completions.create({
          model: MODEL_NAME,
          messages: [{ role: "user", content: prompt }],
          ...DEFAULT_MODEL_CONFIG,
          ...(context?.modelConfig || {}),
          stream: true,
        });
      },
      "stream",
      context
    );

    return new StreamingTextResponse(OpenAIStream(response as any));
  }

  async checkGrammar(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    // Try cache first
    const cached = await this.cache.getGrammarCheck(text);
    if (cached) return cached;

    const prompt = `Please check the following text for grammatical errors and suggest corrections. Respond with a JSON object containing "corrections" (array of objects with "original", "correction", and "explanation" fields) and "improvedText" (the full corrected text):

${text}`;

    const response = await this.createCompletion(prompt, "grammar", context);
    const result = { content: response.choices[0].message.content || "" };

    // Cache the result
    await this.cache.setGrammarCheck(text, result);
    return result;
  }

  async improveStyle(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    // Try cache first
    const cached = await this.cache.getStyleAnalysis(text);
    if (cached) return { content: cached.enhancedText, analysis: cached };

    const prompt = `Analyze and improve the following text. Provide a comprehensive style analysis with specific suggestions. Respond with a detailed JSON object following this structure:
{
  "tone": {
    "category": "formal|informal|technical|conversational",
    "confidence": 0-1,
    "suggestions": []
  },
  "readability": {
    "score": 0-100,
    "grade": "string",
    "suggestions": []
  },
  "improvements": [
    {
      "type": "clarity|conciseness|engagement|structure",
      "original": "string",
      "suggestion": "string",
      "explanation": "string"
    }
  ],
  "enhancedText": "string"
}

Text to analyze:
${text}`;

    const response = await this.createCompletion(prompt, "style", context);
    const analysis = JSON.parse(
      response.choices[0].message.content || "{}"
    ) as StyleAnalysis;

    // Cache the result
    await this.cache.setStyleAnalysis(text, analysis);

    return {
      content: analysis.enhancedText,
      analysis,
    };
  }

  async generateTemplate(
    type: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    // Try cache first
    const cached = await this.cache.getTemplate(type);
    if (cached)
      return {
        content: JSON.stringify(cached.structure, null, 2),
        template: cached,
      };

    const prompt = `Generate a detailed document template for a ${type} document. Respond with a JSON object following this structure:
{
  "type": "string",
  "structure": [
    {
      "section": "string",
      "description": "string",
      "placeholder": "string"
    }
  ],
  "suggestions": ["string"],
  "formatGuide": {
    "tone": "string",
    "style": "string",
    "length": "string"
  }
}`;

    const response = await this.createCompletion(prompt, "template", context);
    const template = JSON.parse(
      response.choices[0].message.content || "{}"
    ) as DocumentTemplate;

    // Cache the result
    await this.cache.setTemplate(type, template);

    return {
      content: JSON.stringify(template.structure, null, 2),
      template,
    };
  }

  async analyzeTone(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const prompt = `Analyze the tone and writing style of the following text. Consider formality, technical level, and engagement. Provide specific suggestions for maintaining consistency or adjusting tone as needed:

${text}`;

    const response = await this.createCompletion(prompt, "tone", context);
    return { content: response.choices[0].message.content || "" };
  }

  async analyzeReadability(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const prompt = `Analyze the readability of the following text. Consider sentence structure, vocabulary level, and overall clarity. Provide a readability score and specific suggestions for improvement:

${text}`;

    const response = await this.createCompletion(
      prompt,
      "readability",
      context
    );
    return { content: response.choices[0].message.content || "" };
  }

  async generateSummary(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const prompt = `Please provide a concise summary of the following text, highlighting the key points. Respond with a JSON object containing "summary" (the main summary) and "keyPoints" (array of important points):

${text}`;

    const response = await this.createCompletion(prompt, "summary", context);
    return { content: response.choices[0].message.content || "" };
  }

  async expandContent(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const prompt = `Please expand the following text with relevant details, examples, or explanations while maintaining the original tone and style:

${text}`;

    const response = await this.createCompletion(prompt, "expansion", context);
    return { content: response.choices[0].message.content || "" };
  }

  async getSuggestions(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const documentType = context?.documentType || "general";
    const currentSection = context?.currentSection || "body";

    const prompt = `Based on the following text and context (document type: ${documentType}, section: ${currentSection}), provide relevant suggestions for improvement, expansion, or related content:

${text}`;

    const response = await this.createCompletion(
      prompt,
      "suggestions",
      context
    );
    return { content: response.choices[0].message.content || "" };
  }
}
