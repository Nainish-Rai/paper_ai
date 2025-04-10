"use client";

import { Toaster } from "@/components/ui/toaster";
import DashboardSideBar from "@/components/DashboardSideBar";
import { DashboardHeader } from "@/components/dashboard/header";
import { useAuth } from "@/lib/auth/provider";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useSidebarStore } from "@/lib/stores/sidebarStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const { isOpen } = useSidebarStore();

  // Extract documentId from path if we're on a document page
  const documentMatch = pathname?.match(/^\/dashboard\/documents\/([^/]+)$/);
  const documentId = documentMatch ? documentMatch[1] : undefined;

  // Determine if we're on a document page to adjust layout
  const isDocumentPage = !!documentId;

  return (
    <div className="flex h-screen bg-background">
      <DashboardSideBar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div
          className={cn(
            "border-b border-border transition-all duration-300",
            isDocumentPage ? "h-12" : "h-16"
          )}
        >
          {loading ? (
            <div className="px-6 h-full flex items-center">
              <Skeleton className="h-8 w-48" />
            </div>
          ) : (
            <div className="px-6 h-full flex items-center">
              {user && <DashboardHeader user={user} documentId={documentId} />}
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex-1 overflow-auto",
            isOpen ? "pl-0" : "pl-0",
            "transition-all duration-300 ease-in-out"
          )}
        >
          <div
            className={cn(
              isDocumentPage ? "max-w-none" : "max-w-7xl mx-auto",
              "py-6 px-4 sm:px-6 lg:px-8"
            )}
          >
            {children}
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
