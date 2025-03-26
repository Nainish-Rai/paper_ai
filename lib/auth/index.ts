import { prisma } from "@/lib/prismaClient";
import { NextRequest } from "next/server";

export async function getUserFromRequest(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      sessions: {
        some: {
          token: token,
          expiresAt: {
            gt: new Date(),
          },
        },
      },
    },
  });

  return user;
}

export * from "./client";
export * from "./types";
export * from "./provider";
