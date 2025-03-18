"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { CreateDocument } from "@/components/dashboard/create-document";
import { UserWelcome } from "@/components/dashboard/user-welcome";
import { RoomsList } from "@/components/dashboard/rooms-list";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, File } from "lucide-react";
import { Document } from "@prisma/client";

interface DocumentWithAuthor extends Document {
  author: {
    name: string | null;
    email: string;
  };
  room?: {
    name: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const { data: documents, isLoading: documentsLoading } = useQuery<
    DocumentWithAuthor[]
  >({
    queryKey: ["all-documents"],
    queryFn: async () => {
      const response = await fetch("/api/documents/all");
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      return response.json();
    },
    enabled: !!session?.user,
  });

  if (!session && !sessionLoading) {
    router.push("/login");
    return null;
  }

  if (sessionLoading || documentsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        <div className="space-y-4">
          <Skeleton className="h-12 w-[200px]" />
          <Skeleton className="h-[400px] w-full" />
        </div>
        <div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
      {/* Left Sidebar */}
      <div className="space-y-4">
        <UserWelcome user={session.user} />
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <CreateDocument />
          </CardContent>
        </Card>
        <RoomsList userId={session.user.id} />
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>All Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {documents?.map((doc) => (
              <Card key={doc.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {doc.roomId ? (
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <File className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 flex gap-2">
                      {doc.shared && (
                        <Badge variant="secondary">Collaborative</Badge>
                      )}
                      {doc.roomId ? (
                        <Badge variant="outline">Room: {doc.room?.name}</Badge>
                      ) : (
                        <Badge variant="outline">Personal</Badge>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      router.push(
                        doc.roomId
                          ? `/dashboard/room/${doc.roomId}/document/${doc.id}`
                          : `/dashboard/documents/${doc.id}`
                      )
                    }
                    className="text-primary hover:underline"
                  >
                    Open
                  </button>
                </div>
              </Card>
            ))}
            {!documentsLoading && documents?.length === 0 && (
              <p className="text-center text-muted-foreground">
                No documents yet. Create your first document!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
