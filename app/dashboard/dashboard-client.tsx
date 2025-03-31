"use client";

import { useRouter } from "next/navigation";
import { memo } from "react";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { useProfile } from "@/lib/hooks/useProfile";
import { DocumentsSection } from "@/components/dashboard/documents-section";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { WelcomeCardSkeleton } from "@/components/dashboard/welcome-card";
import { authClient } from "@/lib/auth/client";
import { AIUsageCard } from "@/components/dashboard/ai-usage-card";
import { QuickActions } from "@/components/dashboard/quick-actions";

// Memoize components to prevent unnecessary re-renders
const MemoizedDocumentsSection = memo(DocumentsSection);
const MemoizedRecentDocuments = memo(RecentDocuments);
const MemoizedQuickActions = memo(QuickActions);
const MemoizedAIUsageCard = memo(AIUsageCard);

export function DashboardClient() {
  const router = useRouter();
  const session = authClient.useSession();
  const userId = session.data?.user.id;

  // Use dependent queries to improve loading efficiency
  const { profile, isLoading: profileLoading } = useProfile();

  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError,
  } = useDocuments(profile?.id);

  const handleOpenDocument = (id: string) => {
    router.push(`/dashboard/documents/${id}`);
  };

  // Redirect if no profile after load attempt
  if (!profileLoading && !profile) {
    router.push("/login");
    return null;
  }

  // Render appropriate skeletons while loading
  if (profileLoading) {
    return (
      <div className="flex flex-col gap-6">
        <WelcomeCardSkeleton />
        <div className="grid gap-4 grid-cols-1">
          <DocumentsSkeletonSection />
        </div>
        <div className="grid gap-4 grid-cols-1">
          <QuickActionsSkeletonSection />
        </div>
      </div>
    );
  }

  return (
    <>
      <WelcomeCard session={session.data} />

      {/* Recent Documents Section */}
      <div className="grid gap-4 grid-cols-1">
        <MemoizedRecentDocuments />
      </div>

      {/* All Documents Section */}
      <div className="grid gap-4 grid-cols-1">
        <MemoizedDocumentsSection
          documents={documents}
          isLoading={documentsLoading}
          error={documentsError}
          onOpenDocument={handleOpenDocument}
        />
      </div>

      {/* AI Usage */}
      <div className="grid gap-4 grid-cols-1">
        <MemoizedQuickActions
          onUploadDocument={() => router.push("/dashboard/upload")}
          onTemplates={() => router.push("/dashboard/templates")}
          onSettings={() => router.push("/dashboard/settings")}
        />
        <MemoizedAIUsageCard userId={userId || ""} />
      </div>
    </>
  );
}

// Component-specific skeleton loaders
function DocumentsSkeletonSection() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground animate-pulse">
      <div className="p-6">
        <div className="h-5 w-32 bg-muted rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickActionsSkeletonSection() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground animate-pulse">
      <div className="p-6">
        <div className="h-5 w-24 bg-muted rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Import WelcomeCard with correct import, as it was previously undefined
import { WelcomeCard } from "@/components/dashboard/welcome-card";
