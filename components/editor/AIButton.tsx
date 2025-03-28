"use client";

import {
  useBlockNoteEditor,
  useComponentsContext,
  useEditorContentOrSelectionChange,
} from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useAICompletion } from "@/hooks/useAICompletion";
import { toast } from "sonner";

export function AIButton() {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext()!;
  const { generateCompletion, isGenerating } = useAICompletion();

  // Tracks whether text is selected
  const [isTextSelected, setIsTextSelected] = useState<boolean>(false);

  // Updates state on content or selection change
  useEditorContentOrSelectionChange(() => {
    const selection = editor.getSelection();
    setIsTextSelected(!!selection?.blocks.length);
  }, editor);

  const handleAIComplete = async () => {
    if (!editor || isGenerating) return;

    try {
      // Get the currently focused block
      const currentBlockId = editor.getSelection()?.blocks[0];
      if (!currentBlockId) {
        toast.error("Please select some text first");
        return;
      }

      const block = editor.getBlock(currentBlockId);
      if (!block) {
        toast.error("Could not find selected block");
        return;
      }

      // Get the text content from the current block
      const blockText = editor.blocksToMarkdownLossy([block]);

      // Wait for the completion result
      const completion = await generateCompletion(await blockText);
      if (!completion) {
        toast.error("Failed to generate completion");
        return;
      }

      const parsedMdBlock = await editor.tryParseMarkdownToBlocks(completion);

      // Insert after the current block
      editor.insertBlocks(parsedMdBlock, currentBlockId, "after");
      toast.success("AI completion added");
    } catch (err) {
      console.error("AI completion error:", err);
      toast.error("Failed to generate AI completion");
    }
  };

  return (
    <Components.FormattingToolbar.Button
      mainTooltip={"AI Autocomplete"}
      onClick={handleAIComplete}
      isSelected={false}
      isDisabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
    </Components.FormattingToolbar.Button>
  );
}
