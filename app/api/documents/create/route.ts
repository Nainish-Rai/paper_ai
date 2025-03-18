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

    const { roomId, title, shared = false } = await request.json();

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // If roomId is provided, verify room access
    if (roomId) {
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
      });

      if (!room) {
        return new NextResponse("Room not found or access denied", {
          status: 403,
        });
      }
    }

    // Create the document
    const document = await prisma.document.create({
      data: {
        title: title.trim(),
        content: "",
        authorId: session.user.id,
        shared,
        ...(roomId ? { roomId } : {}),
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        room: {
          select: {
            name: true,
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
