"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { ExportButton } from "@/components/ui/export-button";
import { DocxImportButton } from "./DocxImportButton";
import { AIToolbar } from "./AIToolbar";
import styles from "../CollaborativeEditor.module.css";
import { ReactNode, useState, useEffect, useCallback } from "react";

type EditorHeaderProps = {
  editor: BlockNoteEditor | null;
  documentId: string;
  userId: string;
  rightContent?: ReactNode;
};

export function EditorHeader({
  editor,
  documentId,
  userId,
  rightContent,
}: EditorHeaderProps) {
  const [selectedText, setSelectedText] = useState("");

  const updateSelection = useCallback(() => {
    if (!editor) return;

    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
    } else {
      // If no text is selected, get the current block's content
      const block = editor.getTextCursorPosition().block;
      if (block && "content" in block && block.content) {
        // Handle inline content
        const inlineContent = block.content;
        if (Array.isArray(inlineContent)) {
          const text = inlineContent
            .map((content) => {
              if ("text" in content) {
                return content.text;
              }
              return "";
            })
            .join("");
          setSelectedText(text);
        }
      } else {
        setSelectedText("");
      }
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    // Listen for selection changes
    document.addEventListener("selectionchange", updateSelection);

    // Listen for editor changes
    const unsubscribe = editor.onChange(updateSelection);

    return () => {
      document.removeEventListener("selectionchange", updateSelection);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [editor, updateSelection]);

  if (!editor) return null;

  const handleImport = async (html: string) => {
    if (!editor) return;

    try {
      // Convert HTML to BlockNote blocks
      const blocks = await editor.tryParseHTMLToBlocks(html);

      // Replace the current document content with the imported blocks
      editor.replaceBlocks(editor.document, blocks);
    } catch (error) {
      console.error("Error parsing HTML:", error);
    }
  };

  const handleAIUpdate = (text: string) => {
    if (!editor || !text) return;

    try {
      const selection = window.getSelection();
      const activeBlock = editor.getTextCursorPosition().block;

      if (selection && selection.rangeCount > 0 && selection.toString()) {
        // For selected text, create a new block with AI-generated content
        if (activeBlock) {
          editor.insertBlocks(
            [
              {
                type: "paragraph",
                content: [{ type: "text", text: text, styles: {} }],
              },
            ],
            activeBlock,
            "after"
          );
        }
      } else if (activeBlock) {
        // Replace current block content
        editor.updateBlock(activeBlock, {
          type: "paragraph",
          content: [{ type: "text", text: text, styles: {} }],
        });
      }
    } catch (error) {
      console.error("Error updating content:", error);
    }
  };

  return (
    <div className={styles.editorHeader}>
      <AIToolbar
        userId={userId}
        selectedText={selectedText}
        onUpdate={handleAIUpdate}
      />
      <div className="flex items-center justify-end gap-2 p-2">
        {rightContent}
        <DocxImportButton onImport={handleImport} />
        <ExportButton editor={editor} documentId={documentId} />
      </div>
    </div>
  );
}
