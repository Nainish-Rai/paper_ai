import { useState, useEffect, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { PartialBlock } from "@blocknote/core";
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
  const [documentBlocks, setDocumentBlocks] = useState<PartialBlock[] | null>(
    null
  );
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const saveStatusTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const seededFromDatabaseRef = useRef(false);

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

        const document = await response.json();
        setDocumentBlocks(parseDocumentBlocks(document.content));
      } catch (error) {
        console.error("Failed to fetch API content:", error);
        setError("Failed to load document");
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [documentId]);

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

  useEffect(() => {
    if (
      !editor ||
      !documentBlocks ||
      documentBlocks.length === 0 ||
      seededFromDatabaseRef.current
    ) {
      return;
    }

    if (!isEmptyEditorDocument(editor.document)) {
      seededFromDatabaseRef.current = true;
      return;
    }

    editor.replaceBlocks(editor.document, documentBlocks);
    seededFromDatabaseRef.current = true;
  }, [documentBlocks, editor]);

  // Save content to database periodically
  useEffect(() => {
    if (!editor) return;

    const saveContent = async () => {
      try {
        setSaveStatus("saving");
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

        setSaveStatus("saved");
        if (saveStatusTimeoutRef.current) {
          clearTimeout(saveStatusTimeoutRef.current);
        }
        saveStatusTimeoutRef.current = setTimeout(() => {
          setSaveStatus("idle");
        }, 1600);
      } catch (error) {
        console.error("Failed to save document:", error);
        setSaveStatus("error");
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
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, [editor, documentId]);

  return {
    isLoading,
    error,
    accessDenied,
    editor,
    saveStatus,
  };
}

function parseDocumentBlocks(content: unknown): PartialBlock[] | null {
  if (typeof content !== "string" || !content.trim()) return null;

  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isEmptyEditorDocument(blocks: readonly { content?: unknown }[]) {
  if (blocks.length === 0) return true;
  if (blocks.length > 1) return false;

  const [block] = blocks;
  return !block.content || (Array.isArray(block.content) && block.content.length === 0);
}
