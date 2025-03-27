import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import {
  AIContextState,
  AIError,
  AIResponse,
  StyleAnalysis,
  DocumentTemplate,
  StructuredAIResponse,
} from "./types";
import { RateLimiter } from "./rateLimiter";
import { AICache } from "./cache";
import { AIMonitoring } from "./monitoring";

const MODEL_NAME = "llama-3.3-70b-versatile";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const DEFAULT_CONFIG = {
  temperature: 1,
  max_tokens: 1024,
  response_format: {
    type: "json_object",
  },
};

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
            context?.modelConfig?.max_tokens || DEFAULT_CONFIG.max_tokens,
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
        const config: OpenAI.Chat.ChatCompletionCreateParams = {
          model: MODEL_NAME,
          messages: [{ role: "user" as const, content: prompt }],
          temperature: DEFAULT_CONFIG.temperature,
          max_tokens: DEFAULT_CONFIG.max_tokens,
          response_format: {
            type: "json_object" as const,
          },
          ...(context?.modelConfig || {}),
        };

        const response = await this.openai.chat.completions.create(config);

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
        const config: OpenAI.Chat.ChatCompletionCreateParams = {
          model: MODEL_NAME,
          messages: [{ role: "user" as const, content: prompt }],
          temperature: DEFAULT_CONFIG.temperature,
          max_tokens: DEFAULT_CONFIG.max_tokens,
          response_format: {
            type: "json_object" as const,
          },
          ...(context?.modelConfig || {}),
          stream: true as const,
        };

        return this.openai.chat.completions.create(config);
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

    const prompt = `Please check the following text for grammatical errors and suggest corrections. Provide your response as a JSON object with 'improvedText', 'corrections', and 'readabilityScore' fields:

${text}`;

    const response = await this.createCompletion(prompt, "grammar", context);
    const jsonResponse = JSON.parse(
      response.choices[0].message.content || "{}"
    );

    const structuredResponse: StructuredAIResponse = {
      improvedText: jsonResponse.improvedText || text,
      analysis: {
        readability: {
          score: jsonResponse.readabilityScore || 0,
          suggestions: jsonResponse.suggestions || [],
        },
        improvements:
          jsonResponse.corrections?.map((c: any) => ({
            type: "grammar",
            original: c.original,
            suggestion: c.correction,
            explanation: c.explanation,
          })) || [],
      },
    };

    const result = {
      content: jsonResponse.improvedText || text,
      structuredResponse,
    };

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
    if (cached)
      return {
        content: cached.enhancedText,
        analysis: cached,
        structuredResponse: {
          improvedText: cached.enhancedText,
          analysis: {
            tone: cached.tone,
            readability: cached.readability,
            improvements: cached.improvements,
          },
        },
      };

    const prompt = `Analyze and improve the following text. Respond with a JSON object containing:
{
  "improvedText": "the enhanced version of the text",
  "tone": {
    "category": "formal|informal|technical|conversational",
    "suggestions": ["array of tone improvement suggestions"]
  },
  "readability": {
    "score": 0-100,
    "suggestions": ["array of readability improvements"]
  },
  "improvements": [
    {
      "type": "clarity|conciseness|engagement|structure",
      "original": "original text",
      "suggestion": "improved version",
      "explanation": "why this improves the text"
    }
  ]
}

Text to analyze:
${text}`;

    const response = await this.createCompletion(prompt, "style", context);
    const analysis = JSON.parse(
      response.choices[0].message.content || "{}"
    ) as StyleAnalysis;

    const structuredResponse: StructuredAIResponse = {
      improvedText: analysis.enhancedText,
      analysis: {
        tone: analysis.tone,
        readability: analysis.readability,
        improvements: analysis.improvements,
      },
    };

    // Cache the result
    await this.cache.setStyleAnalysis(text, analysis);

    return {
      content: analysis.enhancedText,
      analysis,
      structuredResponse,
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
    const prompt = `Analyze the tone and writing style of the following text. Consider formality, technical level, and engagement. Respond with a JSON object containing 'analysis', 'suggestions', and 'improvedText' fields:

${text}`;

    const response = await this.createCompletion(prompt, "tone", context);
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      content: result.improvedText || text,
      structuredResponse: {
        improvedText: result.improvedText || text,
        analysis: {
          tone: result.analysis || {},
          improvements:
            result.suggestions?.map((s: string) => ({
              type: "tone",
              original: "",
              suggestion: s,
              explanation: s,
            })) || [],
        },
      },
    };
  }

  async analyzeReadability(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const prompt = `Analyze the readability of the following text. Consider sentence structure, vocabulary level, and overall clarity. Respond with a JSON object containing 'score', 'suggestions', and 'improvedText' fields:

${text}`;

    const response = await this.createCompletion(
      prompt,
      "readability",
      context
    );
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      content: result.improvedText || text,
      structuredResponse: {
        improvedText: result.improvedText || text,
        analysis: {
          readability: {
            score: result.score || 0,
            suggestions: result.suggestions || [],
          },
        },
      },
    };
  }

  async generateSummary(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const prompt = `Please provide a concise summary of the following text. Respond with a JSON object containing:
{
  "improvedText": "the summarized version",
  "summary": "a brief overview",
  "keyPoints": ["array of main points"],
  "analysis": {
    "focus": "main topic or theme",
    "tone": "document tone",
    "audience": "intended audience"
  }
}

Text to summarize:
${text}`;

    const response = await this.createCompletion(prompt, "summary", context);
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      content: result.improvedText || result.summary || text,
      structuredResponse: {
        improvedText: result.improvedText || result.summary || text,
        analysis: {
          improvements:
            result.keyPoints?.map((point: string) => ({
              type: "key-point",
              original: "",
              suggestion: point,
              explanation: point,
            })) || [],
        },
      },
    };
  }

  async expandContent(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const prompt = `Please expand the following text with relevant details, examples, or explanations while maintaining the original tone and style. Respond with a JSON object containing 'improvedText', 'additions', and 'explanations' fields:

${text}`;

    const response = await this.createCompletion(prompt, "expansion", context);
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      content: result.improvedText || text,
      structuredResponse: {
        improvedText: result.improvedText || text,
        analysis: {
          improvements:
            result.additions?.map((addition: string, i: number) => ({
              type: "expansion",
              original: text,
              suggestion: addition,
              explanation: result.explanations?.[i] || "Added detail",
            })) || [],
        },
      },
    };
  }

  async getSuggestions(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const documentType = context?.documentType || "general";
    const currentSection = context?.currentSection || "body";

    const prompt = `Based on the following text and context (document type: ${documentType}, section: ${currentSection}), provide relevant suggestions for improvement, expansion, or related content. Respond with a JSON object containing 'improvedText', 'suggestions', and 'explanations' fields:

${text}`;

    const response = await this.createCompletion(
      prompt,
      "suggestions",
      context
    );
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      content: result.improvedText || text,
      structuredResponse: {
        improvedText: result.improvedText || text,
        analysis: {
          improvements:
            result.suggestions?.map((suggestion: string, i: number) => ({
              type: "suggestion",
              original: text,
              suggestion,
              explanation: result.explanations?.[i] || "Suggested improvement",
            })) || [],
        },
      },
    };
  }
}
