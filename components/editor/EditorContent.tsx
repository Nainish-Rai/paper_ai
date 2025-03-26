"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";
import styles from "../CollaborativeEditor.module.css";

type EditorContentProps = {
  editor: BlockNoteEditor | null;
};

export function EditorContent({ editor }: EditorContentProps) {
  const { theme } = useTheme();

  if (!editor) return null;

  return (
    <div className={styles.editorPanel}>
      <BlockNoteView
        editor={editor}
        className={styles.editorContainer}
        theme={theme as "light" | "dark"}
      />
    </div>
  );
}
