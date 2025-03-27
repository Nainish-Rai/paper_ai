import { AIService } from "@/lib/ai/service";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { text, userId } = await req.json();

    if (!text || !userId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
        }),
        { status: 400 }
      );
    }

    const aiService = new AIService(userId);
    const result = await aiService.generateSummary(text);

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
