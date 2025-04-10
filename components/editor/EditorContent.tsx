"use client";

import { BlockNoteView } from "@blocknote/mantine";
import { useCallback, useEffect, useState } from "react";
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FormattingToolbar,
  FormattingToolbarController,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
} from "@blocknote/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { BlockNoteEditor } from "@blocknote/core";
import styles from "../CollaborativeEditor.module.css";
import { AIButton } from "./AIButton";

type EditorContentProps = {
  editor: BlockNoteEditor | null;
};

export function EditorContent({ editor }: { editor: any }) {
  const { theme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Mock saving indicator for UX improvement
  const triggerSavingIndicator = useCallback(() => {
    if (saveTimer) clearTimeout(saveTimer);
    setIsSaving(true);
    const timer = setTimeout(() => {
      setIsSaving(false);
    }, 1500);
    setSaveTimer(timer);
  }, [saveTimer]);

  useEffect(() => {
    if (!editor) return;

    const handleContentChange = () => {
      triggerSavingIndicator();
    };

    // Subscribe to editor changes
    editor.onEditorContentChange(handleContentChange);

    return () => {
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [editor, triggerSavingIndicator, saveTimer]);

  if (!editor) return null;

  return (
    <div className="relative w-full min-h-[calc(100vh-200px)]">
      {isSaving && (
        <div className="absolute z-50 top-2 right-2 px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 opacity-80 transition-opacity duration-200">
          Saving...
        </div>
      )}
      <BlockNoteView
        editor={editor}
        theme={theme as "light" | "dark"}
        formattingToolbar={false}
        className={
          cn(
            " w-full h-full",
            "prose prose-stone dark:prose-invert max-w-none focus:outline-none",
            "prose-headings:font-normal prose-h1:text-3xl prose-h1:font-medium",
            "prose-h2:text-2xl prose-h2:font-medium prose-h3:text-xl prose-h3:font-medium",
            "prose-p:text-base prose-p:leading-relaxed prose-p:my-2",
            "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
            "prose-blockquote:border-l-2 prose-blockquote:border-neutral-200 dark:prose-blockquote:border-neutral-700",
            "prose-blockquote:pl-4 prose-blockquote:text-neutral-600 dark:prose-blockquote:text-neutral-400",
            "prose-hr:border-neutral-200 dark:prose-hr:border-neutral-800",
            "prose-table:border prose-table:border-collapse prose-table:border-neutral-300 dark:prose-table:border-neutral-700",
            "prose-td:border prose-td:border-neutral-300 dark:prose-td:border-neutral-700 prose-td:px-3 prose-td:py-2",
            "prose-th:border prose-th:border-neutral-300 dark:prose-th:border-neutral-700 prose-th:px-3 prose-th:py-2 prose-th:bg-neutral-100 dark:prose-th:bg-neutral-800",
            "selection:bg-blue-200 dark:selection:bg-blue-800"
          ) +
          " " +
          styles.editor
        }
      >
        {" "}
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <BlockTypeSelect key={"blockTypeSelect"} />

              <BasicTextStyleButton
                basicTextStyle={"bold"}
                key={"boldStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"italic"}
                key={"italicStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"underline"}
                key={"underlineStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"strike"}
                key={"strikeStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"code"}
                key={"codeStyleButton"}
              />

              <TextAlignButton
                textAlignment={"left"}
                key={"textAlignLeftButton"}
              />
              <TextAlignButton
                textAlignment={"center"}
                key={"textAlignCenterButton"}
              />
              <TextAlignButton
                textAlignment={"right"}
                key={"textAlignRightButton"}
              />

              <ColorStyleButton key={"colorStyleButton"} />

              <NestBlockButton key={"nestBlockButton"} />
              <UnnestBlockButton key={"unnestBlockButton"} />

              <CreateLinkButton key={"createLinkButton"} />

              <AIButton key={"aiButton"} />
            </FormattingToolbar>
          )}
        />
      </BlockNoteView>
    </div>
  );
}
