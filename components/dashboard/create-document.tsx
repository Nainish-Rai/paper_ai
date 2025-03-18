"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useDocumentStore } from "@/lib/stores/documentStore";
import { Plus, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface CreateDocumentProps {
  roomId?: string;
}

export function CreateDocument({ roomId }: CreateDocumentProps = {}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [shared, setShared] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { createDocument, isLoading } = useDocumentStore();

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a document title",
        variant: "destructive",
      });
      return;
    }

    try {
      const document = await createDocument(title.trim(), roomId, shared);
      if (document) {
        toast({
          title: "Success",
          description: "Document created successfully",
        });
        setOpen(false);
        // Redirect to the appropriate document path
        const path = roomId
          ? `/dashboard/room/${roomId}/document/${document.id}`
          : `/dashboard/documents/${document.id}`;
        router.push(path);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create document",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setTitle("");
          setShared(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
          <DialogDescription>
            {roomId
              ? "Create a new document in this room"
              : "Create a new personal document"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              placeholder="Enter document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleCreate();
                }
              }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="shared"
              checked={shared}
              onCheckedChange={(checked) => setShared(checked as boolean)}
            />
            <Label htmlFor="shared">Enable real-time collaboration</Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading || !title.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
