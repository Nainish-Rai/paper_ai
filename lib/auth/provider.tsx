"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { auth } from "./index";

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  getToken: () => Promise<string>;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  getToken: async () => "",
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/user");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    getToken: async () => {
      const response = await fetch("/api/auth/token");
      if (!response.ok) throw new Error("Failed to get token");
      const data = await response.json();
      return data.token;
    },
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
