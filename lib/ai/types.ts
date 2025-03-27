export interface AIContextState {
  documentType: string;
  currentSection: string;
  selectedText: string;
  history: AIAction[];
  modelConfig: AIModelConfig;
}

export interface AIModelConfig {
  temperature: number;
  max_tokens: number;
}

export interface AIAction {
  type: AIActionType;
  input: string;
  output: string;
  timestamp: Date;
}

export type AIActionType =
  | "completion"
  | "grammar"
  | "style"
  | "summary"
  | "expansion"
  | "template";

export interface AICommand {
  name: string;
  description: string;
  type: AIActionType;
  action: (context: AIContextState) => Promise<void>;
  shortcut?: string;
  responseType: "stream" | "single";
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface UsageMetrics {
  userId: string;
  requestCount: number;
  tokensUsed: number;
  timestamp: Date;
  modelType: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

// Error types
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = "AIError";
  }
}

export class RateLimitError extends AIError {
  constructor(message: string, public retryAfter: number) {
    super(message, "RATE_LIMIT_EXCEEDED", 429);
    this.name = "RateLimitError";
  }
}

// Constants
export const AI_RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 20,
  MAX_TOKENS_PER_DAY: 100000,
};

export const DEFAULT_MODEL_CONFIG: AIModelConfig = {
  temperature: 0.7,
  max_tokens: 1000,
};

export const AI_COMMAND_SHORTCUTS = {
  completion: "/",
  grammar: "g",
  style: "s",
  summary: "m",
  expansion: "e",
  template: "t",
} as const;
