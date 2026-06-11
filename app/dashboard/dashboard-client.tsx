"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Clock, FileText, Search, Star } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { CreateDocument } from "@/components/dashboard/create-document";
import { FavoriteButton } from "@/components/dashboard/favorite-button";
import { ImportChatGPTDialog } from "@/components/dashboard/import-chatgpt-dialog";
import { WelcomeCardSkeleton } from "@/components/dashboard/welcome-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { useProfile } from "@/lib/hooks/useProfile";
import { cn } from "@/lib/utils";

type DashboardDocument = {
  id: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  favorite?: boolean;
};

export function DashboardClient() {
  const router = useRouter();
  const session = authClient.useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false);

  const { profile, isLoading: profileLoading } = useProfile();
  const activeProfile = profile ?? session.data?.user;
  const { data: documents, isLoading: documentsLoading } = useDocuments(
    activeProfile?.id
  );

  const sortedDocuments = useMemo(() => {
    return [...((documents as DashboardDocument[] | undefined) ?? [])].sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sortedDocuments;

    return sortedDocuments.filter((document) =>
      document.title.toLowerCase().includes(query)
    );
  }, [searchQuery, sortedDocuments]);

  const recentDocuments = sortedDocuments.slice(0, 5);
  const favoriteDocuments = sortedDocuments
    .filter((document) => document.favorite)
    .slice(0, 4);

  useEffect(() => {
    if (!session.isPending && !profileLoading && !activeProfile) {
      router.push("/login");
    }
  }, [activeProfile, profileLoading, router, session.isPending]);

  if (!session.isPending && !profileLoading && !activeProfile) {
    return null;
  }

  if (session.isPending || (profileLoading && !activeProfile)) {
    return (
      <div className="space-y-8">
        <WelcomeCardSkeleton />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-4 md:px-6">
        <section className="flex flex-col gap-6 border-b pb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Paper AI
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Save AI conversations as notes you can edit, search, and reuse.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Import a public ChatGPT share, keep the snapshot in MongoDB, then
              work with it in a collaborative editor and grounded note agent.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 md:w-[420px]">
            <ImportChatGPTDialog />
            <CreateDocument />
          </div>
        </section>

        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search notes"
              className="h-10 pl-9"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">
              {sortedDocuments.length} {sortedDocuments.length === 1 ? "note" : "notes"}
            </Badge>
            <Badge variant="outline">
              {favoriteDocuments.length} pinned
            </Badge>
          </div>
        </section>

        {favoriteDocuments.length > 0 && (
          <DocumentSection
            title="Pinned"
            icon={<Star className="h-4 w-4 text-amber-500" />}
            documents={favoriteDocuments}
            onOpenDocument={(id) => router.push(`/dashboard/documents/${id}`)}
          />
        )}

        <DocumentSection
          title="Recent"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          documents={recentDocuments}
          isLoading={documentsLoading}
          emptyLabel="Import a ChatGPT share or create a new note to get started."
          onOpenDocument={(id) => router.push(`/dashboard/documents/${id}`)}
          onCreateDocument={() => setIsCreateDocumentOpen(true)}
        />

        <DocumentSection
          title={searchQuery.trim() ? "Search results" : "All notes"}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          documents={filteredDocuments}
          isLoading={documentsLoading}
          emptyLabel={
            searchQuery.trim()
              ? "No notes match your search."
              : "No notes yet."
          }
          onOpenDocument={(id) => router.push(`/dashboard/documents/${id}`)}
          onCreateDocument={() => setIsCreateDocumentOpen(true)}
        />
      </main>

      <CreateDocument
        isHidden
        isOpen={isCreateDocumentOpen}
        onClose={() => setIsCreateDocumentOpen(false)}
      />
    </>
  );
}

type DocumentSectionProps = {
  title: string;
  icon: ReactNode;
  documents: DashboardDocument[];
  isLoading?: boolean;
  emptyLabel?: string;
  onOpenDocument: (id: string) => void;
  onCreateDocument?: () => void;
};

function DocumentSection({
  title,
  icon,
  documents,
  isLoading = false,
  emptyLabel = "No notes found.",
  onOpenDocument,
  onCreateDocument,
}: DocumentSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-medium">{title}</h2>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-md" />
          ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="divide-y rounded-md border">
          {documents.map((document) => (
            <DocumentRow
              key={document.id}
              document={document}
              onOpen={() => onOpenDocument(document.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-md border border-dashed p-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{emptyLabel}</p>
          {onCreateDocument && (
            <Button size="sm" variant="outline" onClick={onCreateDocument}>
              New note
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

function DocumentRow({
  document,
  onOpen,
}: {
  document: DashboardDocument;
  onOpen: () => void;
}) {
  return (
    <div
      className="group flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50"
      onClick={onOpen}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <FileText className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {document.title || "Untitled"}
        </p>
        <p className="text-xs text-muted-foreground">
          Edited {formatDate(document.updatedAt)}
        </p>
      </div>
      <div
        className={cn(
          "opacity-0 transition-opacity group-hover:opacity-100",
          document.favorite && "opacity-100"
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <FavoriteButton
          documentId={document.id}
          isFavorite={document.favorite || false}
          size="sm"
        />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-36 w-full rounded-md" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
