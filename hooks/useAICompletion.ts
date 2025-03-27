import { useState } from "react";
import { useCompletion } from "ai/react";

export function useAICompletion() {
  const [isGenerating, setIsGenerating] = useState(false);

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/ai/autocomplete",
    onResponse: () => {
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
    },
  });

  const generateCompletion = async (text: string): Promise<string> => {
    try {
      setIsGenerating(true);
      const response = await complete(text);
      return response || ""; // Return empty string if response is null/undefined
    } catch (error) {
      console.error("Error generating completion:", error);
      return "";
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateCompletion,
    completion,
    isGenerating: isLoading || isGenerating,
  };
}
