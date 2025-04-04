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

    // Fetch all documents owned by the user
    const documents = await prisma.document.findMany({
      where: {
        authorId: session.user.id,
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
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("[All Documents Get]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
