"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChevronRight, File, Users, Clock } from "lucide-react";
import { memo } from "react";
import { DocumentWithAuthor } from "@/lib/hooks/useDocuments";
import { CollaboratorAvatars } from "./collaborator-avatars";

interface DocumentCardProps {
  document: DocumentWithAuthor;
  onOpen: (id: string) => void;
  filter?: "all" | "personal" | "collaborative";
}

const DocumentCard = memo(
  ({ document, onOpen, filter = "all" }: DocumentCardProps) => {
    const formattedDate = new Date(document.createdAt).toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

    function formatTimeAgo(dateString: string) {
      const date = new Date(dateString);
      const diff = Date.now() - date.getTime();
      const minutes = Math.floor(diff / 60000);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;

      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;

      return `${Math.floor(hours / 24)}d ago`;
    }

    const handleOpen = () => {
      onOpen(document.id);
    };

    return (
      <Card
        onClick={handleOpen}
        className={`p-4 hover:shadow-md cursor-pointer duration-200 transition-shadow group relative overflow-hidden
      ${
        document.shared
          ? "border-l-[3px] border-l-blue-400"
          : "border-l-[3px] border-l-green-400"
      }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <File
              className={`h-4 w-4 ${
                document.shared ? "text-blue-500" : "text-green-500"
              }`}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">
                {document.title}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground mt-1 flex-wrap gap-y-1">
                <Clock className="h-3 w-3 mr-1" />
                <span className="mr-4 text-gray-500">
                  {formatTimeAgo(document.updatedAt)}
                </span>
                <Users className="h-3 w-3 mr-1" />
                <span className="mr-4">
                  {document.collaborators} collaborator
                  {document.collaborators !== 1 ? "s" : ""}
                </span>
                <span className="text-muted-foreground">
                  Created {formattedDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {document.shared && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
                  Collaborative
                </Badge>
              )}
              {!document.shared && (
                <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                  Personal
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Collaborator Avatars */}
            {document.collaborators > 0 && (
              <div className="hidden sm:block">
                <CollaboratorAvatars documentId={document.id} />
              </div>
            )}

            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Hover effect - subtle gradient on right side */}
        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Card>
    );
  }
);

DocumentCard.displayName = "DocumentCard";

export default DocumentCard;
