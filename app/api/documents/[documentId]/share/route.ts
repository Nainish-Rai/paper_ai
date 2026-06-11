import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const documentId = (await params).documentId;

    const document = await db.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    if (document.authorId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedDocument = await db.document.update({
      where: {
        id: documentId,
      },
      data: {
        shared: true,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("[SHARE_DOCUMENT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
