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
}

export function DocumentList({
  documents,
  isLoading,
  error,
  onOpenDocument,
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
      <p className="text-center text-muted-foreground py-8">
        No documents yet. Create your first document!
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {documents?.map((doc) => (
        <DocumentCard key={doc.id} document={doc} onOpen={onOpenDocument} />
      ))}
    </div>
  );
}
