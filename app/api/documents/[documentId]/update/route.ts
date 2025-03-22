import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    // Find document
    const document = await prisma.document.findUnique({
      where: {
        id: (await params).documentId,
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Check if user is the author or if document is shared
    const hasAccess =
      document.authorId === session.user.id || // Author can always access
      document.shared; // Anyone can access if document is shared

    if (!hasAccess) {
      return new NextResponse("Access denied", { status: 403 });
    }

    // Update document
    const updatedDocument = await prisma.document.update({
      where: {
        id: (await params).documentId,
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
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("[Document Update]", error);
    return NextResponse.json(
      {
        message: "Failed to update document",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
