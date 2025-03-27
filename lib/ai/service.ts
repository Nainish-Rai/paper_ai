import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import {
  AIContextState,
  AIError,
  AIResponse,
  DEFAULT_MODEL_CONFIG,
  StyleAnalysis,
  DocumentTemplate,
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

    const response = await this.createCompletion(prompt, context);
    const analysis = JSON.parse(
      response.choices[0].message.content || "{}"
    ) as StyleAnalysis;

    return {
      content: analysis.enhancedText,
      analysis,
    };
  }

  async analyzeTone(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const prompt = `Analyze the tone and writing style of the following text. Consider formality, technical level, and engagement. Provide specific suggestions for maintaining consistency or adjusting tone as needed:

${text}`;

    const response = await this.createCompletion(prompt, context);
    return { content: response.choices[0].message.content || "" };
  }

  async analyzeReadability(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const prompt = `Analyze the readability of the following text. Consider sentence structure, vocabulary level, and overall clarity. Provide a readability score and specific suggestions for improvement:

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

    const response = await this.createCompletion(prompt, context);
    const template = JSON.parse(
      response.choices[0].message.content || "{}"
    ) as DocumentTemplate;

    return {
      content: JSON.stringify(template.structure, null, 2),
      template,
    };
  }

  async getSuggestions(
    text: string,
    context?: Partial<AIContextState>
  ): Promise<AIResponse> {
    const documentType = context?.documentType || "general";
    const currentSection = context?.currentSection || "body";

    const prompt = `Based on the following text and context (document type: ${documentType}, section: ${currentSection}), provide relevant suggestions for improvement, expansion, or related content:

${text}`;

    const response = await this.createCompletion(prompt, context);
    return { content: response.choices[0].message.content || "" };
  }
}
