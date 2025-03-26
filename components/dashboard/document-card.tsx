"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { File } from "lucide-react";
import { memo } from "react";
import { DocumentWithAuthor } from "@/lib/hooks/useDocuments";

interface DocumentCardProps {
  document: DocumentWithAuthor;
  onOpen: (id: string) => void;
}

const DocumentCard = memo(({ document, onOpen }: DocumentCardProps) => {
  const formattedDate = new Date(document.createdAt).toLocaleDateString();

  const handleOpen = () => {
    onOpen(document.id);
  };

  return (
    <Card
      onClick={handleOpen}
      className="p-4 hover:shadow-md cursor-pointer duration-200 transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <File className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">{document.title}</h3>
            <p className="text-sm text-muted-foreground">
              Created {formattedDate}
            </p>
          </div>
          <div className="ml-4 flex gap-2">
            {document.shared && (
              <Badge variant="secondary">Collaborative</Badge>
            )}
            <Badge variant="outline">Personal</Badge>
          </div>
        </div>
        <button
          onClick={handleOpen}
          className="text-primary hover:underline"
          aria-label={`Open ${document.title}`}
        >
          Open
        </button>
      </div>
    </Card>
  );
});

DocumentCard.displayName = "DocumentCard";

export default DocumentCard;
