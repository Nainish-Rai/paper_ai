import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { roomId, title } = await request.json();

    if (!roomId || !title) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify room exists and user has access
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        ownerId: true,
        users: true,
      },
    });

    if (!room) {
      return new NextResponse("Room not found", { status: 404 });
    }

    // Check if user has access to create documents in this room
    if (
      room.ownerId !== session.user.id &&
      !room.users.includes(session.user.id)
    ) {
      return new NextResponse("Access denied", { status: 403 });
    }

    // Create the document
    const document = await prisma.document.create({
      data: {
        title: title.trim(),
        content: "",
        roomId: room.id,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("[Document Create]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
