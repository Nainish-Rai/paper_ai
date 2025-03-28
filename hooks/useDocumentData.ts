import { useState, useEffect, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import {
  BlockNoteEditor,
  DefaultBlockSchema,
  PartialBlock,
} from "@blocknote/core";
import { useEditorContext } from "@/components/editor/EditorProvider";
import { useAuth } from "@/lib/auth/provider";
import { useCollaborationUser } from "@/hooks/useCollaborationUser";

// Default empty block for the editor if no content is available
const DEFAULT_CONTENT: PartialBlock<DefaultBlockSchema>[] = [
  {
    type: "paragraph",
    content: [{ type: "text", text: "Hello", styles: {} }],
    props: {
      textAlignment: "left",
      backgroundColor: "default",
      textColor: "default",
    },
  },
];

export function useDocumentData(documentId: string) {
  const { doc, provider } = useEditorContext();
  const { user } = useAuth();
  const { userName, userColor } = useCollaborationUser(user);

  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [initialContent, setInitialContent] = useState<
    PartialBlock<DefaultBlockSchema>[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Convert content to proper BlockNote format
  const convertToBlockNoteContent = (
    content: any
  ): PartialBlock<DefaultBlockSchema>[] => {
    if (!content) return DEFAULT_CONTENT;

    try {
      if (Array.isArray(content)) {
        return content.map(
          (block) =>
            ({
              type: "paragraph",
              content: Array.isArray(block.content)
                ? block.content.map(
                    (c: {
                      type: string;
                      text: string;
                      styles?: Record<string, unknown>;
                    }) => ({
                      type: c.type,
                      text: c.text,
                      styles: c.styles || {},
                    })
                  )
                : [{ type: "text", text: "", styles: {} }],
              props: {
                textAlignment: "left",
                backgroundColor: "default",
                textColor: "default",
              },
            } as PartialBlock<DefaultBlockSchema>)
        );
      }
      return [
        {
          type: "paragraph",
          content: [{ type: "text", text: String(content), styles: {} }],
          props: {
            textAlignment: "left",
            backgroundColor: "default",
            textColor: "default",
          },
        },
      ];
    } catch {
      return DEFAULT_CONTENT;
    }
  };

  // Create the editor once initial content is loaded
  const editor = useCreateBlockNote({
    initialContent: convertToBlockNoteContent(initialContent),
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

  // Handle initial content synchronization
  useEffect(() => {
    if (!editor || !provider || !initialContent) return;

    const handleSync = () => {
      const fragment = doc.getXmlFragment("document-store");
      if (fragment.length === 0) {
        try {
          // Use the converter function to ensure valid content
          const content = convertToBlockNoteContent(initialContent);
          editor.replaceBlocks(editor.topLevelBlocks, content);
        } catch (error) {
          console.error("Failed to initialize editor content:", error);
          // Fallback to default content if initialization fails
          editor.replaceBlocks(editor.topLevelBlocks, DEFAULT_CONTENT);
        }
      }
    };

    provider.on("sync", handleSync);
    return () => {
      provider.off("sync", handleSync);
    };
  }, [editor, provider, initialContent, doc]);

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
