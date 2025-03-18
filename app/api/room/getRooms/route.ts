import prisma from "@/lib/prismaClient";
import { NextResponse } from "next/server";
import type { AuthSession } from "@/lib/auth/types";

interface GetRoomsRequestBody {
  userId: string;
}

export async function POST(request: Request) {
  console.log("GET /api/room/getRooms - Request received");
  try {
    // Get request body
    const body = (await request.json()) as GetRoomsRequestBody;
    console.log("Request body:", body);

    if (!body.userId) {
      console.log("Missing userId in request body");
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Find rooms where user is either owner or member
    console.log("Querying database for rooms with userId:", body.userId);
    const rooms = await prisma.room.findMany({
      where: {
        OR: [{ ownerId: body.userId }, { users: { has: body.userId } }],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        documents: true, // Include documents
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log("Database query results:", {
      roomsFound: rooms.length,
      rooms: rooms.map((room) => ({
        id: room.id,
        name: room.name,
        ownerId: room.ownerId,
        userCount: room.users.length,
        documentCount: room.documents.length,
      })),
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Failed to fetch rooms:", {
      error,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
      stack: error instanceof Error ? error.stack : undefined,
    });
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { message: "Failed to fetch rooms", error: message },
      { status: 500 }
    );
  }
}
