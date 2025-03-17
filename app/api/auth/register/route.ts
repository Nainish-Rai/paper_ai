import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";
import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, username } = await req.json();

    // Validate input
    if (!email || !password || !name || !username) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, SALT_ROUNDS);

    // Create new user
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        email,
        name,
        username,
        password: hashedPassword,
        image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          name
        )}`, // Default avatar
      },
    });

    // Generate JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Create response
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.image,
        },
      },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set({
      name: "paper_ai_auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
