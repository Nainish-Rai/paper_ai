"use client";

import Link from "next/link";
import { UserButton } from "@/components/dashboard/user-button";
import { ModeToggle } from "@/components/mode-toggle";
import { ExportButton } from "@/components/ui/export-button";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Copy,
  Check,
  MoreHorizontal,
  Clock,
  Star,
  StarOff,
  Download,
} from "lucide-react";
import { useShareDocument } from "@/lib/hooks/useShareDocument";
import { useDocument } from "@/lib/hooks/useDocument";
import { User } from "@/lib/auth/types";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useAuth } from "@/lib/auth/provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CollaboratorAvatars } from "@/components/dashboard/collaborator-avatars";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface DashboardHeaderProps {
  user: User;
  documentId?: string;
}

export function DashboardHeader({ user, documentId }: DashboardHeaderProps) {
  const { toast } = useToast();
  const { data: document, isLoading } = useDocument(documentId || "");
  const { mutate: shareDocument, isPending: isSharing } = useShareDocument(
    documentId || ""
  );
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user: currentUser } = useAuth();

  const handleCopyLink = () => {
    if (document) {
      const documentUrl = `${window.location.origin}/dashboard/documents/${documentId}`;
      navigator.clipboard.writeText(documentUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          description: "Link copied to clipboard",
          duration: 2000,
        });
      });
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    toast({
      description: isFavorite ? "Removed from favorites" : "Added to favorites",
      duration: 2000,
    });
  };

  const isDocumentPage = Boolean(documentId && document);
  const isOwner = currentUser?.id === document?.authorId;

  // Renders breadcrumb for document pages, otherwise just the title
  const renderPageTitle = () => {
    if (isDocumentPage) {
      if (isLoading) {
        return <Skeleton className="h-5 w-40" />;
      }
      return (
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground"
            >
              Workspace
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#" className="font-medium">
              {document?.title || "Untitled"}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      );
    }

    return (
      <h1 className="text-xl font-semibold tracking-tight">
        {isDocumentPage ? document?.title || "Untitled" : "Home"}
      </h1>
    );
  };

  return (
    <div className="w-full h-full flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          {renderPageTitle()}

          {/* Only show these on document pages */}
          {isDocumentPage && !isLoading && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleFavoriteToggle}
              >
                {isFavorite ? (
                  <Star className="h-4 w-4 text-yellow-400" />
                ) : (
                  <StarOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-normal text-muted-foreground hover:text-foreground"
              >
                <Clock className="h-3.5 w-3.5 mr-1" />
                Updated {new Date().toLocaleDateString()}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isDocumentPage && !isLoading && (
            <>
              <CollaboratorAvatars documentId={documentId || ""} />

              {/* Share button for document owner */}
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document?.shared ? handleCopyLink() : shareDocument()
                  }
                  disabled={isSharing}
                  className="text-xs h-8 gap-1.5"
                >
                  {document?.shared ? (
                    <>
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy link
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </>
                  )}
                </Button>
              )}

              {/* Document actions menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {document?.content && (
                    <DropdownMenuItem
                      onClick={() => {
                        // Export functionality
                        toast({ description: "Exporting document..." });
                      }}
                    >
                      <Download className="w-3.5 h-3.5 mr-2" />
                      Export
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleFavoriteToggle}>
                    {isFavorite ? (
                      <>
                        <StarOff className="w-3.5 h-3.5 mr-2" />
                        Remove from favorites
                      </>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5 mr-2" />
                        Add to favorites
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isOwner && (
                    <DropdownMenuItem className="text-red-600">
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserButton user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
