import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
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

    if (!params.documentId) {
      return NextResponse.json(
        { message: "Document ID is required" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    // Check if user has access to the document
    const hasAccess =
      document.authorId === session.user.id || // Author can always access
      document.shared; // Anyone can access if document is shared

    if (!hasAccess) {
      return NextResponse.json(
        {
          message:
            "Access denied - You don't have permission to view this document",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("[Document Get]", error);
    return NextResponse.json(
      {
        message: "Failed to retrieve document",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
