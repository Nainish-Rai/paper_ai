/**
 * Converts markdown content to BlockNote compatible block array
 */
export function markdownToBlocks(markdown: string) {
  // Split markdown into lines
  const lines = markdown.split("\n");
  const blocks = [];

  for (const line of lines) {
    if (!line.trim()) {
      // Empty line becomes a paragraph block
      blocks.push({
        type: "paragraph",
        content: [{ type: "text", text: "", styles: {} }],
      });
      continue;
    }

    // Handle headings
    const headingMatch = line.match(/^(#{1,6})\s(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      blocks.push({
        type: "heading",
        content: [{ type: "text", text: headingMatch[2].trim(), styles: {} }],
        props: { level },
      });
      continue;
    }

    // Handle bullet points
    if (line.trim().startsWith("- ")) {
      blocks.push({
        type: "bulletListItem",
        content: [{ type: "text", text: line.trim().substring(2), styles: {} }],
      });
      continue;
    }

    // Handle numbered lists
    if (/^\d+\.\s/.test(line)) {
      blocks.push({
        type: "numberedListItem",
        content: [
          { type: "text", text: line.replace(/^\d+\.\s/, ""), styles: {} },
        ],
      });
      continue;
    }

    // Default to paragraph
    blocks.push({
      type: "paragraph",
      content: [{ type: "text", text: line.trim(), styles: {} }],
    });
  }

  return blocks;
}
