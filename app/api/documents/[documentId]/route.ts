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

    // Fetch document with access check using proper relations
    const document = await prisma.document.findFirst({
      where: {
        id: params.documentId,
        room: {
          OR: [
            { ownerId: session.user.id },
            {
              users: {
                has: session.user.id,
              },
            },
          ],
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        roomId: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!document) {
      return new NextResponse("Document not found or access denied", {
        status: 403,
      });
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
