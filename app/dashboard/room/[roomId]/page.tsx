"use client";

import { authClient } from "@/lib/auth/client";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import prisma from "@/lib/prismaClient";
import { CreateDocument } from "@/components/dashboard/create-document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Document } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomMembers } from "@/components/dashboard/room-members";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }> | { roomId: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<{
    name: string;
    documents: Document[];
    ownerId: string;
  } | null>(null);
  const { data: session, isPending } = authClient.useSession();

  // Unwrap params with React.use()
  const unwrappedParams = params instanceof Promise ? use(params) : params;
  const roomId = unwrappedParams.roomId;

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/room/${roomId}`);
        if (!response.ok) {
          router.push("/dashboard");
          return;
        }
        const data = await response.json();
        setRoom(data);
      } catch (error) {
        console.error("Error fetching room:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchRoom();
    }
  }, [roomId, session, isPending, router]);

  if (loading || isPending) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{room.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="documents" className="space-y-4">
            <TabsList>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4">
              <CreateDocument roomId={roomId} />
              <div className="grid gap-4">
                {room.documents.map((document) => (
                  <Card
                    key={document.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      router.push(
                        `/dashboard/room/${roomId}/document/${document.id}`
                      )
                    }
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {document.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        Last updated:{" "}
                        {new Date(document.updatedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="members">
              <RoomMembers roomId={roomId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
