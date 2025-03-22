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
          // Shared documents
          { shared: true },
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5, // Limit to 5 most recent documents
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Transform the data to include basic document info
    const formattedDocuments = recentDocuments.map((doc) => ({
      id: doc.id,
      title: doc.title,
      updatedAt: doc.updatedAt.toISOString(),
      author: doc.author,
      shared: doc.shared,
    }));

    return NextResponse.json(formattedDocuments);
  } catch (error) {
    console.error("[Recent Documents GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
