"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";

type EditorProps = {
  documentId: string;
  initialContent?: string;
};

export function Editor({
  documentId,
  initialContent: propInitialContent,
}: EditorProps) {
  const { theme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Default content structure for new documents
  const defaultContent = [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "",
        },
      ],
    },
  ];

  // Parse and validate initial content from props
  const [editorContent] = useState(() => {
    if (propInitialContent) {
      try {
        const parsedContent = JSON.parse(propInitialContent);
        if (Array.isArray(parsedContent) && parsedContent.length > 0) {
          const firstBlock = parsedContent[0];
          if (firstBlock.type && firstBlock.content) {
            return parsedContent;
          }
        }
      } catch (parseError) {
        console.error("Failed to parse initial content:", parseError);
      }
    }
    return defaultContent;
  });

  const editor = useCreateBlockNote({
    initialContent: editorContent,
    domAttributes: {
      editor: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg prose-stone dark:prose-invert focus:outline-none max-w-full",
      },
    },
  });

  const saveIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Save content to database
  useEffect(() => {
    if (!editor) return;

    const saveContent = async () => {
      try {
        const content = JSON.stringify(editor.document);
        const response = await fetch(`/api/documents/${documentId}/update`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save: ${response.statusText}`);
        }

        // Clear any previous errors on successful save
        if (error) setError(null);
      } catch (error) {
        console.error("Failed to save document:", error);
        setError("Failed to save changes");
      } finally {
        // Ensure saving state is cleared
        setIsSaving(false);
      }
    };

    // Debounced save handler
    const handleUpdate = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set saving state
      setIsSaving(true);

      // Use a longer debounce time for stability
      saveTimeoutRef.current = setTimeout(saveContent, 2000);
    };

    // Subscribe to content changes
    editor.onEditorContentChange(() => {
      handleUpdate();
    });

    // Start periodic saves
    saveIntervalRef.current = setInterval(saveContent, 10000);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [editor, documentId, error]);

  // Show error state
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // Show editor
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="w-full bg-white dark:bg-gray-800 mx-auto mt-4 relative">
        {isSaving && (
          <div className="absolute z-50 top-2 right-2 px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            Saving...
          </div>
        )}
        <BlockNoteView
          editor={editor}
          theme={theme as "light" | "dark"}
          className="w-full min-h-screen scrollbar-hide overflow-scroll md:p-6 pt-4 rounded-3xl"
        />
      </div>
    </div>
  );
}
