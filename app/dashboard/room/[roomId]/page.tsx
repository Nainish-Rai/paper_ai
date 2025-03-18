import RoomPageClient from "./roomPage";

// Server component to handle async params
export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <RoomPageClient roomId={roomId} />;
}
