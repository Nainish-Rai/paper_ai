import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const compatibleBaseUrl = process.env.OPENAI_API_BASE_URL;
const usesGroqCompatibleApi = compatibleBaseUrl?.includes("api.groq.com");

export const DEFAULT_AI_MODEL =
  process.env.AI_MODEL ||
  (usesGroqCompatibleApi ? "llama-3.3-70b-versatile" : "gpt-4o-mini");

export const FAST_AI_MODEL =
  process.env.FAST_AI_MODEL ||
  (usesGroqCompatibleApi ? "llama-3.1-8b-instant" : DEFAULT_AI_MODEL);

export function getAIProvider() {
  if (!compatibleBaseUrl) {
    return createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return createOpenAICompatible({
    name: process.env.AI_PROVIDER_NAME || "paper-ai",
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: compatibleBaseUrl,
  });
}

export function getLanguageModel(model = DEFAULT_AI_MODEL) {
  return getAIProvider()(model);
}

export function getOpenAIClientConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY,
    ...(compatibleBaseUrl ? { baseURL: compatibleBaseUrl } : {}),
  };
}
