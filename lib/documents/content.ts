export function documentContentToText(content?: string | null) {
  if (!content) return "";

  try {
    const blocks = JSON.parse(content);
    return extractText(blocks).replace(/\n{3,}/g, "\n\n").trim();
  } catch {
    return content;
  }
}

function extractText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(extractText).filter(Boolean).join("\n");
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  const record = value as Record<string, unknown>;
  const currentText = typeof record.text === "string" ? record.text : "";
  const contentText = extractText(record.content);
  const childrenText = extractText(record.children);

  return [currentText, contentText, childrenText].filter(Boolean).join("\n");
}
