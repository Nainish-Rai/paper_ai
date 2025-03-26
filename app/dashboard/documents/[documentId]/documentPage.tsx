"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CollaborativeEditor } from "@/components/CollaborativeEditor";
import { useDocument } from "@/lib/hooks/useDocument";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useShareDocument } from "@/lib/hooks/useShareDocument";
import { useState } from "react";
import { AccessDeniedDialog } from "@/components/ui/access-denied-dialog";
import { CollaboratorAvatars } from "@/components/dashboard/collaborator-avatars";

export default function DocumentPageClient({
  documentId,
}: {
  documentId: string;
}) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const { data: document, isLoading: documentLoading } =
    useDocument(documentId);

  if (!session && !sessionLoading) {
    router.push("/login");
    return null;
  }

  if (sessionLoading || documentLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[600px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied dialog if user doesn't have permission
  if (document && session?.user?.id !== document.authorId && !document.shared) {
    return <AccessDeniedDialog />;
  }

  return (
    <div className=" pb-6">
      <div className="mb-4 flex items-center sticky w-full top-0 py-2 z-50 bg-white shadow-sm justify-between px-4">
        <div className="flex items-center w-full justify-between gap-4">
          <h1 className="text-xl font-semibold">
            {document?.title || "Untitled"}
          </h1>
          <CollaboratorAvatars documentId={documentId} />
        </div>
      </div>
      <div className="px-4 max-w-5xl ">
        <CollaborativeEditor documentId={documentId} />
      </div>
    </div>
  );
}
