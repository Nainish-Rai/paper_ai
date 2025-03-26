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

export default function DocumentPageClient({
  documentId,
}: {
  documentId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const { data: document, isLoading: documentLoading } =
    useDocument(documentId);
  const { mutate: shareDocument, isPending: isSharing } =
    useShareDocument(documentId);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/dashboard/documents/${documentId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link copied!",
      description: "Share this link with others to collaborate.",
    });
  };

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
    <div className="mx-auto pb-6">
      <Card className="w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-semibold">{document?.title}</h1>
          <div className="flex gap-2">
            {document?.shared ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            ) : (
              session?.user?.id === document?.authorId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareDocument()}
                  disabled={isSharing}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )
            )}
          </div>
        </div>
        <CardContent>
          <CollaborativeEditor documentId={documentId} />
        </CardContent>
      </Card>
    </div>
  );
}
