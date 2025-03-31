"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import DocumentCard from "./document-card";
import { DocumentWithAuthor } from "@/lib/hooks/useDocuments";

interface DocumentListProps {
  documents: DocumentWithAuthor[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onOpenDocument: (id: string) => void;
  filter?: "all" | "personal" | "collaborative";
}

export function DocumentList({
  documents,
  isLoading,
  error,
  onOpenDocument,
  filter = "all",
}: DocumentListProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading documents: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!isLoading && (!documents || documents.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground mb-2">
          {filter === "all"
            ? "No documents found"
            : filter === "personal"
            ? "No personal documents found"
            : "No collaborative documents found"}
        </p>
        <p className="text-sm text-muted-foreground">
          {filter === "all"
            ? "Create your first document!"
            : `Try switching to a different filter or create a new ${filter} document.`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {documents?.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onOpen={onOpenDocument}
          filter={filter}
        />
      ))}
    </div>
  );
}
