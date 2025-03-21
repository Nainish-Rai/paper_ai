import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prismaClient";
import type { User, Room } from "@prisma/client";

// Auth error class following Better Auth pattern
class AuthError extends Error {
  code: string;

  constructor(
    message: string,
    code: "UNAUTHENTICATED" | "UNAUTHORIZED" | "SERVER_ERROR"
  ) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

const COLORS = [
  "#D583F0",
  "#F08385",
  "#F0D885",
  "#85EED6",
  "#85BBF0",
  "#8594F0",
  "#85DBF0",
  "#87EE85",
];

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    // Get session token from request headers instead of cookies
    const sessionToken = request.headers.get("authorization")?.split(" ")[1];

    if (!sessionToken) {
      throw new AuthError("No session token found", "UNAUTHENTICATED");
    }

    // Get user from session with proper Prisma types
    const user = await prisma.user.findFirst({
      where: {
        sessions: {
          some: {
            token: sessionToken,
            expiresAt: {
              gt: new Date(),
            },
          },
        },
      },
      include: {
        rooms: true, // Include rooms the user has access to
      },
    });

    if (!user) {
      throw new AuthError("Invalid session", "UNAUTHORIZED");
    }

    // Get a consistent color for the user based on their ID
    const colorIndex = Number(user.id) % COLORS.length;
    const userColor = COLORS[colorIndex];

    // Create a session for the authenticated user
    const session = liveblocks.prepareSession(`user-${user.id}`, {
      userInfo: {
        name: user.name || user.email,
        email: user.email,
        color: userColor,
        picture: user.image,
      },
    });

    // Allow access to rooms the user is a member of
    user.rooms.forEach((room: Room) => {
      // Allow access to both room-level and document-level collaboration
      const roomPattern = `${room.id}:*`;
      session.allow(roomPattern, session.FULL_ACCESS);
    });

    // Authorize the user and return the result
    const { body, status } = await session.authorize();
    return new Response(body, { status });
  } catch (error) {
    console.error("LiveBlocks auth error:", error);

    if (error instanceof AuthError) {
      return new Response(error.message, {
        status: error.code === "UNAUTHENTICATED" ? 401 : 403,
      });
    }

    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
