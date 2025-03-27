"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { DocumentsSection } from "@/components/dashboard/documents-section";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatsCard } from "@/components/dashboard/stats-card";
import { AIUsageCard } from "@/components/dashboard/ai-usage-card";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: documents, isLoading, error } = useDocuments(session?.user?.id);

  const handleOpenDocument = (id: string) => {
    if (id) {
      router.push(`/dashboard/documents/${id}`);
      router.refresh();
    }
  };

  const handleUploadDocument = () => {
    // Implement document upload functionality
    console.log("Upload document");
  };

  const handleTemplates = () => {
    // Implement templates page navigation
    console.log("Navigate to templates");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      <WelcomeCard session={session} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <QuickActions
          onUploadDocument={handleUploadDocument}
          onTemplates={handleTemplates}
          onSettings={handleSettings}
        />
        <div className="md:col-span-2 space-y-4">
          <StatsCard documents={documents} />
          <AIUsageCard userId={session.user.id} />
        </div>
      </div>

      <DocumentsSection
        documents={documents}
        isLoading={isLoading}
        error={error}
        onOpenDocument={handleOpenDocument}
      />
    </div>
  );
}
