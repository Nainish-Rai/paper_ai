"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

type ImportChatGPTResponse = {
  documentId?: string;
  message?: string;
  reused?: boolean;
};

export function ImportChatGPTDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const canImport = url.trim().length > 0 && !isImporting;

  async function handleImport() {
    if (!canImport) return;

    setIsImporting(true);

    try {
      const response = await fetch("/api/import/chatgpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      const result = (await response.json()) as ImportChatGPTResponse;

      if (!response.ok || !result.documentId) {
        throw new Error(result.message || "Failed to import ChatGPT link.");
      }

      toast({
        title: result.reused ? "Import already exists" : "Chat imported",
        description: "Opening the saved note.",
      });
      setOpen(false);
      setUrl("");
      router.push(`/dashboard/documents/${result.documentId}`);
    } catch (error) {
      toast({
        title: "Import failed",
        description:
          error instanceof Error ? error.message : "Failed to import link.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isImporting) {
          setOpen(nextOpen);
        }
      }}
    >
      <DialogTrigger asChild>
        <button className="flex h-full w-full flex-col items-start rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 active:scale-[0.97]">
          <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Import ChatGPT</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Import ChatGPT</DialogTitle>
          <DialogDescription>
            Paste a public shared chat link to save it as an editable note.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Shared links are public to anyone with the URL. Review sensitive
              content before importing.
            </AlertDescription>
          </Alert>

          <div className="grid gap-2">
            <Label htmlFor="chatgpt-share-url">Shared link</Label>
            <Input
              id="chatgpt-share-url"
              value={url}
              placeholder="https://chatgpt.com/share/..."
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleImport();
                }
              }}
              disabled={isImporting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!canImport}>
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing
              </>
            ) : (
              "Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
