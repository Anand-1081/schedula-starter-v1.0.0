"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { login as loginRequest } from "@/features/auth/api/auth-client";
import type { LoginCredentials, Session } from "@/features/auth/types";

const STORAGE_KEY = "schedula.session";

type SessionContextValue = {
  session: Session | null;
  status: "loading" | "signed-out" | "signed-in";
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function readStoredSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "signed-out" | "signed-in">("loading");

  useEffect(() => {
    const stored = readStoredSession();
    // Hydration effect: reading storage must happen after mount so the
    // server-rendered markup (which has no access to localStorage) matches
    // the client's first render before this runs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(stored);
    setStatus(stored ? "signed-in" : "signed-out");
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const next = await loginRequest(credentials);
    const store = credentials.remember ? window.localStorage : window.sessionStorage;
    store.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    setStatus("signed-in");
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setStatus("signed-out");
  }, []);

  return <SessionContext.Provider value={{ session, status, signIn, signOut }}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within a SessionProvider");
  return context;
}
