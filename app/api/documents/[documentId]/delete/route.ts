import prisma from "@/lib/prismaClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: params.documentId },
      include: { room: true },
    });

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    // Only room owner or document author can delete the document
    if (
      document.room.ownerId !== session.user.id &&
      document.authorId !== session.user.id
    ) {
      return NextResponse.json(
        {
          message:
            "Unauthorized - Only room owner or document author can delete this document",
        },
        { status: 403 }
      );
    }

    await prisma.document.delete({
      where: { id: params.documentId },
    });

    return NextResponse.json(
      { message: "Document deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DOCUMENT_DELETE]", error);
    return NextResponse.json(
      {
        message: "Failed to delete document",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
