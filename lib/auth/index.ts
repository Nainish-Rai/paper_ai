import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { compare } from "bcryptjs";
import prisma from "@/lib/prismaClient";

interface Credentials {
  email: string;
  password: string;
}

export const auth = betterAuth({
  providers: {
    credentials: {
      type: "credentials",
      credentials: {
        email: { type: "email", required: true },
        password: { type: "password", required: true },
      },
      authorize: async (credentials: Credentials) => {
        const { email, password } = credentials;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const valid = await compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    },
  },
  cookies: {
    prefix: "paper_ai",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  database: {
    prisma,
    modelName: "Session",
  },
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
export type AuthSession = typeof auth.$Infer.Session;
