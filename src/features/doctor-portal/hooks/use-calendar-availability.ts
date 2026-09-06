"use client";
import { useEffect, useState } from "react";
import { getAvailability } from "@/features/booking/api/booking-client";
import { toIsoDate } from "@/lib/utils/date";
import type { Slot } from "@/types/booking";

/**
 * Fetches the doctor's working-hours availability (derived from their
 * availability rules, minus anything already booked) for every date in
 * `dates`. Keyed by ISO date so the calendar grid can look up each day's
 * slot list in O(1).
 */
export function useCalendarAvailability(doctorId: string | undefined, dates: Date[]) {
  const [byDate, setByDate] = useState<Record<string, Slot[]>>({});
  const [loading, setLoading] = useState(true);

  const key = dates.map((date) => toIsoDate(date)).join(",");

  useEffect(() => {
    if (!doctorId || dates.length === 0) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all(dates.map((date) => getAvailability(doctorId, toIsoDate(date))))
      .then((results) => {
        if (cancelled) return;
        const next: Record<string, Slot[]> = {};
        results.forEach((result) => {
          next[result.date] = result.slots;
        });
        setByDate(next);
      })
      .catch(() => !cancelled && setByDate({}))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // `key` mirrors the dates array's content so we only refetch when the
    // actual date range changes, not on every render's new array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, key]);

  return { byDate, loading };
}
