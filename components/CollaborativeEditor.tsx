"use client";

import { use, useState } from "react";
import { AccessDeniedDialog } from "@/components/ui/access-denied-dialog";
import { EditorProvider } from "./editor/EditorProvider";
import { EditorContent } from "./editor/EditorContent";
import { EditorHeader } from "./editor/EditorHeader";
import { useDocumentData } from "@/hooks/useDocumentData";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { ErrorDisplay } from "./ui/ErrorDisplay";
import { useAICompletion } from "@/hooks/useAICompletion";
import { Button } from "./ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { DefaultBlockSchema, PartialBlock } from "@blocknote/core";
import { toast } from "sonner";
import { parse } from "path";
import { useAuth } from "../lib/auth/provider";

export function CollaborativeEditor({ documentId }: { documentId: string }) {
  const userId = useAuth().user?.id;
  return (
    <EditorProvider userId={userId || ""} documentId={documentId}>
      <EditorWrapper userId={userId || ""} documentId={documentId} />
    </EditorProvider>
  );
}

function EditorWrapper({
  userId,
  documentId,
}: {
  userId: string;
  documentId: string;
}) {
  const { isLoading, error, accessDenied, initialContent, editor } =
    useDocumentData(documentId);
  const { generateCompletion, isGenerating } = useAICompletion();

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

      // Get the text content from the current block using lossy markdown conversion
      const blockText = editor.blocksToMarkdownLossy([block]);

      // Wait for the completion result
      const completion = await generateCompletion(await blockText);
      if (!completion) {
        toast.error("Failed to generate completion");
        return;
      }

      console.log("ai content", completion);

      // // Create a new block with the completion
      // const newBlock: PartialBlock<DefaultBlockSchema> = {
      //   type: "paragraph",
      //   content: completion,
      // };

      const parsedMdBlock = await editor.tryParseMarkdownToBlocks(completion);

      // Insert after the current block
      editor.insertBlocks(parsedMdBlock, currentBlockId, "after");
      toast.success("AI completion added");
    } catch (err) {
      console.error("AI completion error:", err);
      toast.error("Failed to generate AI completion");
    }
  };

  if (accessDenied) {
    return <AccessDeniedDialog />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="flex flex-col h-full">
      <EditorHeader
        userId={userId || ""}
        documentId={documentId}
        editor={editor}
        rightContent={
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIComplete}
            disabled={isGenerating}
            className="gap-2"
            title="Generate AI completion for selected text"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            AI Complete
          </Button>
        }
      />
      <EditorContent editor={editor} />
    </div>
  );
}
