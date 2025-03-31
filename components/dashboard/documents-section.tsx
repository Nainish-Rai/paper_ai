"use client";

import { DocumentList } from "./document-list";
import { DocumentWithAuthor } from "@/lib/hooks/useDocuments";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { CreateDocument } from "./create-document";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Use useMemo to optimize filtering when documents or search query changes
  const filteredDocuments = useMemo(() => {
    return documents?.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

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

export function DocumentsSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground">
      <div className="p-6">
        <div className="flex items-center justify-between pb-4">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-[240px]" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3 border border-border rounded-md">
              <div className="flex items-center">
                <Skeleton className="h-5 w-5 mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
