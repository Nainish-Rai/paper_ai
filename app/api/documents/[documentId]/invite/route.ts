import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";

// POST /api/documents/[documentId]/invite
export async function POST(
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

    // Find the document
    const document = await prisma.document.findUnique({
      where: { id: (await params).documentId },
    });

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    // Only the document owner can invite collaborators
    if (document.authorId !== session.user.id) {
      return NextResponse.json(
        { message: "Only the document owner can invite collaborators" },
        { status: 403 }
      );
    }

    // Parse the request body to get email and role
    const { email, role, userId } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { message: "Email and role are required" },
        { status: 400 }
      );
    }

    // Validate the role
    if (!["viewer", "editor"].includes(role)) {
      return NextResponse.json(
        { message: "Invalid role. Must be 'viewer' or 'editor'" },
        { status: 400 }
      );
    }

    // REMOVED: We no longer automatically set shared:true when inviting users
    // This way, only explicit link sharing will make the document public

    // First check if user exists with provided userId or email
    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { email },
      });
    }

    // If the user doesn't exist, this is where you might send an invite email
    // For now, we'll just create a placeholder user
    if (!user) {
      // In a real app, you'd send an email invitation here
      // For this implementation, we'll just return a message
      return NextResponse.json({
        message: "Invitation sent. User will be added when they register.",
        pendingInvite: true,
      });
    }

    // If trying to add the owner as a collaborator
    if (user.id === document.authorId) {
      return NextResponse.json(
        { message: "User is already the owner of this document" },
        { status: 400 }
      );
    }

    // Check if permission already exists
    const existingPermission = await prisma.documentPermission.findUnique({
      where: {
        documentId_userId: {
          documentId: (await params).documentId,
          userId: user.id,
        },
      },
    });

    if (existingPermission) {
      // Update existing permission
      const updatedPermission = await prisma.documentPermission.update({
        where: {
          id: existingPermission.id,
        },
        data: { role },
      });

      return NextResponse.json({
        message: "Collaborator role updated successfully",
        permission: updatedPermission,
      });
    }

    // Create new permission
    const permission = await prisma.documentPermission.create({
      data: {
        documentId: (await params).documentId,
        userId: user.id,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // In a real application, you would also send an email notification here

    return NextResponse.json({
      message: "Collaborator added successfully",
      collaborator: {
        id: permission.user.id,
        name: permission.user.name || "Unknown",
        email: permission.user.email,
        avatarUrl: permission.user.image,
        role: permission.role,
      },
    });
  } catch (error) {
    console.error("[INVITE_COLLABORATOR]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
