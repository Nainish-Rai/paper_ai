"use client";

import { useState } from "react";
import { AccessDeniedDialog } from "@/components/ui/access-denied-dialog";
import { EditorProvider } from "./editor/EditorProvider";
import { EditorContent } from "./editor/EditorContent";
import { useDocumentData } from "@/hooks/useDocumentData";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { ErrorDisplay } from "./ui/ErrorDisplay";
import { useAuth } from "../lib/auth/provider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function CollaborativeEditor({ documentId }: { documentId: string }) {
  const userId = useAuth().user?.id;
  return (
    <EditorProvider userId={userId || ""} documentId={documentId}>
      <EditorWrapper userId={userId || ""} documentId={documentId} />
    </EditorProvider>
  );
}

function EditorWrapper({
  userId,
  documentId,
}: {
  userId: string;
  documentId: string;
}) {
  const { isLoading, error, accessDenied, editor } =
    useDocumentData(documentId);

  if (accessDenied) {
    return <AccessDeniedDialog />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-1 overflow-auto bg-background">
        <div className="max-w-[900px] mx-auto px-4 py-8 h-full">
          <EditorContent editor={editor} />
        </div>
      </div>
    </motion.div>
  );
}
