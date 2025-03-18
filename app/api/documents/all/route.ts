import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch all documents that are either:
    // 1. Personal documents owned by the user (no room)
    // 2. Room documents where user has access
    const documents = await prisma.document.findMany({
      where: {
        OR: [
          // Personal documents
          {
            authorId: session.user.id,
            roomId: null,
          },
          // Room documents where user has access
          {
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
        ],
      },
      orderBy: [
        {
          updatedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("[All Documents Get]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
