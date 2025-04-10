"use client";

import {
  UserPlus,
  Copy,
  Globe,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDocument } from "@/lib/hooks/useDocument";
import { useShareDocument } from "@/lib/hooks/useShareDocument";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentCollaborator {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  role: "viewer" | "editor" | "owner";
}

interface InviteDialogProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
}

export default function InviteDialog({
  documentId,
  open,
  onOpenChange,
}: InviteDialogProps) {
  const { toast } = useToast();
  const { data: document, isLoading, refetch } = useDocument(documentId || "");
  const { mutate: shareDocument, isPending: isSharing } = useShareDocument(
    documentId || ""
  );

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("editor");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [collaborators, setCollaborators] = useState<DocumentCollaborator[]>(
    []
  );
  const [linkSharingEnabled, setLinkSharingEnabled] = useState(
    document?.shared || false
  );
  const [isSearching, setIsSearching] = useState(false);
  const [userSearchResults, setUserSearchResults] =
    useState<UserSearchResult | null>(null);

  useEffect(() => {
    if (open) {
      setEmail("");
      setInviteError(null);
      setUserSearchResults(null);
      refetch();
    }
  }, [open, refetch]);

  useEffect(() => {
    if (document) {
      setLinkSharingEnabled(document.shared);
    }
  }, [document]);

  useEffect(() => {
    if (document?.authorId) {
      const fetchCollaborators = async () => {
        try {
          const response = await fetch(
            `/api/documents/${documentId}/collaborators`
          );
          if (response.ok) {
            const data = await response.json();
            setCollaborators(data);
          } else {
            setCollaborators([
              {
                id: document.authorId,
                name: document.author?.name || "Document Owner",
                email: document.author?.email || "owner@example.com",
                initials: getInitials(document.author?.name || "DO"),
                role: "owner",
              },
            ]);
          }
        } catch (error) {
          console.error("Error fetching collaborators", error);
        }
      };

      fetchCollaborators();
    }
  }, [document, documentId]);

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCopyLink = () => {
    const documentUrl = `${window.location.origin}/dashboard/documents/${documentId}`;
    navigator.clipboard.writeText(documentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        description: "Link copied to clipboard",
      });
    });
  };

  const handleEmailChange = async (value: string) => {
    setEmail(value);
    setInviteError(null);
    setUserSearchResults(null);

    if (value && isValidEmail(value)) {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/users/search?email=${encodeURIComponent(value)}`,
          {
            method: "GET",
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserSearchResults({
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              avatarUrl: data.user.image,
              initials: getInitials(data.user.name),
            });
          }
        }
      } catch (error) {
        console.error("Error searching for user:", error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      return;
    }

    if (!isValidEmail(email)) {
      setInviteError("Please enter a valid email address");
      return;
    }

    setIsInviting(true);
    setInviteError(null);

    try {
      const response = await fetch(`/api/documents/${documentId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          role,
          userId: userSearchResults?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to invite user");
      }

      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${email}`,
      });

      setEmail("");
      setUserSearchResults(null);
      refetch();
    } catch (error) {
      console.error("Error inviting user:", error);
      setInviteError("Failed to send invitation. Please try again.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateLinkSharing = async (enabled: boolean) => {
    setLinkSharingEnabled(enabled);

    if (enabled) {
      shareDocument();
      toast({
        title: "Public link sharing enabled",
        description: "Anyone with the link can now access this document",
      });
    } else {
      try {
        const response = await fetch(`/api/documents/${documentId}/unshare`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to disable link sharing");
        }

        toast({
          title: "Public link sharing disabled",
          description: "Only invited collaborators can access this document",
        });

        refetch();
      } catch (error) {
        console.error("Error disabling link sharing:", error);
        setLinkSharingEnabled(true);
        toast({
          title: "Error",
          description: "Failed to disable link sharing",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (collaboratorId === document?.authorId) {
      toast({
        title: "Cannot remove owner",
        description: "The document owner cannot be removed",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/documents/${documentId}/collaborators/${collaboratorId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove collaborator");
      }

      setCollaborators(collaborators.filter((c) => c.id !== collaboratorId));
      toast({
        title: "Collaborator removed",
        description: "User has been removed from this document",
      });
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast({
        title: "Error",
        description: "Failed to remove collaborator",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCollaboratorRole = async (
    collaboratorId: string,
    newRole: "viewer" | "editor"
  ) => {
    try {
      const response = await fetch(
        `/api/documents/${documentId}/collaborators/${collaboratorId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update collaborator role");
      }

      setCollaborators(
        collaborators.map((c) =>
          c.id === collaboratorId ? { ...c, role: newRole } : c
        )
      );

      toast({
        title: "Role updated",
        description: `User role has been updated to ${newRole}`,
      });
    } catch (error) {
      console.error("Error updating collaborator role:", error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-foreground">
            Share document
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-muted-foreground">
            Invite people to collaborate on this document.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Users className="h-4 w-4 mr-1.5" />
              Invite specific people
            </h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="flex w-full items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="inviteEmail"
                    className="pl-9 pr-24 h-10"
                    placeholder="Enter email address"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    autoComplete="email"
                  />
                  <Select
                    value={role}
                    onValueChange={(value: "viewer" | "editor") =>
                      setRole(value)
                    }
                  >
                    <SelectTrigger className="absolute right-0 top-0 h-full w-[100px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="h-10 whitespace-nowrap"
                  disabled={!email.trim() || isInviting || isSearching}
                >
                  {isInviting ? "Inviting..." : "Invite"}
                </Button>
              </div>

              {isSearching && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <p>Searching for user...</p>
                </div>
              )}

              {userSearchResults && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={userSearchResults.avatarUrl}
                      alt={userSearchResults.name}
                    />
                    <AvatarFallback>
                      {userSearchResults.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {userSearchResults.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userSearchResults.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    User found
                  </Badge>
                </div>
              )}

              {inviteError && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <p>{inviteError}</p>
                </div>
              )}
            </form>

            <div className="mt-4 text-xs text-muted-foreground">
              <p className="flex items-center">
                <Lock className="h-3.5 w-3.5 mr-1.5 inline-block" />
                Inviting a specific person doesn&apos;t make this document
                public.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Globe className="h-4 w-4 mr-1.5" />
              Public link sharing
            </h3>

            <div className="flex items-center space-x-2">
              <Switch
                id="link-sharing"
                checked={linkSharingEnabled}
                onCheckedChange={handleUpdateLinkSharing}
                disabled={isSharing}
              />
              <div>
                <Label htmlFor="link-sharing" className="font-medium">
                  Anyone with the link
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {linkSharingEnabled
                    ? "This document can be accessed by anyone with the link"
                    : "Only specific people you invite can access"}
                </p>
              </div>
            </div>

            {linkSharingEnabled && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    readOnly
                    className="pl-9 pr-20 h-10"
                    value={`${window.location.origin}/dashboard/documents/${documentId}`}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  {copied ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-3">People with access</h4>
          <ul className="max-h-[180px] overflow-y-auto space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading...
              </p>
            ) : collaborators.length > 0 ? (
              collaborators.map((collaborator) => (
                <li
                  key={collaborator.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={collaborator.avatarUrl}
                        alt={collaborator.name}
                      />
                      <AvatarFallback>{collaborator.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {collaborator.name}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {collaborator.email}
                      </p>
                    </div>
                  </div>

                  {collaborator.role === "owner" ? (
                    <Badge
                      variant="outline"
                      className="bg-background text-xs font-medium"
                    >
                      Owner
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Select
                        defaultValue={collaborator.role}
                        onValueChange={(value: "viewer" | "editor") =>
                          handleUpdateCollaboratorRole(
                            collaborator.id,
                            value as "viewer" | "editor"
                          )
                        }
                      >
                        <SelectTrigger className="h-7 text-xs w-[90px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          handleRemoveCollaborator(collaborator.id)
                        }
                      >
                        <span className="sr-only">Remove</span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </Button>
                    </div>
                  )}
                </li>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No collaborators yet
              </p>
            )}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
