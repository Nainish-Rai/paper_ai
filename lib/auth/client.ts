import { createAuthClient } from "better-auth/react";
import type { AuthSession, BetterAuthResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

declare module "better-auth/react" {
  interface BetterAuthClient {
    getSession(): Promise<BetterAuthResponse<AuthSession>>;
    signOut(): Promise<void>;
    getToken(): Promise<string>;
  }
}

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  endpoints: {
    signUp: "/api/auth/register",
    signIn: "/api/auth/login",
    signOut: "/api/auth/logout",
    getSession: "/api/auth/user",
  },
  storage: {
    persistent: true,
    prefix: "paper_ai",
  },
  options: {
    cookieOptions: {
      name: "session_token",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  },
});

export type AuthClient = typeof authClient;
