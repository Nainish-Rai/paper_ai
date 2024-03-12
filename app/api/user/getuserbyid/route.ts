import { prisma } from "@/lib/lucia/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { id } = await request.json();
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    return NextResponse.json(
      { message: "User fetched successfully", data: user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
}
