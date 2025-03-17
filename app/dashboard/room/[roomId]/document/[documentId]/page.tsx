"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useDocumentStore } from "@/lib/stores/documentStore";
import { TipTapEditor } from "@/components/custom/TipTapEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentPage({
  params,
}: {
  params: { roomId: string; documentId: string };
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(true);
  const { currentDocument, setCurrentDocument } = useDocumentStore();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${params.documentId}`);
        if (!response.ok) {
          router.push(`/dashboard/room/${params.roomId}`);
          return;
        }
        const data = await response.json();
        setCurrentDocument(data);
      } catch (error) {
        console.error("Error fetching document:", error);
        router.push(`/dashboard/room/${params.roomId}`);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchDocument();
    }
  }, [
    params.documentId,
    params.roomId,
    session,
    isPending,
    router,
    setCurrentDocument,
  ]);

  if (loading || isPending) {
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

  if (!currentDocument) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardContent className="p-6">
          <TipTapEditor
            documentId={params.documentId}
            initialContent={currentDocument.content || ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
