import { verify } from "jsonwebtoken";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "paper-ai-local-secret";

export async function getUserFromRequest(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, JWT_SECRET) as { userId?: string };
    if (!decoded.userId) return null;

    return db.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });
  } catch {
    return null;
  }
}

export * from "./client";
export * from "./types";
export * from "./provider";
