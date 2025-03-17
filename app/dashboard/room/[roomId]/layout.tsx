import { RoomProvider } from "@/lib/contexts/RoomContext";

export default function RoomLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { roomId: string };
}) {
  return <RoomProvider roomId={params.roomId}>{children}</RoomProvider>;
}
