import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import User from "@/lib/database/models/user.model";

connectToDatabase();

export async function POST(request: Request) {
  const { id } = await request.json();
  try {
    const user = await User.findOne({ clerkId: id });
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
