"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import * as Y from "yjs";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { Avatars } from "@/components/Avatars";
import styles from "./CollaborativeEditor.module.css";
import { ReactNode } from "react";

export function CollaborativeEditor() {
  const room = useRoom();
  const provider = getYjsProviderForRoom(room);
  const doc = provider.getYDoc();

  return <BlockNote doc={doc} provider={provider} />;
}

type EditorProps = {
  doc: Y.Doc;
  provider: any;
};

function BlockNote({ doc, provider }: EditorProps): ReactNode {
  const userInfo = useSelf((me) => me.info);
  const { theme } = useTheme();

  const editor: BlockNoteEditor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: (userInfo?.name as string) || "Anonymous",
        color: (userInfo?.color as string) || "#000000",
      },
    },
    domAttributes: {
      editor: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg prose-stone dark:prose-invert focus:outline-none max-w-full",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      console.log("Editor content updated through LiveBlocks");
    };

    // Subscribe to content changes
    const unsubscribe = editor.onEditorContentChange(handleUpdate);
    return unsubscribe;
  }, [editor]);

  return (
    <div className=" ">
      <div className={styles.editorHeader}>
        <Avatars />
      </div>
      <div className={styles.editorPanel}>
        <BlockNoteView
          editor={editor}
          className={styles.editorContainer}
          theme={theme as "light" | "dark"}
        />
      </div>
    </div>
  );
}
