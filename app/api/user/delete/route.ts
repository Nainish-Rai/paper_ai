// delete user

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import User from "@/lib/database/models/user.model";

connectToDatabase();

export async function POST(request: Request) {
  const { id } = await request.json();
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json(
        { message: "User not found", data: user },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "User deleted successfully", data: user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
}
