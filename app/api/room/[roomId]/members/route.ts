import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email } = await request.json();

    // Get the room
    const room = await prisma.room.findUnique({
      where: {
        id: params.roomId,
      },
    });

    if (!room) {
      return new NextResponse("Room not found", { status: 404 });
    }

    // Check if user is room owner
    if (room.ownerId !== session.user.id) {
      return new NextResponse("Only room owner can add members", {
        status: 403,
      });
    }

    // Find user by email
    const userToAdd = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!userToAdd) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user is already a member
    if (room.users.includes(userToAdd.id)) {
      return new NextResponse("User is already a member", { status: 400 });
    }

    // Add user to room
    const updatedRoom = await prisma.room.update({
      where: {
        id: params.roomId,
      },
      data: {
        users: {
          push: userToAdd.id,
        },
      },
      include: {
        documents: true,
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("[ROOM MEMBERS POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Get room members
export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const room = await prisma.room.findUnique({
      where: {
        id: params.roomId,
      },
    });

    if (!room) {
      return new NextResponse("Room not found", { status: 404 });
    }

    // Check if user has access to the room
    if (
      room.ownerId !== session.user.id &&
      !room.users.includes(session.user.id)
    ) {
      return new NextResponse("Access denied", { status: 403 });
    }

    // Get all members including owner
    const members = await prisma.user.findMany({
      where: {
        OR: [{ id: room.ownerId }, { id: { in: room.users } }],
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("[ROOM MEMBERS GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
