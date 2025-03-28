"use client";

import { useState } from "react";
import { AccessDeniedDialog } from "@/components/ui/access-denied-dialog";
import { EditorProvider } from "./editor/EditorProvider";
import { EditorContent } from "./editor/EditorContent";
import { EditorHeader } from "./editor/EditorHeader";
import { useDocumentData } from "@/hooks/useDocumentData";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { ErrorDisplay } from "./ui/ErrorDisplay";
import { useAuth } from "../lib/auth/provider";

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
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="flex flex-col h-full">
      <EditorHeader userId={userId} documentId={documentId} editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
