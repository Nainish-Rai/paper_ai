import { NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    // Get auth session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch document with room data
    const document = await prisma.document.findUnique({
      where: {
        id: params.documentId,
      },
      include: {
        room: {
          select: {
            id: true,
            ownerId: true,
            users: true,
          },
        },
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Check if user has access to the room
    const hasAccess =
      document.room.ownerId === session.user.id ||
      document.room.users.includes(session.user.id) ||
      document.authorId === session.user.id;

    if (!hasAccess) {
      return new NextResponse("Access denied", { status: 403 });
    }

    // Return document data
    return NextResponse.json({
      id: document.id,
      title: document.title,
      content: document.content,
      roomId: document.roomId,
      authorId: document.authorId,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  } catch (error) {
    console.error("[Document GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
