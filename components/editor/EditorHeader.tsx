"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { ExportButton } from "@/components/ui/export-button";
import styles from "../CollaborativeEditor.module.css";

type EditorHeaderProps = {
  editor: BlockNoteEditor | null;
  documentId: string;
};

export function EditorHeader({ editor, documentId }: EditorHeaderProps) {
  if (!editor) return null;

  return (
    <div className={styles.editorHeader}>
      <div className="flex items-center justify-end p-2">
        <ExportButton editor={editor} documentId={documentId} />
      </div>
    </div>
  );
}
