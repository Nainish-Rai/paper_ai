"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentList } from "./document-list";
import { DocumentWithAuthor } from "@/lib/hooks/useDocuments";

interface DocumentsSectionProps {
  documents: DocumentWithAuthor[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onOpenDocument: (id: string) => void;
}

export function DocumentsSection({
  documents,
  isLoading,
  error,
  onOpenDocument,
}: DocumentsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>All Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <DocumentList
          documents={documents}
          isLoading={isLoading}
          error={error}
          onOpenDocument={onOpenDocument}
        />
      </CardContent>
    </Card>
  );
}
