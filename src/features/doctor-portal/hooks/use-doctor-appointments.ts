"use client";
import { useCallback, useEffect, useState } from "react";
import { getDoctorAppointments, updateAppointmentStatus } from "@/features/doctor-portal/api/doctor-portal-client";
import type { AppointmentStatus, BookingConfirmation } from "@/types/booking";

type Status = "loading" | "ready" | "error";

export function useDoctorAppointments(doctorId: string | undefined) {
  const [appointments, setAppointments] = useState<BookingConfirmation[]>([]);
  const [status, setStatus] = useState<Status>("loading");

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

  const setStatusFor = useCallback(
    async (bookingId: string, next: AppointmentStatus) => {
      if (!doctorId) return;
      const updated = await updateAppointmentStatus(doctorId, bookingId, next);
      setAppointments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    },
    [doctorId],
  );

  return { appointments, status, reload, setStatusFor };
}
