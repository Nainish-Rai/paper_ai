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

    // Verify room exists and user has access using proper relation check
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        OR: [
          { ownerId: session.user.id },
          {
            users: {
              has: session.user.id,
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!room) {
      return new NextResponse("Room not found or access denied", {
        status: 403,
      });
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
