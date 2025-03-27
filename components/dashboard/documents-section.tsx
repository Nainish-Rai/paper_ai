"use client";

import { DocumentList } from "./document-list";
import { DocumentWithAuthor } from "@/lib/hooks/useDocuments";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CreateDocument } from "./create-document";

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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = documents?.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rounded-lg border bg-card text-card-foreground">
      <div className="p-6">
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            All documents
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="w-[240px] pl-8 border-border border h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* <div className="w-[120px]">
              <CreateDocument isHorizontal />
            </div> */}
          </div>
        </div>
        <DocumentList
          documents={filteredDocuments || documents}
          isLoading={isLoading}
          error={error}
          onOpenDocument={onOpenDocument}
        />
      </div>
    </div>
  );
}
