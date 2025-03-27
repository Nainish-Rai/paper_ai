"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { ExportButton } from "@/components/ui/export-button";
import { DocxImportButton } from "./DocxImportButton";
import styles from "../CollaborativeEditor.module.css";
import { ReactNode } from "react";

type EditorHeaderProps = {
  editor: BlockNoteEditor | null;
  documentId: string;
  rightContent?: ReactNode;
};

export function EditorHeader({
  editor,
  documentId,
  rightContent,
}: EditorHeaderProps) {
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

  return (
    <div className={styles.editorHeader}>
      <div className="flex items-center justify-end gap-2 p-2">
        {rightContent}
        <DocxImportButton onImport={handleImport} />
        <ExportButton editor={editor} documentId={documentId} />
      </div>
    </div>
  );
}
