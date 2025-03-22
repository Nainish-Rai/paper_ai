"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import * as Y from "yjs";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Avatars } from "@/components/Avatars";
import styles from "./CollaborativeEditor.module.css";
import { ReactNode } from "react";
import YPartyKitProvider from "y-partykit/provider";
import { useAuth } from "@/lib/auth/provider";
import { ExportButton } from "@/components/ui/export-button";

export function CollaborativeEditor({ documentId }: { documentId: string }) {
  // Create a new Yjs document
  const doc = new Y.Doc();

  // Set up PartyKit provider
  const provider = new YPartyKitProvider(
    "blocknote-dev.yousefed.partykit.dev",
    // Use document ID as the room name for collaboration
    `paper-ai-${documentId}`,
    doc
  );

  return <BlockNote doc={doc} provider={provider} documentId={documentId} />;
}

type EditorProps = {
  doc: Y.Doc;
  provider: any;
  documentId: string;
};

function BlockNote({ doc, provider, documentId }: EditorProps): ReactNode {
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [initialContent, setInitialContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Default empty block for the editor if no content is available
  const defaultContent = [
    { type: "paragraph", content: [{ type: "text", text: "Hello" }] },
  ];

  // Fetch initial content from API
  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`);
        if (!response.ok) {
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
              setInitialContent(defaultContent);
            }
          } catch (parseError) {
            console.error("Failed to parse API content:", parseError);
            setInitialContent(defaultContent);
          }
        } else {
          // No content available, use default
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

  const { user } = useAuth();

  // Dummy names for when user is not logged in
  const dummyNames = [
    "Curious Panda",
    "Happy Dolphin",
    "Clever Fox",
    "Wise Owl",
    "Friendly Giraffe",
    "Brave Lion",
    "Creative Koala",
    "Calm Turtle",
    "Swift Eagle",
  ];

  // Pastel color palette for when user is not logged in
  const pastelColors = [
    "#FFD6E0",
    "#FFEFDA",
    "#D1F0C1",
    "#C1E9F0",
    "#D5C1F0",
    "#F0C1DD",
    "#C1F0CE",
    "#F0DFC1",
    "#C1C7F0",
  ];

  // Get random name and color from arrays
  const randomName = dummyNames[Math.floor(Math.random() * dummyNames.length)];
  const randomColor =
    pastelColors[Math.floor(Math.random() * pastelColors.length)];

  // Only create the editor once initial content is loaded
  const editor = useCreateBlockNote({
    // initialContent: initialContent || defaultContent,
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: user?.name || randomName, // Use user name if logged in, else use dummy name
        color: user
          ? "#" + Math.floor(Math.random() * 16777215).toString(16)
          : randomColor, // Use pastel color if not logged in
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

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className=" ">
      <div className={styles.editorHeader}>
        <div className="flex items-center justify-end p-2">
          <ExportButton editor={editor} documentId={documentId} />
        </div>
      </div>
      <div className={styles.editorPanel}>
        <BlockNoteView
          editor={editor}
          className={styles.editorContainer}
          theme={theme as "light" | "dark"}
        />
      </div>
    </div>
  );
}
