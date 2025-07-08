// filepath: c:\Users\Nainish\Developement\paper_ai\app\api\documents\[documentId]\favorite\route.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";
import { NextResponse } from "next/server";

// POST handler to toggle the favorite status of a document
export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    // Authenticate the user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const documentId = (await params).documentId;

    // Find the document
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Ensure user owns the document or has proper permissions
    if (document.authorId !== session.user.id) {
      // Check if user has permission for this document
      const permission = await prisma.documentPermission.findUnique({
        where: {
          documentId_userId: {
            documentId,
            userId: session.user.id,
          },
        },
      });

      if (!permission) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    // Toggle the favorite status
    const updatedDocument = await prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        favorite: !document.favorite,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("[FAVORITE_DOCUMENT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
