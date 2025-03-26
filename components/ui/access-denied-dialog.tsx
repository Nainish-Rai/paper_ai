"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export function AccessDeniedDialog() {
  const router = useRouter();

  return (
    <Dialog
      open={true}
      onOpenChange={() => router.push("/dashboard/documents")}
    >
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Lock className="w-6 h-6 text-destructive" />
            <DialogTitle>Access Denied</DialogTitle>
          </div>
          <DialogDescription>
            You don&apos;t have permission to access this document. Please
            contact the document owner for access.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={() => router.push("/dashboard/documents")}>
            Back to Documents
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
