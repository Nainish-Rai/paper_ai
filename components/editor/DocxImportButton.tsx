"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";

interface DocxImportButtonProps {
  onImport: (html: string) => Promise<void>;
}

export function DocxImportButton({ onImport }: DocxImportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.name.endsWith(".docx")) {
        toast({
          title: "Invalid file type",
          description: "Please select a .docx file",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/documents/import", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to import document");
        }

        const data = await response.json();

        // Pass the HTML content to the parent component for conversion
        await onImport(data.html);

        toast({
          title: "Success",
          description: "Document imported successfully",
        });
      } catch (error) {
        console.error("Import error:", error);
        toast({
          title: "Import failed",
          description: "Failed to import document. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        // Reset the input value to allow importing the same file again
        event.target.value = "";
      }
    },
    [onImport, toast]
  );

  return (
    <div className="relative">
      <input
        type="file"
        accept=".docx"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <LoadingSpinner className="w-4 h-4" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        Import DOCX
      </Button>
    </div>
  );
}
