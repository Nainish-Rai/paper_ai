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

    // Find room and verify access in one query
    const room = await prisma.room.findFirst({
      where: {
        id: params.roomId,
        OR: [
          { ownerId: session.user.id },
          {
            users: {
              has: session.user.id,
            },
          },
        ],
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
      return new NextResponse("Room not found or access denied", {
        status: 403,
      });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("[Room GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
