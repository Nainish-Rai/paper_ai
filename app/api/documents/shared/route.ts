// filepath: c:\Users\Nainish\Developement\paper_ai\app\api\documents\shared\route.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all documents shared with the current user via document permissions
    // that the user did not create themselves
    const sharedDocuments = await prisma.document.findMany({
      where: {
        OR: [
          // Documents shared with the user through permissions
          {
            permissions: {
              some: {
                userId: session.user.id,
              },
            },
          },
          // Public documents that are shared but not created by the user
          {
            shared: true,
            NOT: {
              authorId: session.user.id,
            },
          },
        ],
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(sharedDocuments);
  } catch (error) {
    console.error("[SHARED_DOCUMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
