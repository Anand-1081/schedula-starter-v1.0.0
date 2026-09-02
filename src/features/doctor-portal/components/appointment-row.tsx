import { formatLongDate, formatTime12h } from "@/lib/utils/date";
import type { AppointmentStatus, BookingConfirmation } from "@/types/booking";

const statusStyles: Record<AppointmentStatus, string> = {
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  cancelled: "bg-stone-100 text-stone-600 ring-stone-200",
};

export function AppointmentRow({
  appointment,
  onConfirm,
  onCancel,
}: {
  appointment: BookingConfirmation;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
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
        <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[appointment.status]}`}>
          {appointment.status}
        </span>
        {appointment.status !== "cancelled" && (onConfirm || onCancel) && (
          <div className="flex items-center gap-3">
            {appointment.status === "pending" && onConfirm && (
              <button
                type="button"
                onClick={() => onConfirm(appointment.id)}
                className="text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]"
              >
                Mark confirmed
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                onClick={() => onCancel(appointment.id)}
                className="text-xs font-semibold text-red-700 hover:text-red-800"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}