"use client";
import { Session, User } from "lucia";
import { createContext, useContext } from "react";

interface SessionProviderProps {
  user: User | null;
  session: Session | null;
}

const SessionContext = createContext<SessionProviderProps>(
  {} as SessionProviderProps
);

export const SessionProvider = ({
  value,
  children,
}: {
  value: SessionProviderProps;
  children: React.ReactNode;
}) => {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  const sessionContext = useContext(SessionContext);

  if (!sessionContext) {
    throw new Error("useSession should be used within <SessionProvider>");
  }
  return sessionContext;
};
