import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const resolvedParams = await params;
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

    if (!resolvedParams.documentId) {
      return NextResponse.json(
        { message: "Document ID is required" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: {
        id: resolvedParams.documentId,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        permissions: {
          where: {
            userId: session.user.id,
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
      document.shared || // Anyone can access if document is publicly shared
      document.permissions.length > 0; // User has specific permission

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const resolvedParams = await params;
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

    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: {
        id: resolvedParams.documentId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    // Only author can update the document
    if (document.authorId !== session.user.id) {
      return NextResponse.json(
        {
          message:
            "Access denied - You don't have permission to update this document",
        },
        { status: 403 }
      );
    }

    const updatedDocument = await prisma.document.update({
      where: {
        id: resolvedParams.documentId,
      },
      data: {
        title,
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
