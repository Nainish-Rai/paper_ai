"use client";

import {
  DefaultThreadStoreAuth,
  YjsThreadStore,
} from "@blocknote/core/comments";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  BlockNoteViewEditor,
  FloatingComposerController,
  ThreadsSidebar,
  useCreateBlockNote,
} from "@blocknote/react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";
import { useAuth } from "@/lib/auth/provider";
import { useTheme } from "next-themes";
import styles from "./CollaborativeEditor.module.css";
import { ExportButton } from "@/components/ui/export-button";
import { AccessDeniedDialog } from "@/components/ui/access-denied-dialog";

// Define props for filter and sort selects
type FilterType = "open" | "resolved" | "all";
type SortType = "position" | "recent-activity" | "oldest";

interface SelectProps {
  label: string;
  value: string;
  options: { text: string; value: string }[];
  onChange: (value: string) => void;
}

// Simple select component for filter and sort options
function SettingsSelect({ label, value, options, onChange }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-600 dark:text-gray-400">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CollaborativeEditor({ documentId }: { documentId: string }) {
  // Initialize Yjs document
  const doc = useMemo(() => new Y.Doc(), []);
  const provider = useMemo(
    () =>
      new YPartyKitProvider(
        "blocknote-dev.yousefed.partykit.dev",
        `paper-ai-${documentId}`,
        doc
      ),
    [doc, documentId]
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
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialContent, setInitialContent] = useState<any>(null);

  // Comment filtering and sorting state
  const [commentFilter, setCommentFilter] = useState<FilterType>("open");
  const [commentSort, setCommentSort] = useState<SortType>("position");

  // Random color for anonymous users
  const getRandomColor = () => {
    const colors = [
      "#FF9FB6",
      "#FFCC80",
      "#AED581",
      "#80DEEA",
      "#B39DDB",
      "#F48FB1",
      "#81C784",
      "#FFD54F",
      "#9FA8DA",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Create thread store for comments
  const threadStore = useMemo(() => {
    return new YjsThreadStore(
      user?.id || "anonymous",
      doc.getMap("threads"),
      new DefaultThreadStoreAuth(user?.id || "anonymous", "editor")
    );
  }, [doc, user]);

  // Function to resolve user information for comments
  const resolveUsers = async (userIds: string[]) => {
    const validUserIds = userIds.filter((id) => id !== "anonymous");

    if (validUserIds.length === 0) {
      return userIds.map((id) => ({
        id,
        username: "Anonymous",
        name: "Anonymous User",
        avatarUrl: undefined,
      }));
    }

    try {
      const response = await fetch("/api/users/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds: validUserIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user information");
      }

      const users = await response.json();
      return userIds.map((id) => {
        const userInfo = users.find((u: any) => u.id === id);
        return {
          id,
          username: userInfo?.name || "Anonymous",
          name: userInfo?.name || "Anonymous User",
          avatarUrl: userInfo?.image,
        };
      });
    } catch (error) {
      console.error("Error resolving users:", error);
      return userIds.map((id) => ({
        id,
        username: "Anonymous",
        name: "Anonymous User",
        avatarUrl: undefined,
      }));
    }
  };

  // Fetch initial content
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

        try {
          if (data.content) {
            const parsedContent = JSON.parse(data.content);
            setInitialContent(parsedContent);
          }
        } catch (error) {
          console.error("Error parsing content:", error);
        }
      } catch (error) {
        console.error("Error loading content:", error);
        setError("Failed to load document");
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [documentId]);

  // Create editor with comments support
  const editor = useCreateBlockNote(
    {
      initialContent,
      collaboration: {
        provider,
        fragment: doc.getXmlFragment("document-store"),
        user: {
          name: user?.name || "Anonymous",
          color: getRandomColor(),
        },
      },
      comments: {
        threadStore,
      },
      resolveUsers,
      domAttributes: {
        editor: {
          class:
            "prose prose-sm sm:prose-base lg:prose-lg prose-stone dark:prose-invert focus:outline-none max-w-full",
        },
      },
    },
    [user, threadStore, initialContent]
  );

  if (accessDenied) return <AccessDeniedDialog />;
  if (isLoading || !editor) {
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
    <BlockNoteView
      editor={editor}
      theme={theme as "light" | "dark"}
      editable={true}
      renderEditor={false}
      comments={false}
    >
      <div className="flex h-full">
        <div className="flex-grow flex flex-col">
          <div className={styles.editorHeader}>
            <div className="flex items-center justify-end p-2">
              <ExportButton editor={editor} documentId={documentId} />
            </div>
          </div>
          <div className={styles.editorPanel}>
            <BlockNoteViewEditor />
            <FloatingComposerController />
          </div>
        </div>
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Comments</h2>
            <div className="space-y-4">
              <SettingsSelect
                label="Filter"
                value={commentFilter}
                options={[
                  { text: "All", value: "all" },
                  { text: "Open", value: "open" },
                  { text: "Resolved", value: "resolved" },
                ]}
                onChange={(value) => setCommentFilter(value as FilterType)}
              />
              <SettingsSelect
                label="Sort"
                value={commentSort}
                options={[
                  { text: "Position", value: "position" },
                  { text: "Recent activity", value: "recent-activity" },
                  { text: "Oldest", value: "oldest" },
                ]}
                onChange={(value) => setCommentSort(value as SortType)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ThreadsSidebar filter={commentFilter} sort={commentSort} />
          </div>
        </div>
      </div>
    </BlockNoteView>
  );
}
