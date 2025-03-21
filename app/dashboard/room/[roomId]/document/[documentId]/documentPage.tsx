"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Room } from "@/app/Room";
import { CollaborativeEditor } from "@/components/CollaborativeEditor";
import BasicEditor from "@/components/BasicEditor";
import { useDocument } from "@/lib/hooks/useDocument";
import { useMutation } from "@tanstack/react-query";

export default function DocumentPageClient({
  roomId,
  documentId,
}: {
  roomId: string;
  documentId: string;
}) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const { data: document, isLoading: documentLoading } =
    useDocument(documentId);

  // Mutation for updating document content
  const updateMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/documents/${documentId}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to update document");
      }
      return response.json();
    },
  });

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

  return (
    <div className="mx-auto pb-6">
      <Card className="w-full">
        <CardContent>
          {document?.shared ? (
            <Room roomId={`${roomId}:${documentId}`}>
              <CollaborativeEditor />
            </Room>
          ) : (
            <BasicEditor
              content={document?.content}
              onChange={(content) => updateMutation.mutate(content)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
