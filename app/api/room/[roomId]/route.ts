import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const headersList = headers();
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
      include: {
        documents: {
          orderBy: {
            updatedAt: "desc",
          },
        },
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

    return NextResponse.json(room);
  } catch (error) {
    console.error("[Room GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
