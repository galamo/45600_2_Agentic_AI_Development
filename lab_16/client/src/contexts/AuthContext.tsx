import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { User } from "../interfaces";
import { useAudit } from "./AuditContext";

interface AuthContextValue {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const DEMO_USERS: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    password: "",
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { logAction } = useAudit();

  const login = useCallback(
    (user: User) => {
      setCurrentUser(user);
      logAction(user.id, user.name, "login");
    },
    [logAction],
  );

  const logout = useCallback(() => {
    if (!currentUser) return;
    logAction(currentUser.id, currentUser.name, "logout");
    setCurrentUser(null);
  }, [currentUser, logAction]);

  const value = useMemo(
    () => ({ currentUser, login, logout }),
    [currentUser, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
