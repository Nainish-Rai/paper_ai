import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const DEFAULT_AI_BASE_URL = "https://api.groq.com/openai/v1";
export const DEFAULT_AI_MODEL = "llama-3.3-70b-versatile";
export const FAST_AI_MODEL = "llama-3.1-8b-instant";

export function getAIProvider() {
  return createOpenAICompatible({
    name: "paper-ai",
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE_URL || DEFAULT_AI_BASE_URL,
  });
}

export function getLanguageModel(model = DEFAULT_AI_MODEL) {
  return getAIProvider()(model);
}
