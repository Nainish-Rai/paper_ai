import { NextResponse } from "next/server";
import { stepCountIs, streamText, tool } from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { getLanguageModel } from "@/lib/ai/provider";
import { documentContentToText } from "@/lib/documents/content";
import {
  findImportedChatByDocument,
  searchImportedChats,
} from "@/lib/repositories/importedChats";

export const runtime = "nodejs";

const MAX_DOCUMENT_CHARS = 24_000;
const MAX_SEARCH_CHARS = 1_500;

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const prompt = getPrompt(body);
    const documentId =
      typeof body.documentId === "string" ? body.documentId : undefined;

    if (!prompt) {
      return NextResponse.json(
        { message: "Ask a question about your notes." },
        { status: 400 }
      );
    }

    const result = streamText({
      model: getLanguageModel(),
      system: [
        "You are Paper AI, a grounded note assistant for imported AI chats and collaborative notes.",
        "Use tools when you need document or import context.",
        "Cite source titles or document titles when using tool results.",
        "Do not claim access to private ChatGPT chats or deleted upstream links.",
        "Keep answers concise and action-oriented.",
      ].join(" "),
      prompt,
      tools: {
        getCurrentDocument: tool({
          description:
            "Read the current document text and metadata when a document is open.",
          inputSchema: z.object({}),
          execute: async () => {
            if (!documentId) {
              return { found: false, reason: "No document is open." };
            }

            const document = await getAccessibleDocument(
              session.user.id,
              documentId
            );

            if (!document) {
              return { found: false, reason: "Document not found." };
            }

            return {
              found: true,
              id: document.id,
              title: document.title,
              updatedAt: document.updatedAt.toISOString(),
              text: documentContentToText(document.content).slice(
                0,
                MAX_DOCUMENT_CHARS
              ),
            };
          },
        }),
        getImportedChatSnapshot: tool({
          description:
            "Read the imported ChatGPT snapshot attached to the current document.",
          inputSchema: z.object({}),
          execute: async () => {
            if (!documentId) {
              return { found: false, reason: "No document is open." };
            }

            const document = await getAccessibleDocument(
              session.user.id,
              documentId
            );

            if (!document) {
              return { found: false, reason: "Document not found." };
            }

            const importedChat = await findImportedChatByDocument(
              session.user.id,
              documentId
            );

            if (!importedChat) {
              return {
                found: false,
                reason: "No imported ChatGPT snapshot is attached.",
              };
            }

            return {
              found: true,
              title: importedChat.title,
              sourceUrl: importedChat.sourceUrl,
              importStatus: importedChat.importStatus,
              messages: importedChat.messages.slice(0, 24),
              rawText: importedChat.rawText.slice(0, MAX_DOCUMENT_CHARS),
            };
          },
        }),
        searchNotes: tool({
          description:
            "Search the user's accessible documents and imported ChatGPT snapshots.",
          inputSchema: z.object({
            query: z.string().min(1).describe("Search query"),
          }),
          execute: async ({ query }) => {
            const [documents, importedChats] = await Promise.all([
              searchAccessibleDocuments(session.user.id, query),
              safeSearchImportedChats(session.user.id, query),
            ]);

            return {
              documents,
              importedChats,
            };
          },
        }),
      },
      stopWhen: stepCountIs(4),
      maxOutputTokens: 900,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run note agent.";

    console.error("[AI Agent]", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

function getPrompt(body: unknown) {
  if (!body || typeof body !== "object") return "";

  const record = body as Record<string, unknown>;
  if (typeof record.prompt === "string") {
    return record.prompt.trim();
  }

  if (typeof record.message === "string") {
    return record.message.trim();
  }

  return "";
}

async function getAccessibleDocument(userId: string, documentId: string) {
  const document = await db.document.findUnique({
    where: {
      id: documentId,
    },
    include: {
      permissions: {
        where: {
          userId,
        },
      },
    },
  });

  if (!document) return null;

  const canView =
    document.authorId === userId || document.shared || document.permissions.length > 0;

  return canView ? document : null;
}

async function searchAccessibleDocuments(userId: string, query: string) {
  const documents = await db.document.findMany({
    where: {
      AND: [
        {
          OR: [
            { authorId: userId },
            { shared: true },
            {
              permissions: {
                some: {
                  userId,
                },
              },
            },
          ],
        },
        {
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              content: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
      ],
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
    select: {
      id: true,
      title: true,
      content: true,
      updatedAt: true,
    },
  });

  return documents.map((document: {
    id: string;
    title: string;
    content: string | null;
    updatedAt: Date;
  }) => ({
    id: document.id,
    title: document.title,
    updatedAt: document.updatedAt.toISOString(),
    text: documentContentToText(document.content).slice(0, MAX_SEARCH_CHARS),
  }));
}

async function safeSearchImportedChats(userId: string, query: string) {
  try {
    const importedChats = await searchImportedChats(userId, query);

    return importedChats.map((importedChat) => ({
      documentId: importedChat.documentId,
      title: importedChat.title,
      sourceUrl: importedChat.sourceUrl,
      importStatus: importedChat.importStatus,
      text: importedChat.rawText.slice(0, MAX_SEARCH_CHARS),
    }));
  } catch (error) {
    return {
      unavailable: true,
      reason:
        error instanceof Error
          ? error.message
          : "Imported chat search is unavailable.",
    };
  }
}
