import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AIError, AIResponse } from "@/lib/ai/types";

interface AIFeatureOptions {
  userId: string;
  onSuccess?: (response: AIResponse) => void;
  onError?: (error: Error) => void;
}

export function useAIFeatures(options: AIFeatureOptions) {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleError = (error: Error) => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
    options.onError?.(error);
  };

  const makeRequest = async (
    endpoint: string,
    text: string
  ): Promise<AIResponse> => {
    const response = await fetch(`/api/ai/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, userId: options.userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AIError(
        error.error || "Request failed",
        "API_ERROR",
        response.status
      );
    }

    return response.json();
  };

  const checkGrammar = async (text: string) => {
    setLoading((prev) => ({ ...prev, grammar: true }));
    try {
      const response = await makeRequest("grammar", text);
      options.onSuccess?.(response);
      return response;
    } catch (error: any) {
      handleError(error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, grammar: false }));
    }
  };

  const improveStyle = async (text: string) => {
    setLoading((prev) => ({ ...prev, style: true }));
    try {
      const response = await makeRequest("style", text);
      options.onSuccess?.(response);
      return response;
    } catch (error: any) {
      handleError(error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, style: false }));
    }
  };

  const generateSummary = async (text: string) => {
    setLoading((prev) => ({ ...prev, summary: true }));
    try {
      const response = await makeRequest("summary", text);
      options.onSuccess?.(response);
      return response;
    } catch (error: any) {
      handleError(error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, summary: false }));
    }
  };

  const expandContent = async (text: string) => {
    setLoading((prev) => ({ ...prev, expand: true }));
    try {
      const response = await makeRequest("expand", text);
      options.onSuccess?.(response);
      return response;
    } catch (error: any) {
      handleError(error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, expand: false }));
    }
  };

  const isLoading = (feature: string) => loading[feature] || false;

  return {
    checkGrammar,
    improveStyle,
    generateSummary,
    expandContent,
    isLoading,
  };
}
