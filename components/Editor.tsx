"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import * as Y from "yjs";
import LiveblocksProvider from "@liveblocks/yjs";
import { useRoom, useSelf } from "@/liveblocks.config";
import { useCallback, useEffect, useState } from "react";
import { Avatars } from "@/components/Avatars";
import styles from "./Editor.module.css";
// import { MoonIcon, SunIcon } from "@/icons";
import { Button } from "@/components/Button";

// Collaborative text editor with simple rich text, live cursors, and live avatars
export function Editor() {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<any>();

  // Set up Liveblocks Yjs provider
  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
    };
  }, [room]);

  if (!doc || !provider) {
    return null;
  }

  return <BlockNote doc={doc} provider={provider} />;
}

type EditorProps = {
  doc: Y.Doc;
  provider: any;
};

function BlockNote({ doc, provider }: EditorProps) {
  // Get user info from Liveblocks authentication endpoint
  const userInfo: any = useSelf((me) => me.info);

  const editor: BlockNoteEditor = useBlockNote({
    collaboration: {
      provider,

      // Where to store BlockNote data in the Y.Doc:
      fragment: doc.getXmlFragment("document-store"),

      // Information for this user:

      user: {
        name: userInfo.name,
        color: userInfo.color,
      },
    },
  });

  const [theme, setTheme] = useState<"light" | "dark">("light");

  const changeTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
  }, [theme]);

  return (
    <div className="w-full min-h-screen bg-gray-100  ">
      <div className=" border-2  border-sky-500">
        <Button
          className={styles.button}
          variant="subtle"
          onClick={changeTheme}
          aria-label="Switch Theme"
        >
          {theme === "dark" ? <>light</> : <>dark</>}
        </Button>
        <Avatars />
      </div>
      <div className="w-full max-w-7xl shadow-xl bg-white  rounded-3xl mx-auto mt-24">
        <BlockNoteView
          editor={editor}
          className="w-full scrollbar-hide overflow-scroll p-6 pt-8 rounded-3xl"
          theme={theme}
        />
      </div>
    </div>
  );
}
