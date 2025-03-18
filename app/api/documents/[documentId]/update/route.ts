import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";

export async function PATCH(
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

    const { content } = await request.json();

    // Find document with relations
    const document = await prisma.document.findUnique({
      where: {
        id: params.documentId,
      },
      include: {
        room: true,
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Check access rights
    const hasAccess =
      document.authorId === session.user.id || // Author can always access
      (document.room && // If it's a room document, check room access
        (document.room.ownerId === session.user.id ||
          document.room.users.includes(session.user.id)));

    if (!hasAccess) {
      return new NextResponse("Access denied", { status: 403 });
    }

    // Update document
    const updatedDocument = await prisma.document.update({
      where: {
        id: params.documentId,
      },
      data: {
        content,
        updatedAt: new Date(),
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

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("[Document Update]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
