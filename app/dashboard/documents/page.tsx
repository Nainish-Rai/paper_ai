"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { CreateDocument } from "@/components/dashboard/create-document";

export default function DocumentsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ["personal-documents"],
    queryFn: async () => {
      const response = await fetch("/api/documents/personal");
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      return response.json();
    },
  });

  if (!session && !sessionLoading) {
    router.push("/login");
    return null;
  }

  if (sessionLoading || documentsLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>My Documents</CardTitle>
          <CreateDocument />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {documents?.map((doc: any) => (
              <Card key={doc.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      router.push(`/dashboard/documents/${doc.id}`)
                    }
                    className="text-primary hover:underline"
                  >
                    Open
                  </button>
                </div>
              </Card>
            ))}
            {documents?.length === 0 && (
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
