"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { authClient } from "./client";
import type { User, AuthSession } from "./types";
import { isAuthSession } from "./types";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  getToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {},
  getToken: async () => {
    throw new Error("AuthContext not initialized");
  },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const session = await authClient.getSession();
      console.log("Session:", session);

      if (session && session.data) {
        setUser(session.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getToken = async () => {
    const session = await authClient.getSession();
    if (!session || !session?.data?.session) {
      throw new Error("No valid session");
    }
    return session.data.session.token;
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    signOut,
    refreshSession,
    getToken,
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
