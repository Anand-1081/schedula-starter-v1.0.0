"use client";
import { useCallback, useEffect, useState } from "react";
import {
  getDoctorPrescriptions,
  saveDoctorPrescription,
  type DoctorPrescriptionEntry,
} from "@/features/prescriptions/api/prescriptions-client";
import type { PrescriptionInput } from "@/types/prescription";

type Status = "loading" | "ready" | "error";

export function useDoctorPrescriptions(doctorId: string | undefined) {
  const [entries, setEntries] = useState<DoctorPrescriptionEntry[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [mutationError, setMutationError] = useState<string>();

  const reload = useCallback(() => {
    if (!doctorId) return;
    setStatus("loading");
    getDoctorPrescriptions(doctorId)
      .then((data) => {
        setEntries(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [doctorId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  const save = useCallback(
    async (bookingId: string, input: PrescriptionInput) => {
      if (!doctorId) return;
      setMutationError(undefined);
      try {
        const record = await saveDoctorPrescription(doctorId, bookingId, input);
        setEntries((prev) =>
          prev.map((entry) => (entry.booking.id === bookingId ? { ...entry, prescription: record } : entry)),
        );
        return record;
      } catch (error) {
        setMutationError(error instanceof Error ? error.message : "Unable to save the prescription.");
        throw error;
      }
    },
    [doctorId],
  );

  return { entries, status, reload, save, mutationError };
}
