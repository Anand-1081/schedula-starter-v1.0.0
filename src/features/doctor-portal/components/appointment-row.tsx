"use client";
import Link from "next/link";
import { formatLongDate, formatTime12h } from "@/lib/utils/date";
import { CalendarIcon, UserIcon } from "@/components/ui/icons";
import type { AppointmentStatus, BookingConfirmation } from "@/types/booking";

export const STATUS_STYLES: Record<AppointmentStatus, string> = {
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  cancelled: "bg-stone-100 text-stone-600 ring-stone-200",
  completed: "bg-sky-50 text-sky-800 ring-sky-200",
  missed: "bg-red-50 text-red-800 ring-red-200",
};

export function AppointmentRow({
  appointment,
  onOpenDetails,
}: {
  appointment: BookingConfirmation;
  onOpenDetails: (appointment: BookingConfirmation) => void;
}) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-start gap-3 px-5 py-4 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
      <div className="font-mono text-sm text-[var(--muted)] tabular">
        {formatLongDate(appointment.date)}
        <br />
        {formatTime12h(appointment.time)}
      </div>
      <div className="min-w-0">
        <p className="font-semibold">
          {appointment.patientName} <span className="font-normal text-[var(--muted)]">&middot; {appointment.patientAge} yrs</span>
        </p>
        <p className="mt-0.5 truncate text-sm text-[var(--muted)]">{appointment.reason}</p>
      </div>
      <div className="col-span-2 flex items-center justify-between gap-3 border-t border-dashed border-[var(--line)] pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:gap-2 sm:border-0 sm:pt-0">
        <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_STYLES[appointment.status]}`}>
          {appointment.status}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Patient details"
            onClick={() => onOpenDetails(appointment)}
            className="grid size-7 place-items-center rounded-full text-[var(--muted)] hover:bg-stone-100 hover:text-[var(--ink)]"
          >
            <UserIcon className="size-4" aria-hidden="true" />
          </button>
          <Link
            href={`/doctor/calendar?date=${appointment.date}`}
            title="View on calendar"
            className="grid size-7 place-items-center rounded-full text-[var(--muted)] hover:bg-stone-100 hover:text-[var(--ink)]"
          >
            <CalendarIcon className="size-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => onOpenDetails(appointment)}
            className="text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]"
          >
            View details
          </button>
        </div>
      </div>
    </li>
  );
}
