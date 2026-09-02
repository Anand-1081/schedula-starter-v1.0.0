"use client";
import { useMemo, useState } from "react";
import { AppointmentRow } from "@/features/doctor-portal/components/appointment-row";
import { AlertIcon } from "@/components/ui/icons";
import type { BookingConfirmation } from "@/types/booking";
import type { AppointmentFilter } from "@/features/doctor-portal/types";

type Props = {
  appointments: BookingConfirmation[];
  status: "loading" | "ready" | "error";
  onConfirm?: (id: string) => void;
  showFilter?: boolean;
  emptyMessage?: string;
  mutationError?: string;
};

export function AppointmentList({ appointments, status, onConfirm, showFilter = false, emptyMessage, mutationError }: Props) {
  const [filter, setFilter] = useState<AppointmentFilter>("all");

  const visible = useMemo(
    () => (filter === "all" ? appointments : appointments.filter((item) => item.status === filter)),
    [appointments, filter],
  );

  const counts = useMemo(
    () => ({
      all: appointments.length,
      pending: appointments.filter((item) => item.status === "pending").length,
      confirmed: appointments.filter((item) => item.status === "confirmed").length,
    }),
    [appointments],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
      {mutationError && (
        <div role="alert" className="flex items-start gap-2 border-b border-[var(--line)] bg-red-50 px-5 py-3 text-sm text-red-800">
          <AlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{mutationError}</span>
        </div>
      )}
      {showFilter && (
        <div className="flex items-center gap-1 border-b border-[var(--line)] p-3">
          <div className="flex gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Filter appointments">
            {(["all", "pending", "confirmed"] as AppointmentFilter[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                  filter === item ? "bg-white font-medium shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {item} <span className="ml-1 text-xs">{counts[item]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {status === "loading" && (
        <div className="space-y-4 p-5" aria-busy="true" aria-label="Loading appointments">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-16 animate-pulse rounded-lg bg-stone-100" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="p-8 text-center" role="alert">
          <p className="font-medium">We couldn&apos;t load appointments.</p>
        </div>
      )}

      {status === "ready" && visible.length > 0 && (
        <ul className="divide-y divide-[var(--line)]" role="list">
          {visible.map((appointment) => (
            <AppointmentRow key={appointment.id} appointment={appointment} onConfirm={onConfirm} />
          ))}
        </ul>
      )}

      {status === "ready" && visible.length === 0 && (
        <div className="p-10 text-center">
          <p className="font-medium">{emptyMessage ?? "No appointments to show."}</p>
        </div>
      )}
    </div>
  );
}
