"use client";

import { ReactNode } from "react";
import { RoomProvider } from "@liveblocks/react/suspense";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { Loading } from "@/components/Loading";

export function CollaborativeSpace({
  children,
  documentId,
}: {
  children: ReactNode;
  documentId: string;
}) {
  // Create a room ID based on the document ID for LiveBlocks
  const roomId = `document:${documentId}`;

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
      }}
    >
      <ClientSideSuspense fallback={<Loading />}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
