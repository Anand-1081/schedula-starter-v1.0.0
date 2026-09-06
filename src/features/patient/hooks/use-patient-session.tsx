"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { loginPatient } from "@/features/patient/api/patient-client";
import type { PatientSession } from "@/types/patient-account";

const STORAGE_KEY = "schedula.patient-session";

type PatientSessionContextValue = {
  session: PatientSession | null;
  status: "loading" | "signed-out" | "signed-in";
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const PatientSessionContext = createContext<PatientSessionContextValue | null>(null);

function readStoredSession(): PatientSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PatientSession;
  } catch {
    return null;
  }
}

export function PatientSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PatientSession | null>(null);
  const [status, setStatus] = useState<"loading" | "signed-out" | "signed-in">("loading");

  useEffect(() => {
    const stored = readStoredSession();
    // Hydration effect: storage is only readable after mount, so the server
    // render (no session) and the client's first render must match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(stored);
    setStatus(stored ? "signed-in" : "signed-out");
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const next = await loginPatient(email, password);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    setStatus("signed-in");
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setStatus("signed-out");
  }, []);

  return (
    <PatientSessionContext.Provider value={{ session, status, signIn, signOut }}>
      {children}
    </PatientSessionContext.Provider>
  );
}

export function usePatientSession(): PatientSessionContextValue {
  const context = useContext(PatientSessionContext);
  if (!context) throw new Error("usePatientSession must be used within a PatientSessionProvider");
  return context;
}
