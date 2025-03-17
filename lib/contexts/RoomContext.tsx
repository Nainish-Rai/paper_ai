"use client";

import { createContext, useContext, ReactNode } from "react";

interface RoomContextType {
  roomId: string | null;
}

const RoomContext = createContext<RoomContextType>({ roomId: null });

export function useRoom() {
  return useContext(RoomContext);
}

export function RoomProvider({
  children,
  roomId,
}: {
  children: ReactNode;
  roomId: string | null;
}) {
  return (
    <RoomContext.Provider value={{ roomId }}>{children}</RoomContext.Provider>
  );
}
