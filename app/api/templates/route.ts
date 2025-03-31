import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";
import { z } from "zod";

// Validation schema for template creation/update
const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  categories: z.array(z.string()),
  published: z.boolean().default(false),
});

// GET /api/templates
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const templates = await prisma.template.findMany({
      where: {
        OR: [{ published: true }, { authorId: session.user.id }],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("[GET_TEMPLATES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/templates
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const validatedData = templateSchema.parse(json);

    const template = await prisma.template.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[CREATE_TEMPLATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
