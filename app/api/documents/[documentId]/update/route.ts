import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";

export async function PATCH(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content } = await request.json();

    if (content === undefined) {
      return new NextResponse("Missing content", { status: 400 });
    }

    // Find document and verify access in one query
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
    });

    if (!document) {
      return new NextResponse("Document not found or access denied", {
        status: 403,
      });
    }

    // Update the document if access is verified
    const updatedDocument = await prisma.document.update({
      where: { id: params.documentId },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("[Document Update]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
