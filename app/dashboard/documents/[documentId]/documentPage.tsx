"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CollaborativeEditor } from "@/components/CollaborativeEditor";
import { Editor } from "@/components/Editor";
import { useDocument } from "@/lib/hooks/useDocument";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function DocumentPageClient({
  documentId,
}: {
  documentId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
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

  return (
    <div className="mx-auto pb-6">
      <Card className="w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-semibold">{document?.title}</h1>
          {!document?.shared && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Sharing functionality will be available soon!",
                });
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
        </div>
        <CardContent>
          {document?.shared ? (
            <CollaborativeEditor documentId={documentId} />
          ) : (
            <Editor documentId={documentId} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
