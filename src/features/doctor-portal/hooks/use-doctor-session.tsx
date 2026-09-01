"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { loginDoctor } from "@/features/doctor-portal/api/doctor-portal-client";
import type { DoctorSession, PublicDoctorAccount } from "@/types/doctor-account";

const STORAGE_KEY = "schedula.doctor-session";

type DoctorSessionContextValue = {
  session: DoctorSession | null;
  status: "loading" | "signed-out" | "signed-in";
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateDoctor: (doctor: PublicDoctorAccount) => void;
};

const DoctorSessionContext = createContext<DoctorSessionContextValue | null>(null);

function readStoredSession(): DoctorSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DoctorSession;
  } catch {
    return null;
  }
}

export function DoctorSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DoctorSession | null>(null);
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
    const next = await loginDoctor(email, password);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    setStatus("signed-in");
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setStatus("signed-out");
  }, []);

  const updateDoctor = useCallback((doctor: PublicDoctorAccount) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, doctor };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <DoctorSessionContext.Provider value={{ session, status, signIn, signOut, updateDoctor }}>
      {children}
    </DoctorSessionContext.Provider>
  );
}

export function useDoctorSession(): DoctorSessionContextValue {
  const context = useContext(DoctorSessionContext);
  if (!context) throw new Error("useDoctorSession must be used within a DoctorSessionProvider");
  return context;
}
