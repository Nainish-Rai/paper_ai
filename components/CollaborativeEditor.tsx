"use client";

import { useState } from "react";
import { AccessDeniedDialog } from "@/components/ui/access-denied-dialog";
import { EditorProvider } from "./editor/EditorProvider";
import { EditorContent } from "./editor/EditorContent";
import { EditorHeader } from "./editor/EditorHeader";
import { useDocumentData } from "@/hooks/useDocumentData";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { ErrorDisplay } from "./ui/ErrorDisplay";

export function CollaborativeEditor({ documentId }: { documentId: string }) {
  return (
    <EditorProvider documentId={documentId}>
      <EditorWrapper documentId={documentId} />
    </EditorProvider>
  );
}

function EditorWrapper({ documentId }: { documentId: string }) {
  const { isLoading, error, accessDenied, initialContent, editor } =
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
      <EditorHeader documentId={documentId} editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
