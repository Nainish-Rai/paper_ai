import { streamText } from "ai";
import { getLanguageModel, FAST_AI_MODEL } from "@/lib/ai/provider";

export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: getLanguageModel(FAST_AI_MODEL),
    prompt: `Complete this text naturally: ${prompt}`,
  });

  return result.toTextStreamResponse();
}
