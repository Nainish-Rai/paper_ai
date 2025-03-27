import { AIService } from "@/lib/ai/service";
import { NextRequest } from "next/server";
import { AIContextState } from "@/lib/ai/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { text, userId, context } = await req.json();

    if (!text || !userId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
        }),
        { status: 400 }
      );
    }

    const aiContext: Partial<AIContextState> = {
      documentType: context?.documentType || "general",
      currentSection: context?.currentSection || "body",
      selectedText: text,
      modelConfig: context?.modelConfig,
    };

    const aiService = new AIService(userId);
    const result = await aiService.getSuggestions(text, aiContext);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      { status: error.status || 500 }
    );
  }
}
