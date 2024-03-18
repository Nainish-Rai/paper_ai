import { liveblocks } from "@/lib/LiveBlocksClient";
import prisma from "@/lib/prismaClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username } = await request.json();
  // console.log(username);
  try {
    const rooms = await liveblocks.getRooms();
    const userRooms = await prisma.room.findMany({
      where: {
        owner: username,
      },
    });

    if (userRooms.length > 0) {
      return NextResponse.json(
        { message: "User fetched successfully", data: userRooms },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
}
