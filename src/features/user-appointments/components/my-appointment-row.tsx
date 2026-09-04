"use client";
import { useState } from "react";
import Link from "next/link";
import { formatLongDate, formatTime12h } from "@/lib/utils/date";
import { STATUS_STYLES } from "@/features/doctor-portal/components/appointment-row";
import { PrescriptionDialog } from "@/features/user-appointments/components/prescription-dialog";
import { ReviewDialog } from "@/features/user-appointments/components/review-dialog";
import type { BookingConfirmation } from "@/types/booking";

export function MyAppointmentRow({
  appointment,
  onReview,
}: {
  appointment: BookingConfirmation;
  onReview: (bookingId: string, rating: number, comment: string) => Promise<unknown>;
}) {
  const [showPrescription, setShowPrescription] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const isCompleted = appointment.status === "completed";

  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="font-semibold">{appointment.doctorName}</p>
        <p className="text-sm text-[var(--muted)]">{appointment.specialty}</p>
        <p className="mt-1 font-mono text-sm text-[var(--muted)] tabular">
          {formatLongDate(appointment.date)} &middot; {formatTime12h(appointment.time)}
        </p>
        <p className="mt-0.5 text-sm text-[var(--muted)]">{appointment.reason}</p>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_STYLES[appointment.status]}`}>
          {appointment.status}
        </span>

        {isCompleted && (
          <>
            <span className={`text-xs font-medium ${appointment.prescriptionAvailable ? "text-emerald-700" : "text-stone-500"}`}>
              {appointment.prescriptionAvailable ? "Prescription available" : "Prescription not available"}
            </span>
            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 text-xs font-semibold">
              {appointment.prescriptionAvailable && (
                <button type="button" onClick={() => setShowPrescription(true)} className="text-[var(--brand)] hover:text-[var(--brand-deep)]">
                  View prescription
                </button>
              )}
              <button type="button" onClick={() => setShowReview(true)} className="text-[var(--brand)] hover:text-[var(--brand-deep)]">
                {appointment.reviewed ? "Edit review" : "Review doctor"}
              </button>
              <Link href={`/doctors/${appointment.doctorId}/book`} className="text-[var(--brand)] hover:text-[var(--brand-deep)]">
                Rebook
              </Link>
            </div>
          </>
        )}

        {appointment.status === "cancelled" && appointment.cancelReason && (
          <p className="text-xs text-[var(--muted)]">{appointment.cancelReason}</p>
        )}
      </div>

      {showPrescription && <PrescriptionDialog appointment={appointment} onClose={() => setShowPrescription(false)} />}
      {showReview && (
        <ReviewDialog
          appointment={appointment}
          onClose={() => setShowReview(false)}
          onSubmit={(rating, comment) => onReview(appointment.id, rating, comment)}
        />
      )}
    </li>
  );
}
