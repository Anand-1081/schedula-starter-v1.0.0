"use client";
import { formatLongDate, formatTime12h } from "@/lib/utils/date";
import type { DoctorPrescriptionEntry } from "@/features/prescriptions/api/prescriptions-client";

export function DoctorPrescriptionRow({
  entry,
  onView,
  onEdit,
}: {
  entry: DoctorPrescriptionEntry;
  onView: () => void;
  onEdit: () => void;
}) {
  const { booking, prescription } = entry;
  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-semibold">{booking.patientName}</p>
        <p className="mt-0.5 font-mono text-sm text-[var(--muted)] tabular">
          {formatLongDate(booking.date)} &middot; {formatTime12h(booking.time)}
        </p>
        <p className="mt-0.5 truncate text-sm text-[var(--muted)]">
          {prescription ? prescription.diagnosis : "No prescription added yet"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <span
          className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
            prescription ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-amber-50 text-amber-800 ring-amber-200"
          }`}
        >
          {prescription ? "Prescribed" : "Needs prescription"}
        </span>
        {prescription && (
          <button type="button" onClick={onView} className="text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
            View
          </button>
        )}
        <button type="button" onClick={onEdit} className="text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
          {prescription ? "Edit" : "Add prescription"}
        </button>
      </div>
    </li>
  );
}
