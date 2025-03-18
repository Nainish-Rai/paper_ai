"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Room } from "@/app/Room";
import { CollaborativeEditor } from "@/components/CollaborativeEditor";

export default function DocumentPage({
  params,
}: {
  params: { roomId: string; documentId: string };
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (!session && !isPending) {
    router.push("/login");
    return null;
  }

  if (isPending) {
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

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardContent className="p-6">
          <Room roomId={`${params.roomId}:${params.documentId}`}>
            <CollaborativeEditor />
          </Room>
        </CardContent>
      </Card>
    </div>
  );
}
