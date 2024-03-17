import { liveblocks } from "@/lib/LiveBlocksClient";
import prisma from "@/lib/prismaClient";
import Link from "next/link";

type Props = {
  username: string;
};

async function RoomLists({ username }: Props) {
  const rooms = await liveblocks.getRooms();
  const userRooms = await prisma.room.findMany({
    where: {
      owner: username,
    },
  });

  console.log(userRooms);

  return (
    <div>
      {userRooms.map((room) => (
        <Link key={room.id} href={`/userdashboard/${room.id}`}>
          <div>{room.name}</div>
        </Link>
      ))}
    </div>
  );
}

export default RoomLists;
