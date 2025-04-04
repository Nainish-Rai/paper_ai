"use client";

import { Toaster } from "@/components/ui/toaster";
import DashboardSideBar from "@/components/DashboardSideBar";
import { DashboardHeader } from "@/components/dashboard/header";
import { useAuth } from "@/lib/auth/provider";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Extract documentId from path if we're on a document page
  const documentMatch = pathname?.match(/^\/dashboard\/documents\/([^/]+)$/);
  const documentId = documentMatch ? documentMatch[1] : undefined;

  return (
    <div className="flex h-screen ">
      <DashboardSideBar />
      <main className="flex-1 flex flex-col">
        <div className="h-16 border-b border-border  sticky top-0 z-50 ">
          <div className="px-6 h-full flex items-center">
            {user && <DashboardHeader user={user} documentId={documentId} />}
          </div>
        </div>
        <div
          className={cn(
            "flex-1 overflow-auto",
            "",
            "transition-all duration-300 ease-in-out"
          )}
        >
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
