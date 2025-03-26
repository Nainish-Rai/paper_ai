"use client";

import Link from "next/link";
import { UserButton } from "@/components/dashboard/user-button";
import { ModeToggle } from "@/components/mode-toggle";
import { ExportButton } from "@/components/ui/export-button";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { useShareDocument } from "@/lib/hooks/useShareDocument";
import { useDocument } from "@/lib/hooks/useDocument";
import { User } from "@/lib/auth/types";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useAuth } from "@/lib/auth/provider";

interface DashboardHeaderProps {
  user: User;
  documentId?: string;
}

export function DashboardHeader({ user, documentId }: DashboardHeaderProps) {
  const { toast } = useToast();
  const { data: document } = useDocument(documentId || "");
  const { mutate: shareDocument, isPending: isSharing } = useShareDocument(
    documentId || ""
  );
  const [copied, setCopied] = useState(false);
  const { user: currentUser } = useAuth();

  const handleCopyLink = () => {
    if (document) {
      const documentUrl = `${window.location.origin}/dashboard/documents/${documentId}`;
      navigator.clipboard.writeText(documentUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Link copied!",
          description: "Share this link with others to collaborate.",
        });
      });
    }
  };

  const isDocumentPage = Boolean(documentId && document);

  return (
    <div className="w-full  ">
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <Link href="/dashboard">
            {isDocumentPage ? (
              <h1 className="text-2xl font-bold tracking-tight">
                {document.title}
              </h1>
            ) : (
              <h1 className="text-2xl font-bold tracking-tight">PaperAI</h1>
            )}
          </Link>
          <p className="text-sm text-muted-foreground">
            {isDocumentPage
              ? "Editing document"
              : "Smart document collaboration"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isDocumentPage && (
            <>
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
                  currentUser?.id === document?.authorId && (
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
              {document.content && (
                <ExportButton
                  editor={JSON.parse(document.content)}
                  documentId={document.id}
                />
              )}
            </>
          )}
          <ModeToggle />
          <UserButton user={user} />
        </div>
      </div>
    </div>
  );
}
