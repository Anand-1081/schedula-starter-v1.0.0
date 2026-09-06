"use client";
import { useCallback, useEffect, useState } from "react";
import {
  getDoctorAppointments,
  updateAppointment,
  type AppointmentActionPayload,
} from "@/features/doctor-portal/api/doctor-portal-client";
import type { BookingConfirmation } from "@/types/booking";

type Status = "loading" | "ready" | "error";

export function useDoctorAppointments(doctorId: string | undefined) {
  const [appointments, setAppointments] = useState<BookingConfirmation[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [mutationError, setMutationError] = useState<string>();

  const reload = useCallback(() => {
    if (!doctorId) return;
    setStatus("loading");
    getDoctorAppointments(doctorId)
      .then((data) => {
        setAppointments(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [doctorId]);

  useEffect(() => {
    // reload() resets to loading and fetches; effect re-runs whenever the
    // reload callback's dependencies (doctorId) change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  const runAction = useCallback(
    async (bookingId: string, payload: AppointmentActionPayload) => {
      if (!doctorId) return;
      setMutationError(undefined);
      try {
        const updated = await updateAppointment(doctorId, bookingId, payload);
        setAppointments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        return updated;
      } catch (error) {
        setMutationError(error instanceof Error ? error.message : "Unable to update this appointment.");
        throw error;
      }
    },
    [doctorId],
  );

  return { appointments, status, reload, runAction, mutationError };
}
