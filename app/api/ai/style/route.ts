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

    const aiContext: Partial<AIContextState> = context || {};
    const aiService = new AIService(userId);
    const result = await aiService.improveStyle(text, aiContext);

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
