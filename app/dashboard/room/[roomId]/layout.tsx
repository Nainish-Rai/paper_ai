import { RoomProvider } from "@/lib/contexts/RoomContext";

export default async function RoomLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <RoomProvider roomId={roomId}>{children}</RoomProvider>;
}
