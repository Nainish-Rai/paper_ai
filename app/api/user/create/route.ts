// create user in mongodb
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import User from "@/lib/database/models/user.model";

connectToDatabase();

export async function POST(request: Request) {
  const { name, email, password, clerkId, image } = await request.json();
  try {
    // check if user already exist
    const user = await User.findOne({ email });
    if (user) {
      return NextResponse.json(
        { message: "User already exist", data: user },
        { status: 200 }
      );
    }
    const newUser = new User({
      name,
      email,
      password,
      clerkId,
      image,
    });

    await newUser.save();
    return NextResponse.json(
      { message: "User created successfully", data: newUser },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
}
