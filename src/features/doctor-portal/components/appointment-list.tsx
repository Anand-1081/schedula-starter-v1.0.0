"use client";
import { useMemo, useState } from "react";
import { AppointmentRow } from "@/features/doctor-portal/components/appointment-row";
import { AppointmentDetailDialog } from "@/features/doctor-portal/components/appointment-detail-dialog";
import { AlertIcon, SearchIcon } from "@/components/ui/icons";
import { isPastMoment } from "@/lib/utils/date";
import type { AppointmentActionPayload } from "@/features/doctor-portal/api/doctor-portal-client";
import type { BookingConfirmation } from "@/types/booking";

export type DoctorAppointmentFilter = "all" | "pending" | "confirmed" | "upcoming" | "completed" | "cancelled" | "missed";

const FILTERS: DoctorAppointmentFilter[] = ["all", "pending", "confirmed", "upcoming", "completed", "cancelled", "missed"];

function matchesFilter(item: BookingConfirmation, filter: DoctorAppointmentFilter): boolean {
  if (filter === "all") return true;
  if (filter === "upcoming") {
    return (item.status === "pending" || item.status === "confirmed") && !isPastMoment(item.date, item.time);
  }
  return item.status === filter;
}

type Props = {
  appointments: BookingConfirmation[];
  status: "loading" | "ready" | "error";
  onAction: (bookingId: string, payload: AppointmentActionPayload) => Promise<unknown>;
  showFilter?: boolean;
  showSearch?: boolean;
  emptyMessage?: string;
  mutationError?: string;
};

export function AppointmentList({
  appointments,
  status,
  onAction,
  showFilter = false,
  showSearch = false,
  emptyMessage,
  mutationError,
}: Props) {
  const [filter, setFilter] = useState<DoctorAppointmentFilter>("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState<BookingConfirmation | null>(null);

  const visible = useMemo(() => {
    return appointments
      .filter((item) => matchesFilter(item, filter))
      .filter((item) => (search.trim() ? item.patientName.toLowerCase().includes(search.trim().toLowerCase()) : true))
      .filter((item) => (dateFilter ? item.date === dateFilter : true));
  }, [appointments, filter, search, dateFilter]);

  const counts = useMemo(() => {
    const base = Object.fromEntries(FILTERS.map((item) => [item, 0])) as Record<DoctorAppointmentFilter, number>;
    for (const item of appointments) {
      for (const filterKey of FILTERS) {
        if (matchesFilter(item, filterKey)) base[filterKey] += 1;
      }
    }
    return base;
  }, [appointments]);

  // Keep the open dialog's data fresh after a mutation updates `appointments`.
  const openAppointment = selected ? appointments.find((item) => item.id === selected.id) ?? selected : null;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
      {mutationError && (
        <div role="alert" className="flex items-start gap-2 border-b border-[var(--line)] bg-red-50 px-5 py-3 text-sm text-red-800">
          <AlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{mutationError}</span>
        </div>
      )}
      {(showFilter || showSearch) && (
        <div className="flex flex-col gap-3 border-b border-[var(--line)] p-3">
          {showFilter && (
            <div className="flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Filter appointments">
              {FILTERS.map((item) => (
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
          )}
          {showSearch && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by patient name"
                  className="w-full rounded-lg border border-[var(--line)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--brand)]"
                />
              </div>
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              />
              {(search || dateFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setDateFilter("");
                  }}
                  className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Clear
                </button>
              )}
            </div>
          )}
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
            <AppointmentRow key={appointment.id} appointment={appointment} onOpenDetails={setSelected} />
          ))}
        </ul>
      )}

      {status === "ready" && visible.length === 0 && (
        <div className="p-10 text-center">
          <p className="font-medium">{emptyMessage ?? "No appointments to show."}</p>
        </div>
      )}

      {openAppointment && (
        <AppointmentDetailDialog
          appointment={openAppointment}
          onClose={() => setSelected(null)}
          onAction={(payload) => onAction(openAppointment.id, payload)}
        />
      )}
    </div>
  );
}
