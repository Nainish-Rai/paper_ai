"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Plus,
  Loader2,
  PlusCircle,
  FileText,
  ClipboardList,
  Target,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { documentTemplates } from "@/lib/templates/documentTemplates";
import { cn } from "@/lib/utils";

export function CreateDocument({ isHorizontal }: { isHorizontal?: boolean }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
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
      const document = await createDocument(
        title.trim(),
        false,
        selectedTemplate
      );
      if (document) {
        toast({
          title: "Success",
          description: "Document created successfully",
        });
        setOpen(false);
        router.push(`/dashboard/documents/${document.id}`);
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

  const templateIcons: Record<string, any> = {
    file: FileText,
    "clipboard-list": ClipboardList,
    target: Target,
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setTitle("");
          setSelectedTemplate("blank");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={
            isHorizontal
              ? "flex w-full text-left gap-2"
              : "flex h-full w-full flex-col items-start rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
          }
        >
          <PlusCircle className="h-5 w-5 mb-2 text-muted-foreground" />
          <span className="text-sm font-medium">New Document</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
          <DialogDescription>
            Create a new document with real-time collaboration enabled. You can
            share it with others once created.
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
          <div className="grid gap-2">
            <Label>Template</Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {documentTemplates.map((template) => {
                const Icon = templateIcons[template.icon];
                return (
                  <div
                    key={template.id}
                    className={cn(
                      "flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-muted/50",
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5"
                        : "border-muted"
                    )}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <Icon className="mb-2 h-6 w-6" />
                    <div className="text-center">
                      <p className="font-medium leading-none">
                        {template.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
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
