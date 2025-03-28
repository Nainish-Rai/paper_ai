"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
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
import styles from "../CollaborativeEditor.module.css";
import { AIButton } from "./AIButton";

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
        formattingToolbar={false}
      >
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
