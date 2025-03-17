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

    if (content === undefined) {
      return new NextResponse("Missing content", { status: 400 });
    }

    // Fetch the document and verify access
    const document = await prisma.document.findUnique({
      where: { id: params.documentId },
      include: {
        room: {
          select: {
            ownerId: true,
            users: true,
          },
        },
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Check if user has access to edit this document
    if (
      document.room.ownerId !== session.user.id &&
      !document.room.users.includes(session.user.id)
    ) {
      return new NextResponse("Access denied", { status: 403 });
    }

    // Update the document
    const updatedDocument = await prisma.document.update({
      where: { id: params.documentId },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("[Document Update]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
