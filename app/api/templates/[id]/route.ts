import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismaClient";
import { z } from "zod";

const templateUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required").optional(),
  categories: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

// GET /api/templates/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const template = await prisma.template.findUnique({
      where: { id: (await params).id },
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

    if (!template) {
      return new NextResponse("Template not found", { status: 404 });
    }

    // Check if user has access to the template
    if (!template.published && template.authorId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("[GET_TEMPLATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH /api/templates/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const template = await prisma.template.findUnique({
      where: { id: (await params).id },
    });

    if (!template) {
      return new NextResponse("Template not found", { status: 404 });
    }

    if (template.authorId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const json = await request.json();
    const validatedData = templateUpdateSchema.parse(json);

    const updatedTemplate = await prisma.template.update({
      where: { id: (await params).id },
      data: validatedData,
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[UPDATE_TEMPLATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/templates/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const template = await prisma.template.findUnique({
      where: { id: (await params).id },
    });

    if (!template) {
      return new NextResponse("Template not found", { status: 404 });
    }

    if (template.authorId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    await prisma.template.delete({
      where: { id: (await params).id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE_TEMPLATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
