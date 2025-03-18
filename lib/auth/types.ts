export interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthSession {
  user: User;
  session: Session;
}

export interface BetterAuthResponse<T = any> {
  data: T;
  status: number;
  error?: string;
}

// Type guard for auth session
export function isAuthSession(data: any): data is AuthSession {
  return (
    data &&
    typeof data === "object" &&
    "user" in data &&
    "session" in data &&
    typeof data.user === "object" &&
    typeof data.session === "object"
  );
}
