"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CollaborativeEditor } from "@/components/CollaborativeEditor";
import { motion } from "framer-motion";
import { useDocument } from "@/lib/hooks/useDocument";
import { useSidebarStore } from "@/lib/stores/sidebarStore";
import { AccessDeniedDialog } from "@/components/ui/access-denied-dialog";
import { CollaboratorAvatars } from "@/components/dashboard/collaborator-avatars";
import { EditableTitle } from "@/components/dashboard/editable-title";
import { memo, useMemo } from "react";
import { Suspense } from "react";

// Improve performance with memoization
const MemoizedCollaborativeEditor = memo(CollaborativeEditor);

// Loading state component
const DocumentLoading = () => (
  <div className="mx-auto p-4 max-w-4xl">
    <div className="flex items-center mb-4 justify-between">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-8 w-24" />
    </div>
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-[600px] w-full" />
      </CardContent>
    </Card>
  </div>
);

// Main document page component
export default function DocumentPageClient({
  documentId,
}: {
  documentId: string;
}) {
  const router = useRouter();
  const { isOpen } = useSidebarStore();

  // Optimize React Query usage with staleTime and proper caching strategy
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const {
    data: document,
    isLoading: documentLoading,
    error,
  } = useDocument(documentId, {
    staleTime: 1000 * 60 * 5, // 5 minutes cache to reduce API calls
  });

  // Calculate responsive width based on sidebar state - moved up before conditional returns
  const editorContainerClass = useMemo(
    () => `px-4 ${!isOpen ? "mx-auto max-w-4xl" : "max-w-5xl"}`,
    [isOpen]
  );

  // User authentication check
  if (!session && !sessionLoading) {
    router.push("/login");
    return null;
  }

  // Error handling
  if (error) {
    return (
      <div className="mx-auto p-6 max-w-md">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Document
            </h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : "Failed to load document"}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Return to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Optimize loading state for better user experience
  if (sessionLoading || documentLoading) {
    return <DocumentLoading />;
  }

  // Access control check
  if (document && session?.user?.id !== document.authorId && !document.shared) {
    return <AccessDeniedDialog />;
  }

  return (
    <div className="pb-6">
      <div className="mb-4 flex items-center sticky w-full top-0 py-2 z-50 bg-white dark:bg-background shadow-sm justify-between px-4">
        <div className="flex items-center w-full justify-between gap-4">
          <EditableTitle
            documentId={documentId}
            initialTitle={document?.title || "Untitled"}
          />
          <CollaboratorAvatars documentId={documentId} />
        </div>
      </div>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          layout: {
            type: "spring",
            stiffness: 300,
            damping: 30,
          },
          opacity: { duration: 0.2 },
        }}
        className={editorContainerClass}
      >
        <Suspense fallback={<DocumentLoading />}>
          <MemoizedCollaborativeEditor documentId={documentId} />
        </Suspense>
      </motion.div>
    </div>
  );
}
