import { markdownToBlocks } from "@/lib/utils/markdownToBlocks";
import { ImportedChatMessage } from "@/lib/repositories/importedChats";

const MAX_RAW_TEXT_LENGTH = 120_000;

export type ParsedChatGPTShareUrl = {
  normalizedUrl: string;
  sourceId: string;
};

export type ParsedChatGPTShare = {
  title: string;
  rawText: string;
  messages: ImportedChatMessage[];
  importStatus: "imported" | "partial";
};

export function parseChatGPTShareUrl(input: string): ParsedChatGPTShareUrl {
  let url: URL;

  try {
    url = new URL(input.trim());
  } catch {
    throw new Error("Paste a valid ChatGPT shared link.");
  }

  const hostname = url.hostname.toLowerCase();
  const isSupportedHost =
    hostname === "chatgpt.com" || hostname === "chat.openai.com";

  if (!isSupportedHost) {
    throw new Error("Paste a public ChatGPT shared link.");
  }

  const match = url.pathname.match(/^\/share\/([^/?#]+)/);
  if (!match?.[1]) {
    throw new Error("Paste a public ChatGPT shared link.");
  }

  url.hash = "";

  return {
    normalizedUrl: url.toString(),
    sourceId: match[1],
  };
}

export function parseChatGPTSharedPage(html: string): ParsedChatGPTShare {
  const title = extractTitle(html);
  const jsonPayloads = extractJsonPayloads(html);
  const messages = extractStructuredMessages(jsonPayloads);
  const visibleText = extractVisibleText(html);
  const rawText = buildRawText(messages, visibleText);

  return {
    title,
    rawText,
    messages,
    importStatus: messages.length > 0 ? "imported" : "partial",
  };
}

export function buildImportedChatDocumentContent(
  parsed: ParsedChatGPTShare,
  sourceUrl: string
) {
  const transcript =
    parsed.messages.length > 0
      ? parsed.messages
          .map((message) => {
            const role = formatRole(message.role);
            return `### ${role}\n\n${message.content}`;
          })
          .join("\n\n")
      : parsed.rawText;

  const markdown = [
    `# ${parsed.title}`,
    "",
    "## Source",
    `Imported from: ${sourceUrl}`,
    "",
    "## Summary",
    "Use the note agent to create a grounded summary from this imported snapshot.",
    "",
    "## Action Items",
    "- Review this imported conversation.",
    "- Extract follow-up tasks with the note agent.",
    "",
    "## Transcript",
    transcript,
  ].join("\n");

  return JSON.stringify(markdownToBlocks(markdown));
}

function extractTitle(html: string) {
  const metaTitle = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i
  )?.[1];

  const title =
    metaTitle || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const decodedTitle = decodeHtmlEntities(title || "Imported ChatGPT chat")
    .replace(/\s*\|\s*ChatGPT\s*$/i, "")
    .trim();

  return decodedTitle || "Imported ChatGPT chat";
}

function extractJsonPayloads(html: string) {
  const payloads: unknown[] = [];
  const nextDataMatch = html.match(
    /<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i
  );

  if (nextDataMatch?.[1]) {
    try {
      payloads.push(JSON.parse(decodeHtmlEntities(nextDataMatch[1])));
    } catch {
      // Ignore malformed framework data and fall back to visible text.
    }
  }

  const applicationJsonScripts = html.matchAll(
    /<script[^>]+type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  for (const match of applicationJsonScripts) {
    try {
      payloads.push(JSON.parse(decodeHtmlEntities(match[1])));
    } catch {
      // Ignore unrelated JSON scripts.
    }
  }

  return payloads;
}

function extractStructuredMessages(payloads: unknown[]) {
  const messages: ImportedChatMessage[] = [];
  const seen = new Set<string>();

  for (const payload of payloads) {
    visitPayload(payload, messages, seen);
  }

  return messages.map((message, index) => ({
    ...message,
    index,
  }));
}

function visitPayload(
  value: unknown,
  messages: ImportedChatMessage[],
  seen: Set<string>
) {
  if (!value || typeof value !== "object") {
    return;
  }

  const record = value as Record<string, unknown>;
  const candidate = getMessageCandidate(record);

  if (candidate) {
    const key = `${candidate.role}:${candidate.content}`;
    if (!seen.has(key)) {
      seen.add(key);
      messages.push({
        ...candidate,
        index: messages.length,
      });
    }
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      visitPayload(item, messages, seen);
    }
    return;
  }

  for (const nextValue of Object.values(record)) {
    visitPayload(nextValue, messages, seen);
  }
}

function getMessageCandidate(record: Record<string, unknown>) {
  const nestedMessage = asRecord(record.message);
  if (nestedMessage) {
    return parseMessageRecord(nestedMessage);
  }

  return parseMessageRecord(record);
}

function parseMessageRecord(record: Record<string, unknown>) {
  const author = asRecord(record.author);
  const role = normalizeRole(
    stringValue(author?.role) || stringValue(record.role)
  );
  const content = extractMessageContent(record.content);

  if (!content || content.length < 2) {
    return null;
  }

  return {
    role,
    content,
    index: 0,
  };
}

function extractMessageContent(value: unknown): string | null {
  if (typeof value === "string") {
    return normalizeText(value);
  }

  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const parts = Array.isArray(record.parts)
    ? record.parts.map(extractPartText).filter(Boolean)
    : [];

  if (parts.length > 0) {
    return normalizeText(parts.join("\n\n"));
  }

  return normalizeText(
    stringValue(record.text) ||
      stringValue(record.content) ||
      stringValue(record.result) ||
      ""
  );
}

function extractPartText(part: unknown): string {
  if (typeof part === "string") {
    return part;
  }

  const record = asRecord(part);
  if (!record) {
    return "";
  }

  return (
    stringValue(record.text) ||
    stringValue(record.content) ||
    stringValue(record.value) ||
    ""
  );
}

function extractVisibleText(html: string) {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  return normalizeText(
    decodeHtmlEntities(withoutScripts.replace(/<[^>]+>/g, "\n"))
  );
}

function buildRawText(
  messages: ImportedChatMessage[],
  visibleText: string
): string {
  const text =
    messages.length > 0
      ? messages
          .map((message) => `${formatRole(message.role)}:\n${message.content}`)
          .join("\n\n")
      : visibleText;

  return text.slice(0, MAX_RAW_TEXT_LENGTH);
}

function normalizeText(value: string) {
  return decodeHtmlEntities(value)
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeRole(role?: string): ImportedChatMessage["role"] {
  if (role === "user" || role === "assistant" || role === "system") {
    return role;
  }

  return "unknown";
}

function formatRole(role: ImportedChatMessage["role"]) {
  switch (role) {
    case "user":
      return "User";
    case "assistant":
      return "Assistant";
    case "system":
      return "System";
    default:
      return "Conversation";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
