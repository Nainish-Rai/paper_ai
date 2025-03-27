import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  // Request the OpenAI API for the response
  const response = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    stream: true,
    messages: [
      { role: "user", content: `Complete this text naturally: ${prompt}` },
    ],
  });

  // Convert the response into a text-stream
  const stream = OpenAIStream(response as any);

  // Return a StreamingTextResponse, which can be consumed by the client
  return new StreamingTextResponse(stream);
}
