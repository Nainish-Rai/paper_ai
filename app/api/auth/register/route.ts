import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";
import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, SALT_ROUNDS);

    // Create new user with email as base for generated fields
    const emailName = email.split("@")[0];
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        email,
        name: emailName, // Use part before @ as name
        username: `${emailName}_${randomUUID().slice(0, 8)}`, // Generate unique username
        password: hashedPassword,
        image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          email
        )}`,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
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
