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
import { memo, useMemo } from "react";
import { Suspense } from "react";

// Improve performance with memoization
const MemoizedCollaborativeEditor = memo(CollaborativeEditor);

// Loading state with Notion-like styling
const DocumentLoading = () => (
  <div className="w-full max-w-[900px] mx-auto px-4 py-8">
    <div className="flex items-center mb-6 justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <Skeleton className="h-9 w-40" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-7 w-full max-w-md" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-7 w-full max-w-sm" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-7 w-full max-w-lg" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

// Main document page component with Notion UI styling
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

  // Calculate editor container style based on sidebar state
  const editorContainerClass = useMemo(
    () => `w-full ${!isOpen ? "transition-all duration-300" : ""}`,
    [isOpen]
  );

  // User authentication check - redirect to login
  if (!session && !sessionLoading) {
    router.push("/login");
    return null;
  }

  // Error handling
  if (error) {
    return (
      <div className="max-w-[900px] mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-red-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-medium text-red-600 mb-2">
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
        </motion.div>
      </div>
    );
  }

  // Loading state with skeleton UI
  if (sessionLoading || documentLoading) {
    return <DocumentLoading />;
  }

  // Access control check
  if (document && session?.user?.id !== document.authorId && !document.shared) {
    return <AccessDeniedDialog />;
  }

  return (
    <motion.div
      className="pb-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={editorContainerClass}>
        <Suspense fallback={<DocumentLoading />}>
          <MemoizedCollaborativeEditor documentId={documentId} />
        </Suspense>
      </div>
    </motion.div>
  );
}
