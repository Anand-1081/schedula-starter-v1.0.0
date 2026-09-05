"use client";
import { useEffect, useState } from "react";
import { getPrescription } from "@/features/prescriptions/api/prescriptions-client";
import type { Prescription } from "@/types/prescription";

type Status = "loading" | "ready" | "error" | "not-found";

export function usePrescription(bookingId: string | undefined, opts: { doctorId?: string; patientId?: string }) {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("loading");
    getPrescription(bookingId, opts)
      .then((data) => {
        if (cancelled) return;
        setPrescription(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus(error instanceof Error && error.message.includes("No prescription") ? "not-found" : "error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, opts.doctorId, opts.patientId]);

  return { prescription, status };
}
