import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, shared = false, content } = await request.json();

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Validate that content is properly formatted JSON
    let parsedContent;
    try {
      if (content) {
        parsedContent = JSON.parse(content);
        if (!Array.isArray(parsedContent)) {
          throw new Error("Content must be an array of blocks");
        }
      }
    } catch (error) {
      console.error("Content parsing error:", error);
      return new NextResponse("Invalid content format", { status: 400 });
    }

    // Create the document with initial content
    const document = await prisma.document.create({
      data: {
        title: title.trim(),
        content: content || "[]", // Store the stringified content
        authorId: session.user.id,
        shared,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("[Document Create]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
