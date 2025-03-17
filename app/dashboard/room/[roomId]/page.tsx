"use client";

import { authClient } from "@/lib/auth/client";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import prisma from "@/lib/prismaClient";
import { CreateDocument } from "@/components/dashboard/create-document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Document } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<{
    name: string;
    documents: Document[];
  } | null>(null);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/room/${params.roomId}`);
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
  }, [params.roomId, session, isPending, router]);

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
          <div className="grid gap-4">
            <CreateDocument roomId={params.roomId} />
            <div className="grid gap-4">
              {room.documents.map((document) => (
                <Card key={document.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{document.title}</CardTitle>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
