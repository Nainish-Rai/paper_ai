"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import { BlockNoteEditor } from "@blocknote/core";
import { AIToolbar } from "./AIToolbar";
import { ExportButton } from "../ui/export-button";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  Clock,
  Share2,
  Star,
  StarOff,
  Copy,
  Users,
  Lock,
  LayoutGrid,
  FileText,
  Sparkles,
  ChevronDown,
  Settings,
  Check,
  Download,
  PenLine,
  Link,
  Globe,
  UserPlus,
  Loader,
} from "lucide-react";
import { useDocument } from "@/lib/hooks/useDocument";
import { useShareDocument } from "@/lib/hooks/useShareDocument";
import { useToast } from "@/components/ui/use-toast";
import { CollaboratorAvatars } from "../dashboard/collaborator-avatars";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditableTitle } from "../dashboard/editable-title";
import { useAuth } from "@/lib/auth/provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@/components/dashboard/user-button";
import { Skeleton } from "@/components/ui/skeleton";
import InviteDialog from "../blocks/invite-dialog";

interface EditorHeaderProps {
  userId?: string;
  documentId?: string;
  editor?: BlockNoteEditor;
  isDocumentPage?: boolean;
}

export function EditorHeader({
  userId,
  documentId,
  editor,
  isDocumentPage = true,
}: EditorHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: document, isLoading } = useDocument(documentId || "");
  const { user } = useAuth();
  const { mutate: shareDocument, isPending: isSharing } = useShareDocument(
    documentId || ""
  );

  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAIToolbarOpen, setIsAIToolbarOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Check if current user is the owner
  const isOwner = user?.id === document?.authorId;

  // Handle copying link to clipboard
  const handleCopyLink = useCallback(() => {
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
  }, [document, documentId, toast]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite((prev) => !prev);
    toast({
      description: isFavorite ? "Removed from favorites" : "Added to favorites",
      duration: 2000,
    });
  }, [isFavorite, toast]);

  // Format the current date nicely
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Determine if the document is shared for conditional UI
  const isShared = document?.shared || false;

  // Toggle document sharing
  const handleShareToggle = useCallback(() => {
    setIsInviteDialogOpen(true);
  }, []);

  // If not a document page, render dashboard header
  if (!isDocumentPage) {
    return (
      <div className="w-full flex items-center px-6">
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Home</h1>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            {user && <UserButton user={user} />}
          </div>
        </div>
      </div>
    );
  }

  // For document pages, render the document header
  return (
    <div className="w-full bg-background border-b border-border sticky top-0 z-30 transition-all duration-200">
      <div className="w-full px-4 py-2 mx-auto flex flex-col gap-y-0.5">
        {/* Main header content */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 flex items-center">
            {isLoading ? (
              <Skeleton className="h-8 w-64" />
            ) : (
              <EditableTitle
                documentId={documentId || ""}
                initialTitle={document?.title || "Untitled"}
                className="text-xl font-semibold"
              />
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* AI Tools - only show when editor is available */}
            {editor && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-8 px-2.5 gap-1 text-sm rounded-md",
                        isAIToolbarOpen && "bg-accent"
                      )}
                      onClick={() => setIsAIToolbarOpen(!isAIToolbarOpen)}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">AI</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>AI writing assistant</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Share button */}
            {isOwner && !isLoading && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={document?.shared ? "outline" : "default"}
                      size="sm"
                      className={cn("h-8 gap-1.5 text-xs rounded-md")}
                      onClick={handleShareToggle}
                      disabled={isSharing}
                    >
                      {isSharing ? (
                        <Loader className="h-3.5 w-3.5 animate-spin" />
                      ) : document?.shared ? (
                        <>
                          <Users className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Share</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Private</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>
                      {document?.shared ? "Manage sharing" : "Share document"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Export/Download */}
            {editor && !isLoading && (
              <ExportButton documentId={documentId || ""} editor={editor} />
            )}
            {!editor && !isLoading && document?.content && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() =>
                        toast({ description: "Exporting document..." })
                      }
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Export</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Edit button - only when not in editor mode */}
            {!editor && !isLoading && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs rounded-md hidden sm:flex"
                onClick={() =>
                  router.push(`/dashboard/documents/${documentId}`)
                }
              >
                <PenLine className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}

            {/* Favorite toggle */}
            {!isLoading && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={handleFavoriteToggle}
                    >
                      {isFavorite ? (
                        <Star className="h-3.5 w-3.5 text-yellow-400" />
                      ) : (
                        <StarOff className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>
                      {isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Collaborators */}
            {!isLoading && document?.shared && (
              <div className="hidden sm:block">
                <CollaboratorAvatars documentId={documentId || ""} />
              </div>
            )}

            {/* Last updated - Only show on medium screens and up */}
            {!isLoading && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground hidden lg:flex items-center whitespace-nowrap"
                disabled
              >
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Edited {formattedDate}</span>
              </Button>
            )}

            {/* More actions menu */}
            {!isLoading && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem
                    onClick={handleFavoriteToggle}
                    className="text-sm"
                  >
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
                  <DropdownMenuItem className="text-sm">
                    <FileText className="w-3.5 h-3.5 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm">
                    <FileText className="w-3.5 h-3.5 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isOwner && document?.shared && (
                    <>
                      <DropdownMenuItem
                        className="text-sm"
                        onClick={handleCopyLink}
                      >
                        <Link className="w-3.5 h-3.5 mr-2" />
                        Copy link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-sm"
                        onClick={() => setIsInviteDialogOpen(true)}
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-2" />
                        Invite users
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem className="text-sm">
                    <Settings className="w-3.5 h-3.5 mr-2" />
                    Page settings
                  </DropdownMenuItem>
                  {isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 text-sm">
                        <FileText className="w-3.5 h-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* AI Toolbar - only show when toolbar is toggled and editor is available */}
      {isAIToolbarOpen && editor && (
        <div className="border-t border-border bg-background/50 backdrop-blur-sm">
          <div className="w-full max-w-screen-lg mx-auto px-4">
            <AIToolbar
              userId={userId || ""}
              selectedText=""
              onUpdate={() => {}}
            />
          </div>
        </div>
      )}

      {/* Invite Dialog */}
      <InviteDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        documentId={documentId || ""}
      />
    </div>
  );
}
