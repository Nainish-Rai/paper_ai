"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CollaborativeEditor } from "@/components/CollaborativeEditor";
import { motion } from "framer-motion";
import { useDocument } from "@/lib/hooks/useDocument";
import { useSidebarStore } from "@/lib/stores/sidebarStore";
import { AccessDeniedDialog } from "@/components/ui/access-denied-dialog";
import { CollaboratorAvatars } from "@/components/dashboard/collaborator-avatars";
import { EditableTitle } from "@/components/dashboard/editable-title";

export default function DocumentPageClient({
  documentId,
}: {
  documentId: string;
}) {
  const router = useRouter();
  const { isOpen } = useSidebarStore();
  console.log("sidebar open", isOpen);
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const { data: document, isLoading: documentLoading } =
    useDocument(documentId);

  if (!session && !sessionLoading) {
    router.push("/login");
    return null;
  }

  if (sessionLoading || documentLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[600px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied dialog if user doesn't have permission
  if (document && session?.user?.id !== document.authorId && !document.shared) {
    return <AccessDeniedDialog />;
  }

  return (
    <div className="pb-6">
      <div className="mb-4 flex items-center sticky w-full top-0 py-2 z-50 bg-white dark:bg-background shadow-sm justify-between px-4">
        <div className="flex items-center w-full justify-between gap-4">
          <EditableTitle
            documentId={documentId}
            initialTitle={document?.title || "Untitled"}
          />
          <CollaboratorAvatars documentId={documentId} />
        </div>
      </div>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          layout: {
            type: "spring",
            stiffness: 300,
            damping: 30,
          },
          opacity: { duration: 0.2 },
        }}
        className={`px-4  ${!isOpen ? "mx-auto max-w-4xl" : "max-w-5xl"}`}
      >
        <CollaborativeEditor documentId={documentId} />
      </motion.div>
    </div>
  );
}
