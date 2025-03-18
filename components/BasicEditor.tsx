"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { useBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";
import { useMemo } from "react";

type BasicEditorProps = {
  content?: string;
  onChange?: (content: string) => void;
};

export default function BasicEditor({ content, onChange }: BasicEditorProps) {
  const { theme } = useTheme();

  const editor: BlockNoteEditor = useBlockNote({
    initialContent: content ? JSON.parse(content) : undefined,
    domAttributes: {
      editor: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg prose-stone dark:prose-invert focus:outline-none max-w-full",
      },
    },
  });

  // Subscribe to content changes
  editor.onEditorContentChange(() => {
    if (onChange) {
      const blocks = editor.topLevelBlocks;
      onChange(JSON.stringify(blocks));
    }
  });

  return (
    <div className="w-full bg-gray-100 h-full shadow-md">
      <div className="w-full shadow-xl bg-white mx-auto mt-4">
        <BlockNoteView
          editor={editor}
          className="w-full min-h-screen scrollbar-hide overflow-scroll md:p-6 pt-4 rounded-3xl"
          theme={theme as "light" | "dark"}
        />
      </div>
    </div>
  );
}
