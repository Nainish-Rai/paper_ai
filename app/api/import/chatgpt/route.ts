import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import {
  buildImportedChatDocumentContent,
  parseChatGPTSharedPage,
  parseChatGPTShareUrl,
} from "@/lib/importers/chatgpt";
import {
  findImportedChatBySource,
  saveImportedChat,
} from "@/lib/repositories/importedChats";

export const runtime = "nodejs";

const IMPORT_TIMEOUT_MS = 12_000;

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json();
    if (typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { message: "Paste a public ChatGPT shared link." },
        { status: 400 }
      );
    }

    const sharedLink = parseChatGPTShareUrl(url);
    const existingImport = await findImportedChatBySource(
      session.user.id,
      sharedLink.sourceId
    );

    if (existingImport) {
      return NextResponse.json({
        documentId: existingImport.documentId,
        importedChatId: existingImport._id?.toString(),
        reused: true,
      });
    }

    const html = await fetchSharedChatPage(sharedLink.normalizedUrl);
    const parsedChat = parseChatGPTSharedPage(html);

    if (!parsedChat.rawText) {
      return NextResponse.json(
        {
          message:
            "This shared link is not available. Check that it is public.",
        },
        { status: 422 }
      );
    }

    const title = formatDocumentTitle(parsedChat.title);
    const content = buildImportedChatDocumentContent(
      parsedChat,
      sharedLink.normalizedUrl
    );

    const document = await db.document.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        shared: false,
      },
    });

    let importedChat;

    try {
      importedChat = await saveImportedChat({
        userId: session.user.id,
        documentId: document.id,
        source: "chatgpt",
        sourceUrl: sharedLink.normalizedUrl,
        sourceId: sharedLink.sourceId,
        title: parsedChat.title,
        rawText: parsedChat.rawText,
        messages: parsedChat.messages,
        tags: ["chatgpt"],
        importStatus: parsedChat.importStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      await db.document.delete({
        where: {
          id: document.id,
        },
      });
      throw error;
    }

    return NextResponse.json(
      {
        documentId: document.id,
        importedChatId: importedChat._id?.toString(),
        importStatus: importedChat.importStatus,
        title: document.title,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to import ChatGPT link.";
    const status = isUserInputError(message) ? 400 : 500;

    console.error("[ChatGPT Import]", error);
    return NextResponse.json({ message }, { status });
  }
}

async function fetchSharedChatPage(sourceUrl: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMPORT_TIMEOUT_MS);

  try {
    const response = await fetch(sourceUrl, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "Mozilla/5.0 (compatible; PaperAIImporter/1.0; +https://github.com/nainish-rai/paper_ai)",
      },
    });

    if (!response.ok) {
      throw new Error(
        "This shared link is not available. Check that it is public."
      );
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function formatDocumentTitle(title: string) {
  const cleanTitle = title.replace(/\s+/g, " ").trim();
  return `ChatGPT: ${cleanTitle || "Imported chat"}`.slice(0, 140);
}

function isUserInputError(message: string) {
  return (
    message.includes("ChatGPT shared link") ||
    message.includes("valid ChatGPT") ||
    message.includes("shared link is not available")
  );
}
