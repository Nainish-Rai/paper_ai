import { createAuthClient } from "better-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
});

export type AuthClient = typeof authClient;
