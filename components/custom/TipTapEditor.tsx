"use client";

import { type Editor } from "@tiptap/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";
import { useCallback, useEffect } from "react";
import { useDocumentStore } from "@/lib/stores/documentStore";
import { useToast } from "@/components/ui/use-toast";

interface TipTapEditorProps {
  documentId: string;
  initialContent: string;
  className?: string;
}

export function TipTapEditor({
  documentId,
  initialContent,
  className,
}: TipTapEditorProps) {
  const { toast } = useToast();
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || "<p></p>",
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base lg:prose-lg prose-stone dark:prose-invert focus:outline-none max-w-full min-h-[500px] p-4",
          className
        ),
      },
    },
    onUpdate: ({ editor }) => {
      // Debounce the save operation in a real implementation
      handleSave(editor.getHTML());
    },
  });

  const handleSave = useCallback(
    async (content: string) => {
      try {
        const response = await fetch(`/api/documents/${documentId}/update`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error("Failed to save document");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save changes. Please try again.",
          variant: "destructive",
        });
      }
    },
    [documentId, toast]
  );

  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  return <EditorContent editor={editor} className="w-full" />;
}

export default TipTapEditor;
