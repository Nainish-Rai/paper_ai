import { NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // Get auth session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find recent documents the user has access to
    const recentDocuments = await prisma.document.findMany({
      where: {
        OR: [
          // Documents the user authored
          { authorId: session.user.id },
          // Documents in rooms the user has access to
          {
            room: {
              OR: [
                { ownerId: session.user.id },
                { users: { has: session.user.id } },
              ],
            },
          },
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5, // Limit to 5 most recent documents
      include: {
        room: {
          select: {
            id: true,
            name: true,
            users: true,
            ownerId: true,
          },
        },
      },
    });

    // Transform the data to include collaborative info
    const documentsWithCollaborators = recentDocuments.map((doc) => {
      // Count unique users with access (room owner + room users + document author)
      const uniqueUsers = new Set([
        doc.room.ownerId,
        ...doc.room.users,
        doc.authorId,
      ]);

      return {
        id: doc.id,
        title: doc.title,
        updatedAt: doc.updatedAt.toISOString(),
        collaborators: uniqueUsers.size,
        roomId: doc.roomId,
      };
    });

    return NextResponse.json(documentsWithCollaborators);
  } catch (error) {
    console.error("[Recent Documents GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
