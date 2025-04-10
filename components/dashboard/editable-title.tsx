"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableTitleProps {
  documentId: string;
  initialTitle: string;
  className?: string;
}

export function EditableTitle({
  documentId,
  initialTitle,
  className,
}: EditableTitleProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Sync with initialTitle if it changes
  useEffect(() => {
    if (!isEditing) {
      setTitle(initialTitle);
    }
  }, [initialTitle, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle document title update
  const updateDocumentTitle = async (newTitle: string) => {
    if (newTitle.trim() === initialTitle.trim() || !newTitle.trim()) {
      setTitle(initialTitle);
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`/api/documents/${documentId}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update title");
      }

      toast({
        description: "Document title updated",
        duration: 2000,
      });

      // Refresh data without a full page reload
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update document title",
        variant: "destructive",
      });
      setTitle(initialTitle);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      updateDocumentTitle(title);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setTitle(initialTitle);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    updateDocumentTitle(title);
  };

  return (
    <div className={cn("group w-full", className)}>
      {isEditing ? (
        <div className="w-full max-w-full">
          <Input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={isSaving}
            className="px-1 py-0.5 text-2xl font-medium h-auto bg-transparent border-0 border-b-2 rounded-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Untitled"
            autoFocus
          />
        </div>
      ) : (
        <h1
          className="text-2xl font-medium cursor-text px-1 py-0.5 w-full truncate hover:bg-accent/40 rounded-sm transition-colors"
          onClick={() => setIsEditing(true)}
        >
          {title || "Untitled"}
        </h1>
      )}
    </div>
  );
}
