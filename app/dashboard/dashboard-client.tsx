"use client";

import { useRouter } from "next/navigation";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { useProfile } from "@/lib/hooks/useProfile";
import { DocumentsSection } from "@/components/dashboard/documents-section";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { UserWelcome } from "@/components/dashboard/user-welcome";
import { Skeleton } from "@/components/ui/skeleton";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { authClient } from "@/lib/auth/client";
import { AIUsageCard } from "@/components/dashboard/ai-usage-card";
import { CreateDocument } from "@/components/dashboard/create-document";
import { QuickActions } from "@/components/dashboard/quick-actions";

export function DashboardClient() {
  const router = useRouter();
  const { profile, isLoading: profileLoading } = useProfile();
  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError,
  } = useDocuments(profile?.id);
  const session = authClient.useSession();

  const handleOpenDocument = (id: string) => {
    router.push(`/dashboard/documents/${id}`);
  };

  if (profileLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[72px] w-[300px]" />
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!profile) {
    router.push("/login");
    return null;
  }

  return (
    <>
      <WelcomeCard session={session.data} />

      {/* Recent Documents Section */}
      <div className="grid gap-4 grid-cols-1">
        <RecentDocuments />
      </div>

      {/* All Documents Section */}
      <div className="grid gap-4 grid-cols-1">
        <DocumentsSection
          documents={documents}
          isLoading={documentsLoading}
          error={documentsError}
          onOpenDocument={handleOpenDocument}
        />
      </div>

      {/* AI Usage */}
      <div className="grid gap-4 grid-cols-1">
        <QuickActions
          onUploadDocument={() => {}}
          onTemplates={() => {}}
          onSettings={() => {}}
        />
        <AIUsageCard userId={session.data?.user.id || ""} />
      </div>
    </>
  );
}
