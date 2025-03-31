import { useState, useEffect, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteEditor } from "@blocknote/core";
import { useEditorContext } from "@/components/editor/EditorProvider";
import { useAuth } from "@/lib/auth/provider";
import { useCollaborationUser } from "@/hooks/useCollaborationUser";

// Default empty block for the editor if no content is available
const DEFAULT_CONTENT = [
  { type: "paragraph", content: [{ type: "text", text: "Hello" }] },
];

export function useDocumentData(documentId: string) {
  const { doc, provider } = useEditorContext();
  const { user } = useAuth();
  const { userName, userColor } = useCollaborationUser(user);

  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [initialContent, setInitialContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Fetch initial content from API
  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`);

        if (!response.ok) {
          if (response.status === 403) {
            setAccessDenied(true);
            return;
          }
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.content) {
          try {
            const parsedContent = JSON.parse(data.content);
            // Ensure content is an array and not empty
            if (Array.isArray(parsedContent) && parsedContent.length > 0) {
              setInitialContent(parsedContent);
            } else {
              console.warn(
                "Content is empty or not an array, using default content"
              );
              setInitialContent(DEFAULT_CONTENT);
            }
          } catch (parseError) {
            console.error("Failed to parse API content:", parseError);
            setInitialContent(DEFAULT_CONTENT);
          }
        } else {
          // No content available, use default
          setInitialContent(DEFAULT_CONTENT);
        }
      } catch (error) {
        console.error("Failed to fetch API content:", error);
        setError("Failed to load document content");
        setInitialContent(DEFAULT_CONTENT);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [documentId]);

  // Create the editor only when initial content is fully loaded
  const editor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: userName,
        color: userColor,
      },
    },
    domAttributes: {
      editor: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg prose-stone dark:prose-invert focus:outline-none max-w-full",
      },
    },
  });

  // Save content to database periodically
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
      } catch (error) {
        console.error("Failed to save document:", error);
      }
    };

    // Debounced save handler
    const handleUpdate = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(saveContent, 2000);
    };

    // Subscribe to content changes
    editor.onEditorContentChange(handleUpdate);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editor, documentId]);

  return {
    isLoading,
    error,
    accessDenied,
    initialContent,
    editor,
  };
}
