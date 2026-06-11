import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

// POST /api/documents/[documentId]/unshare
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
    const document = await db.document.findUnique({
      where: { id: (await params).documentId },
    });

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    // Only the document owner can disable sharing
    if (document.authorId !== session.user.id) {
      return NextResponse.json(
        { message: "Only the document owner can change sharing settings" },
        { status: 403 }
      );
    }

    // Check if there are any collaborators
    const collaborators = await db.documentPermission.findMany({
      where: { documentId: (await params).documentId },
    });

    // If there are collaborators, we should warn the user but still allow unsharing
    const hasCollaborators = collaborators.length > 0;

    // Update the document to disable sharing
    const updatedDocument = await db.document.update({
      where: { id: (await params).documentId },
      data: { shared: false },
    });

    return NextResponse.json({
      message: "Document is now private",
      hasCollaborators,
      document: updatedDocument,
    });
  } catch (error) {
    console.error("[UNSHARE_DOCUMENT]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
