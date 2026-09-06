"use client";
import { useCallback, useEffect, useState } from "react";
import { getMyAppointments, submitReview } from "@/features/user-appointments/api/user-appointments-client";
import type { BookingConfirmation } from "@/types/booking";

type Status = "loading" | "ready" | "error";

export function useMyAppointments(userId: string | undefined) {
  const [appointments, setAppointments] = useState<BookingConfirmation[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [mutationError, setMutationError] = useState<string>();

  const reload = useCallback(() => {
    if (!userId) return;
    setStatus("loading");
    getMyAppointments(userId)
      .then((data) => {
        setAppointments(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  const review = useCallback(
    async (bookingId: string, rating: number, comment: string) => {
      if (!userId) return;
      setMutationError(undefined);
      try {
        const updated = await submitReview(bookingId, userId, rating, comment);
        setAppointments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } catch (error) {
        setMutationError(error instanceof Error ? error.message : "Unable to submit review.");
        throw error;
      }
    },
    [userId],
  );

  return { appointments, status, reload, review, mutationError };
}
