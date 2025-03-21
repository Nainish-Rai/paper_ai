import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const document = await prisma.document.findUnique({
      where: {
        id: params.documentId,
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

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Verify user has access to the room
    const room = await prisma.room.findFirst({
      where: {
        id: document.roomId,
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
      return new NextResponse("Access denied", { status: 403 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("[Document Get]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
