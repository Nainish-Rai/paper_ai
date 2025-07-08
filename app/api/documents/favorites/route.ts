// filepath: c:\Users\Nainish\Developement\paper_ai\app\api\documents\favorites\route.ts
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

    // Get all favorite documents for the current user
    const favoriteDocuments = await prisma.document.findMany({
      where: {
        authorId: session.user.id,
        favorite: true,
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

    return NextResponse.json(favoriteDocuments);
  } catch (error) {
    console.error("[FAVORITE_DOCUMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
