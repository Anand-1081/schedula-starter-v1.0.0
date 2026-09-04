"use client";
import { useMemo, useState } from "react";
import { MyAppointmentRow } from "@/features/user-appointments/components/my-appointment-row";
import { isPastMoment } from "@/lib/utils/date";
import type { BookingConfirmation } from "@/types/booking";

type Tab = "upcoming" | "completed" | "cancelled" | "missed";
const TABS: Tab[] = ["upcoming", "completed", "cancelled", "missed"];

function matches(item: BookingConfirmation, tab: Tab): boolean {
  if (tab === "upcoming") {
    return (item.status === "pending" || item.status === "confirmed") && !isPastMoment(item.date, item.time);
  }
  return item.status === tab;
}

export function MyAppointmentsList({
  appointments,
  status,
  onReview,
  mutationError,
}: {
  appointments: BookingConfirmation[];
  status: "loading" | "ready" | "error";
  onReview: (bookingId: string, rating: number, comment: string) => Promise<unknown>;
  mutationError?: string;
}) {
  const [tab, setTab] = useState<Tab>("upcoming");

  const counts = useMemo(() => {
    const base = Object.fromEntries(TABS.map((item) => [item, 0])) as Record<Tab, number>;
    for (const item of appointments) {
      for (const tabKey of TABS) if (matches(item, tabKey)) base[tabKey] += 1;
    }
    return base;
  }, [appointments]);

  const visible = appointments.filter((item) => matches(item, tab));

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
      {mutationError && (
        <div role="alert" className="border-b border-[var(--line)] bg-red-50 px-5 py-3 text-sm text-red-800">
          {mutationError}
        </div>
      )}
      <div className="flex flex-wrap gap-1 border-b border-[var(--line)] p-3">
        <div className="flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Filter my appointments">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                tab === item ? "bg-white font-medium shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {item} <span className="ml-1 text-xs">{counts[item]}</span>
            </button>
          ))}
        </div>
      </div>

      {status === "loading" && (
        <div className="space-y-4 p-5" aria-busy="true" aria-label="Loading your appointments">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-16 animate-pulse rounded-lg bg-stone-100" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="p-8 text-center" role="alert">
          <p className="font-medium">We couldn&apos;t load your appointments.</p>
        </div>
      )}

      {status === "ready" && visible.length > 0 && (
        <ul className="divide-y divide-[var(--line)]" role="list">
          {visible.map((appointment) => (
            <MyAppointmentRow key={appointment.id} appointment={appointment} onReview={onReview} />
          ))}
        </ul>
      )}

      {status === "ready" && visible.length === 0 && (
        <div className="p-10 text-center">
          <p className="font-medium">No {tab} appointments.</p>
        </div>
      )}
    </div>
  );
}
