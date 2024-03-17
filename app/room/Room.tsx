"use client";

import { ReactNode, useMemo } from "react";
import { RoomProvider } from "@/liveblocks.config";
import { usePathname, useSearchParams } from "next/navigation";
import { ClientSideSuspense } from "@liveblocks/react";

interface Props {
  Editor: any;
  roomId: string;
}

const Room = ({ Editor, roomId }: Props) => {
  // const pathname = usePathname();
  // const roomId = pathname?.split("/")[2];
  // console.log(roomId);
  return (
    <RoomProvider
      id={roomId ? roomId : "nextjs-yjs-blocknote-advanced"}
      initialPresence={{
        cursor: null,
      }}
    >
      <ClientSideSuspense fallback={<>Loading.....</>}>
        {() => Editor}
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default Room;

/**
 * This function is used when deploying an example on liveblocks.io.
 * You can ignore it completely if you run the example locally.
 */
function useOverrideRoomId(roomId: string) {
  const params = useSearchParams();
  const roomIdParam = params.get("roomId");

  const overrideRoomId = useMemo(() => {
    return roomIdParam ? `${roomId}-${roomIdParam}` : roomId;
  }, [roomId, roomIdParam]);

  return overrideRoomId;
}
