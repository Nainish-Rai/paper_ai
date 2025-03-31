"use client";

import { Card } from "@/components/ui/card";
import { Upload, FileText, Settings } from "lucide-react";
import { CreateDocument } from "./create-document";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
  onUploadDocument?: () => void;
  onTemplates?: () => void;
  onSettings?: () => void;
}

export function QuickActions({
  onUploadDocument,
  onTemplates,
  onSettings,
}: QuickActionsProps) {
  const router = useRouter();

  const handleAction = (callback?: () => void) => () => {
    if (callback) {
      callback();
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground">
      <div className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Quick access
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <CreateDocument />

          <button
            className="flex flex-col items-start rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
            onClick={handleAction(onUploadDocument)}
          >
            <Upload className="h-5 w-5 mb-2 text-muted-foreground" />
            <span className="text-sm font-medium">Upload</span>
          </button>
          <button
            className="flex flex-col items-start rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
            onClick={handleAction(onTemplates)}
          >
            <FileText className="h-5 w-5 mb-2 text-muted-foreground" />
            <span className="text-sm font-medium">Templates</span>
          </button>
          <button
            className="flex flex-col items-start rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
            onClick={handleAction(onSettings)}
          >
            <Settings className="h-5 w-5 mb-2 text-muted-foreground" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
