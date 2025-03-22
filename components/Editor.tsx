"use client";

// import { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";

type EditorProps = {
  documentId: string;
};

export function Editor({ documentId }: EditorProps) {
  const { theme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialContent, setInitialContent] = useState<any>(null);
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

  // Fetch initial content from API
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/documents/${documentId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = await response.json();

        if (data.content) {
          try {
            const parsedContent = JSON.parse(data.content);
            if (Array.isArray(parsedContent) && parsedContent.length > 0) {
              const firstBlock = parsedContent[0];
              if (firstBlock.type && firstBlock.content) {
                setInitialContent(parsedContent);
              } else {
                setInitialContent(defaultContent);
              }
            } else {
              setInitialContent(defaultContent);
            }
          } catch (parseError) {
            console.error("Failed to parse API content:", parseError);
            setInitialContent(defaultContent);
          }
        } else {
          setInitialContent(defaultContent);
        }
      } catch (error) {
        console.error("Failed to fetch API content:", error);
        setError("Failed to load document content");
        setInitialContent(defaultContent);
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, [documentId]);

  const editor = useCreateBlockNote(
    !isLoading
      ? {
          initialContent: initialContent || defaultContent,
          domAttributes: {
            editor: {
              class:
                "prose prose-sm sm:prose-base lg:prose-lg prose-stone dark:prose-invert focus:outline-none max-w-full",
            },
          },
        }
      : undefined
  );

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
  }, [editor, documentId, isSaving, error]); // Added error as dependency since we use it in saveContent

  // Show loading state while fetching initial content
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // Show editor once everything is ready
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
