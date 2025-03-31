"use client";

import { DocumentList } from "./document-list";
import { DocumentWithAuthor } from "@/lib/hooks/useDocuments";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { CreateDocument } from "./create-document";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const [filter, setFilter] = useState<"all" | "personal" | "collaborative">(
    "all"
  );

  // Use useMemo to optimize filtering when documents or search/filter changes
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];

    let filtered = documents;

    // Apply text search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filter === "personal") {
      filtered = filtered.filter((doc) => !doc.shared);
    } else if (filter === "collaborative") {
      filtered = filtered.filter((doc) => doc.shared);
    }

    return filtered;
  }, [documents, searchQuery, filter]);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <h3 className="text-lg font-semibold">All documents</h3>

          {/* Search and filter controls in header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="w-full sm:w-[240px] pl-8 border-border border h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="h-9"
              >
                All
              </Button>
              <Button
                variant={filter === "personal" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter("personal")}
                className="h-9"
              >
                <Badge
                  variant="outline"
                  className="mr-1 bg-green-100 text-green-800 border-green-200"
                >
                  Personal
                </Badge>
              </Button>
              <Button
                variant={filter === "collaborative" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter("collaborative")}
                className="h-9"
              >
                <Badge
                  variant="outline"
                  className="mr-1 bg-blue-100 text-blue-800 border-blue-200"
                >
                  Collaborative
                </Badge>
              </Button>
            </div>
          </div>
        </div>

        <DocumentList
          documents={filteredDocuments}
          isLoading={isLoading}
          error={error}
          onOpenDocument={onOpenDocument}
          filter={filter}
        />
      </div>
    </div>
  );
}

export function DocumentsSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Skeleton className="h-9 w-full sm:w-[240px]" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
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
