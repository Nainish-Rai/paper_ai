import { createAuthClient } from "better-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  endpoints: {
    signUp: "/api/auth/register",
    signIn: "/api/auth/login",
    signOut: "/api/auth/logout",
    getSession: "/api/auth/user",
  },
});

export type AuthClient = typeof authClient;
