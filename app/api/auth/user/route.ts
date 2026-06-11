import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import db from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "paper-ai-local-secret";

export async function GET(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get("paper_ai_auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify token
    const decoded = verify(token, JWT_SECRET) as { userId: string };

    // Get user data
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        image: true,
        // Exclude password and other sensitive fields
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
