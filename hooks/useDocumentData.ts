import { useState, useEffect, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteEditor } from "@blocknote/core";
import { useEditorContext } from "@/components/editor/EditorProvider";
import { useAuth } from "@/lib/auth/provider";
import { useCollaborationUser } from "@/hooks/useCollaborationUser";

export function useDocumentData(documentId: string) {
  const { doc, provider } = useEditorContext();
  const { user } = useAuth();
  const { userName, userColor } = useCollaborationUser(user);

  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Verify document access
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`);
        if (!response.ok) {
          if (response.status === 403) {
            setAccessDenied(true);
            return;
          }
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Failed to fetch API content:", error);
        setError("Failed to load document");
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [documentId]);

  // Listen for document initialization
  useEffect(() => {
    if (!isLoading && !error && !accessDenied) {
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "init_content") {
            // Initialize the Yjs document fragment directly
            const fragment = doc.getXmlFragment("document-store");
            doc.transact(() => {
              fragment.delete(0, fragment.length);
              fragment.push([data.content]);
            });
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      provider.on("message", handleMessage);
      return () => provider.off("message", handleMessage);
    }
  }, [isLoading, error, accessDenied, doc, provider]);

  // Create the editor with collaboration enabled
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
    editor,
  };
}
