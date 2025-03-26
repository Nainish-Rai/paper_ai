"use client";
import { BlockNoteEditor } from "@blocknote/core";
import { useTheme } from "next-themes";
import React, { useRef, useState, useCallback, useEffect } from "react";

interface User {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

interface CommentThread {
  id: string;
  resolved: boolean;
  referencedText: string;
  comments: Comment[];
  from?: number;
  to?: number;
}

interface ThreadListProps {
  editor: BlockNoteEditor;
  filter?: "open" | "resolved" | "all";
  sort?: "position" | "recent-activity" | "oldest";
  maxCommentsBeforeCollapse?: number;
}

export function ThreadsSidebar({
  editor,
  filter = "all",
  sort = "position",
  maxCommentsBeforeCollapse = 5,
}: ThreadListProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<CommentThread[]>([]);

  // Update threads state
  const updateThreads = useCallback(() => {
    if (!editor.comments) {
      setThreads([]);
      return;
    }

    try {
      const commentData = (editor.comments as any).getState?.() || {};
      const currentThreads: CommentThread[] = Object.values(
        commentData.threads || {}
      )
        .filter(Boolean)
        .map((thread: any) => ({
          id: thread.id,
          resolved: Boolean(thread.resolved),
          referencedText: String(thread.referencedText || ""),
          from: thread.from,
          to: thread.to,
          comments: (thread.comments || []).map((comment: any) => ({
            id: String(comment.id),
            content: String(comment.content || ""),
            createdAt: String(comment.createdAt || new Date()),
            user: {
              id: String(comment.user?.id || "anonymous"),
              name: String(comment.user?.name || "Anonymous"),
            },
          })),
        }));

      setThreads(currentThreads);
    } catch (error) {
      console.error("Error updating threads:", error);
      setThreads([]);
    }
  }, [editor]);

  // Subscribe to editor changes
  useEffect(() => {
    updateThreads();

    const interval = setInterval(updateThreads, 1000);
    return () => clearInterval(interval);
  }, [updateThreads]);

  const handleThreadSelect = useCallback(
    (threadId: string) => {
      setSelectedThreadId(threadId);

      const selectedThread = threads.find((t) => t.id === threadId);
      if (
        !selectedThread ||
        selectedThread.from === undefined ||
        selectedThread.to === undefined
      ) {
        return;
      }

      try {
        // Scroll to position
        const block = editor.getTextCursorPosition().block;
        if (block) {
          const element = document.getElementById(block.id);
          element?.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // Try to highlight the thread's text
        if (editor.comments) {
          editor.comments.selectThread?.(threadId);
        }
      } catch (error) {
        console.error("Error selecting thread:", error);
      }
    },
    [editor, threads]
  );

  const filteredThreads = threads.filter((thread) => {
    if (filter === "all") return true;
    if (filter === "open") return !thread.resolved;
    if (filter === "resolved") return thread.resolved;
    return true;
  });

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (sort === "recent-activity" && a.comments.length && b.comments.length) {
      const aLastComment = a.comments[a.comments.length - 1];
      const bLastComment = b.comments[b.comments.length - 1];
      return (
        new Date(bLastComment.createdAt).getTime() -
        new Date(aLastComment.createdAt).getTime()
      );
    }
    if (sort === "position" && a.from !== undefined && b.from !== undefined) {
      return a.from - b.from;
    }
    return 0;
  });

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-y-auto p-4 ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
    >
      <div className="space-y-4">
        {sortedThreads.map((thread) => (
          <div
            key={thread.id}
            className={`relative rounded-lg p-4 cursor-pointer transition-colors ${
              selectedThreadId === thread.id
                ? theme === "dark"
                  ? "bg-gray-800"
                  : "bg-gray-100"
                : theme === "dark"
                ? "hover:bg-gray-800"
                : "hover:bg-gray-50"
            }`}
            onClick={() => handleThreadSelect(thread.id)}
          >
            {/* Thread Status Indicator */}
            <div className="absolute top-4 right-4">
              {thread.resolved ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-yellow-500">⋯</span>
              )}
            </div>

            {/* Referenced Text Preview */}
            <div
              className={`text-sm mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              &quot;{thread.referencedText}&quot;
            </div>

            {/* Comments */}
            <div className="space-y-2">
              {thread.comments
                .slice(
                  0,
                  thread.comments.length > maxCommentsBeforeCollapse
                    ? 1
                    : undefined
                )
                .map((comment) => (
                  <div
                    key={comment.id}
                    className={`${
                      theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-50 text-gray-900"
                    } p-2 rounded`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-xs">
                        {comment.user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}

              {/* Show collapsed indicator if needed */}
              {thread.comments.length > maxCommentsBeforeCollapse && (
                <div
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  +{thread.comments.length - 1} more replies
                </div>
              )}
            </div>
          </div>
        ))}

        {sortedThreads.length === 0 && (
          <div
            className={`text-center py-8 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No comments yet
          </div>
        )}
      </div>
    </div>
  );
}
