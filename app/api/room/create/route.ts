import { NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";

export async function POST(request: Request) {
  const body = await request.json();
  // console.log(body);

  try {
    const room = await fetch("https://api.liveblocks.io/v2/rooms", {
      method: "POST",
      body: JSON.stringify({
        id: body.id,
        usersAccesses: {
          [body.owner]: ["room:write"],
        },
        defaultAccesses: ["room:write"],
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LIVEBLOCKS_SECRET}`,
      },
    });
    const result = await room.json();
    if (result.error) {
      return NextResponse.json(
        { message: "Something went wrong result not found" },
        { status: 500 }
      );
    }

    const res = await prisma.room.create({
      data: {
        name: body.name,
        owner: body.owner,
        users: body.users,
        content: body.content,
        id: body.id,
      },
    });
    console.log(res);

    if (!res || !result) {
      return NextResponse.json(
        { message: "Something went wrong res not found" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Room created successfully",
        data: result,
        room: res,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong end me", error },
      { status: 500 }
    );
  }
}
