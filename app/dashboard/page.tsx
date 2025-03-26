"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useEffect } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DocumentsSection } from "@/components/dashboard/documents-section";
import { useDocuments } from "@/lib/hooks/useDocuments";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const userId = session?.user?.id;

  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError,
  } = useDocuments(userId);

  // Handle redirection for unauthenticated users
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/login");
    }
  }, [session, sessionLoading, router]);

  // Handle document opening
  const handleOpenDocument = (id: string) => {
    router.push(`/dashboard/documents/${id}`);
  };

  // Early return for unauthenticated users or during loading
  if (!session && !sessionLoading) return null;
  if (sessionLoading || documentsLoading) return <DashboardSkeleton />;
  if (!session?.user) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
      <DashboardSidebar user={session.user} />
      <DocumentsSection
        documents={documents}
        isLoading={documentsLoading}
        error={documentsError as Error | null}
        onOpenDocument={handleOpenDocument}
      />
    </div>
  );
}
