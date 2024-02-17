import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  const openai = new OpenAI({
    baseURL: process.env.OPENAI_API_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY,
  });

  let { prompt } = await req.json();
  console.log(prompt);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "You are an AI writing assistant that continues existing text based on context from prior text.Give more weight/priority to the later characters than the beginning ones Limit your response to no more than 200 characters, but make sure to construct complete sentences.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}
