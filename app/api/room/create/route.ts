import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prismaClient";
import { createRoomSchema, type RoomResponse } from "@/types/rooms";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Get session using better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validationResult = createRoomSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          error: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, id, owner, users, content } = validationResult.data;

    // Verify owner is the current user
    if (owner !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized - Can only create rooms for yourself" },
        { status: 403 }
      );
    }

    // Create room in LiveBlocks
    const liveblocks = await fetch("https://api.liveblocks.io/v2/rooms", {
      method: "POST",
      body: JSON.stringify({
        id,
        usersAccesses: {
          [owner]: ["room:write"],
          ...Object.fromEntries(users.map((user) => [user, ["room:write"]])),
        },
        defaultAccesses: ["room:write"],
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LIVEBLOCKS_SECRET}`,
      },
    });

    const liveblockResult = await liveblocks.json();
    if (liveblockResult.error) {
      return NextResponse.json(
        {
          message: "Failed to create LiveBlocks room",
          error: liveblockResult.error,
        },
        { status: 500 }
      );
    }

    // Create room in database
    const dbRoom = await prisma.room.create({
      data: {
        id,
        name,
        owner,
        ownerId: owner, // Set the ownerId for proper relation
        users: [owner],
        content: content || "",
      },
    });

    const response: RoomResponse = {
      message: "Room created successfully",
      data: liveblockResult,
      room: {
        id: dbRoom.id,
        name: dbRoom.name,
        owner: dbRoom.owner,
        users: dbRoom.users,
        content: dbRoom.content || undefined,
        createdAt: dbRoom.createdAt,
        updatedAt: dbRoom.updatedAt,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Room creation error:", error);
    return NextResponse.json(
      {
        message: "Failed to create room",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
