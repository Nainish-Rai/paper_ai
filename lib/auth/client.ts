"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthSession } from "./types";

type AuthResult<T = unknown> = {
  data: T | null;
  error: { message?: string } | null;
};

type EmailAuthInput = {
  email: string;
  password: string;
  name?: string;
  callbackURL?: string;
};

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function emailAuth<T>(
  endpoint: "/api/auth/register" | "/api/auth/login",
  input: EmailAuthInput
): Promise<AuthResult<T>> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const body = await readJson(response);

  if (!response.ok) {
    return {
      data: null,
      error: {
        message:
          typeof body === "object" && body && "error" in body
            ? String(body.error)
            : "Authentication failed",
      },
    };
  }

  return {
    data: body as T,
    error: null,
  };
}

async function getSession(): Promise<AuthResult<AuthSession>> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
    cache: "no-store",
  });
  const body = await readJson(response);

  if (!response.ok) {
    return {
      data: null,
      error: {
        message:
          typeof body === "object" && body && "error" in body
            ? String(body.error)
            : "Not authenticated",
      },
    };
  }

  return {
    data: {
      user: body.user,
      session: {
        id: "local-cookie-session",
        userId: body.user.id,
        token: "local-cookie-session",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    error: null,
  };
}

function useSession() {
  const [data, setData] = useState<AuthSession | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(true);

  const refetch = useCallback(() => {
    setIsPending(true);
    getSession()
      .then((session) => {
        setData(session.data);
        setError(session.error ? new Error(session.error.message) : null);
      })
      .finally(() => setIsPending(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, isPending, refetch };
}

async function signOut(options?: {
  fetchOptions?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  };
}) {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    options?.fetchOptions?.onSuccess?.();
  } catch (error) {
    options?.fetchOptions?.onError?.(error);
    throw error;
  }
}

export const authClient = {
  getSession,
  useSession,
  signOut,
  signUp: {
    email: (input: EmailAuthInput) =>
      emailAuth<{ user: AuthSession["user"] }>("/api/auth/register", input),
  },
  signIn: {
    email: (input: EmailAuthInput) =>
      emailAuth<{ user: AuthSession["user"] }>("/api/auth/login", input),
    social: async (_input?: unknown) => ({
      data: null,
      error: {
        message: "Social sign-in is not configured for local MongoDB mode.",
      },
    }),
  },
};

export type AuthClient = typeof authClient;
