import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";

// PATCH /api/documents/[documentId]/collaborators/[userId]
// Updates a collaborator's role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { documentId: string; userId: string } }
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

    // Find the document
    const document = await prisma.document.findUnique({
      where: { id: params.documentId },
    });

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    // Only the document owner can change permissions
    if (document.authorId !== session.user.id) {
      return NextResponse.json(
        { message: "Only the document owner can change permissions" },
        { status: 403 }
      );
    }

    // Cannot change owner's role
    if (params.userId === document.authorId) {
      return NextResponse.json(
        { message: "Cannot change the document owner's role" },
        { status: 400 }
      );
    }

    const { role } = await request.json();

    // Validate the role
    if (!["viewer", "editor"].includes(role)) {
      return NextResponse.json(
        { message: "Invalid role. Must be 'viewer' or 'editor'" },
        { status: 400 }
      );
    }

    // Update or create the permission
    const permission = await prisma.documentPermission.upsert({
      where: {
        documentId_userId: {
          documentId: params.documentId,
          userId: params.userId,
        },
      },
      update: {
        role,
      },
      create: {
        documentId: params.documentId,
        userId: params.userId,
        role,
      },
    });

    return NextResponse.json(permission);
  } catch (error) {
    console.error("[UPDATE_COLLABORATOR]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[documentId]/collaborators/[userId]
// Removes a collaborator from the document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string; userId: string } }
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

    // Find the document
    const document = await prisma.document.findUnique({
      where: { id: params.documentId },
    });

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    // Only the document owner can remove collaborators
    if (document.authorId !== session.user.id) {
      return NextResponse.json(
        { message: "Only the document owner can remove collaborators" },
        { status: 403 }
      );
    }

    // Cannot remove the document owner
    if (params.userId === document.authorId) {
      return NextResponse.json(
        { message: "Cannot remove the document owner" },
        { status: 400 }
      );
    }

    // Remove the permission
    await prisma.documentPermission.deleteMany({
      where: {
        documentId: params.documentId,
        userId: params.userId,
      },
    });

    return NextResponse.json({ message: "Collaborator removed successfully" });
  } catch (error) {
    console.error("[REMOVE_COLLABORATOR]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
