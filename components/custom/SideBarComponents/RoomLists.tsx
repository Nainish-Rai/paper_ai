import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  username: string;
};

function RoomLists({ username }: Props) {
  const [userRooms, setUserRooms] = useState([] as any[]);
  console.log(userRooms);

  useEffect(() => {
    fetch(`/api/room/getRooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    })
      .then((res) => res.json())
      .then((data) => {
        setUserRooms(data.data);
      });
  }, [username]);

  if (userRooms.length == 0) {
    return (
      <div className=" my-6 px-1 flex flex-col-reverse gap-1 rounded-xl">
        <div className="hover:bg-secondary p p-2 text-sm px-3 rounded-md font-medium">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </div>
    );
  }

  return (
    <div className=" my-6 px-1 flex flex-col-reverse gap-1 rounded-xl">
      {userRooms.length > 0 &&
        userRooms.map((room) => (
          <Link key={room.id} href={`/userdashboard/${room.id}`}>
            <div className="hover:bg-secondary p p-2 text-sm px-3 rounded-md font-medium">
              {">-"} {room.name}
            </div>
          </Link>
        ))}
    </div>
  );
}

export default RoomLists;
