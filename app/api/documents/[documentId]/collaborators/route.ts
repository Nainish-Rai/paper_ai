import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";

// GET /api/documents/[documentId]/collaborators
export async function GET(
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
      include: { author: true },
    });

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    // Check if user has access to the document
    const hasAccess =
      document.authorId === session.user.id || // Is owner
      document.shared; // Is shared publicly

    if (!hasAccess) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Get all permissions for this document
    const permissions = await prisma.documentPermission.findMany({
      where: {
        documentId: (await params).documentId,
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

    // Add the document owner as the first collaborator with owner role
    const collaborators = [
      {
        id: document.authorId,
        name: document.author.name || "Unknown",
        email: document.author.email,
        avatarUrl: document.author.image,
        initials: getInitials(document.author.name || "User"),
        role: "owner",
      },
      ...permissions.map((permission) => ({
        id: permission.user.id,
        name: permission.user.name || "Unknown",
        email: permission.user.email,
        avatarUrl: permission.user.image,
        initials: getInitials(permission.user.name || "User"),
        role: permission.role,
      })),
    ];

    return NextResponse.json(collaborators);
  } catch (error) {
    console.error("[GET_COLLABORATORS]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to generate initials
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
