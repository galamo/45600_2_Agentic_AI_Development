import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { apiLogin, apiLogout, apiRefresh, apiSignup, PublicUser } from "../api/authClient";

export interface AuthEvent {
  message: string;
  at: string;
}

interface AuthContextValue {
  accessToken: string | null;
  user: PublicUser | null;
  events: AuthEvent[];
  sessionExpired: boolean;
  clearSessionExpired: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [events, setEvents] = useState<AuthEvent[]>([]);
  const [sessionExpired, setSessionExpired] = useState(false);

  const pushEvent = useCallback((message: string) => {
    setEvents((prev) => [{ message, at: new Date().toLocaleTimeString() }, ...prev].slice(0, 30));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiLogin(email, password);
      setAccessToken(result.accessToken);
      setUser(result.user);
      setSessionExpired(false);
      pushEvent(`Login successful for ${result.user.email}. Access token issued.`);
    },
    [pushEvent]
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      await apiSignup(email, password);
      pushEvent(`Account created for ${email}. Please log in.`);
    },
    [pushEvent]
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setAccessToken(null);
    setUser(null);
    pushEvent("Logged out. Refresh token revoked on the server.");
  }, [pushEvent]);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    try {
      pushEvent("Access token expired or missing — attempting silent refresh...");
      const result = await apiRefresh();
      setAccessToken(result.accessToken);
      setUser(result.user);
      pushEvent("Refresh succeeded. New access token issued.");
      return result.accessToken;
    } catch {
      setAccessToken(null);
      setUser(null);
      setSessionExpired(true);
      pushEvent("Refresh failed. Session expired — please log in again.");
      return null;
    }
  }, [pushEvent]);

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  return (
    <AuthContext.Provider
      value={{ accessToken, user, events, sessionExpired, clearSessionExpired, login, signup, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
