import { verify } from "jsonwebtoken";
import db from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "paper-ai-local-secret";
const AUTH_COOKIE = "paper_ai_auth_token";

type SessionInput = {
  headers: Headers | HeadersInit;
};

type JwtPayload = {
  userId: string;
  email?: string;
};

function readCookie(headers: Headers | HeadersInit, name: string) {
  const headerBag = headers instanceof Headers ? headers : new Headers(headers);
  const cookieHeader = headerBag.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export const auth = {
  api: {
    async getSession(input: SessionInput) {
      const token = readCookie(input.headers, AUTH_COOKIE);
      if (!token) return null;

      try {
        const decoded = verify(token, JWT_SECRET) as JwtPayload;
        const user = await db.user.findUnique({
          where: {
            id: decoded.userId,
          },
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            image: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) return null;

        return {
          user,
          session: {
            id: token,
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };
      } catch {
        return null;
      }
    },
  },
};
