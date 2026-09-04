"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertIcon, StarIcon } from "@/components/ui/icons";
import { STATUS_STYLES } from "@/features/doctor-portal/components/appointment-row";
import { getAvailability } from "@/features/booking/api/booking-client";
import type { AppointmentActionPayload } from "@/features/doctor-portal/api/doctor-portal-client";
import { formatLongDate, formatTime12h, isPastMoment, toIsoDate } from "@/lib/utils/date";
import type { BookingConfirmation } from "@/types/booking";

type ConfirmKind = "decline" | "cancel" | null;

export function AppointmentDetailDialog({
  appointment,
  onClose,
  onAction,
}: {
  appointment: BookingConfirmation;
  onClose: () => void;
  onAction: (payload: AppointmentActionPayload) => Promise<unknown>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [confirming, setConfirming] = useState<ConfirmKind>(null);

  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(appointment.date);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState<string>();
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [prescriptionAvailable, setPrescriptionAvailable] = useState(appointment.prescriptionAvailable ?? false);
  const [prescriptionNotes, setPrescriptionNotes] = useState(appointment.prescriptionNotes ?? "");

  const isPast = isPastMoment(appointment.date, appointment.time);

  useEffect(() => {
    if (!rescheduling) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlotsLoading(true);
    setNewTime(undefined);
    getAvailability(appointment.doctorId, newDate)
      .then((data) => setAvailableTimes(data.slots.filter((slot) => slot.available).map((slot) => slot.time)))
      .catch(() => setAvailableTimes([]))
      .finally(() => setSlotsLoading(false));
  }, [rescheduling, newDate, appointment.doctorId]);

  async function run(payload: AppointmentActionPayload) {
    setBusy(true);
    setError(undefined);
    try {
      await onAction(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function submitPrescription() {
    setBusy(true);
    setError(undefined);
    try {
      await onAction({ action: "prescription", prescriptionAvailable, prescriptionNotes });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save the prescription.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Appointment details</p>
            <h2 className="mt-1 font-serif text-xl font-medium">{appointment.patientName}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]">
            Close
          </button>
        </div>

        <span className={`mt-3 inline-block w-fit rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_STYLES[appointment.status]}`}>
          {appointment.status}
        </span>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-[var(--muted)]">Patient age</dt>
            <dd className="mt-0.5 font-medium">{appointment.patientAge} yrs</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Confirmation code</dt>
            <dd className="mt-0.5 font-mono font-medium">{appointment.confirmationCode}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Date</dt>
            <dd className="mt-0.5 font-medium">{formatLongDate(appointment.date)}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Time</dt>
            <dd className="mt-0.5 font-mono font-medium">{formatTime12h(appointment.time)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[var(--muted)]">Appointment type / reason</dt>
            <dd className="mt-0.5 font-medium">{appointment.reason}</dd>
          </div>
          {appointment.cancelReason && (
            <div className="col-span-2">
              <dt className="text-[var(--muted)]">Cancellation reason</dt>
              <dd className="mt-0.5 font-medium">{appointment.cancelReason}</dd>
            </div>
          )}
          {appointment.rescheduleHistory && appointment.rescheduleHistory.length > 0 && (
            <div className="col-span-2">
              <dt className="text-[var(--muted)]">Originally booked for</dt>
              <dd className="mt-0.5 font-medium">
                {formatLongDate(appointment.rescheduleHistory[0].fromDate)} at{" "}
                {formatTime12h(appointment.rescheduleHistory[0].fromTime)}
              </dd>
            </div>
          )}
          {appointment.reviewed && (
            <div className="col-span-2 rounded-lg bg-amber-50 p-3">
              <dt className="flex items-center gap-1 text-[var(--muted)]">
                Patient review{" "}
                <span className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: appointment.reviewRating ?? 0 }).map((_, index) => (
                    <StarIcon key={index} className="size-3.5" aria-hidden="true" />
                  ))}
                </span>
              </dt>
              {appointment.reviewComment && <dd className="mt-0.5 font-medium">&ldquo;{appointment.reviewComment}&rdquo;</dd>}
            </div>
          )}
        </dl>

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-800">
            <AlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Pending: confirm / decline */}
        {appointment.status === "pending" && (
          <div className="mt-5 border-t border-[var(--line)] pt-4">
            {confirming !== "decline" ? (
              <div className="flex flex-wrap gap-2.5">
                <Button onClick={() => run({ action: "confirm" })} loading={busy}>
                  Confirm appointment
                </Button>
                <Button variant="secondary" onClick={() => setConfirming("decline")} disabled={busy}>
                  Decline
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3.5">
                <p className="text-sm font-medium text-red-800">Decline this request? The patient will be notified.</p>
                <div className="mt-3 flex gap-2.5">
                  <Button variant="secondary" className="border-red-300 text-red-800 hover:border-red-400" loading={busy} onClick={() => run({ action: "decline" })}>
                    Yes, decline
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirming(null)} disabled={busy}>
                    Never mind
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmed, in the future: reschedule / cancel */}
        {appointment.status === "confirmed" && !isPast && (
          <div className="mt-5 border-t border-[var(--line)] pt-4">
            {!rescheduling && confirming !== "cancel" && (
              <div className="flex flex-wrap gap-2.5">
                <Button variant="secondary" onClick={() => setRescheduling(true)} disabled={busy}>
                  Reschedule
                </Button>
                <Button variant="secondary" className="border-red-300 text-red-800 hover:border-red-400" onClick={() => setConfirming("cancel")} disabled={busy}>
                  Cancel
                </Button>
              </div>
            )}

            {rescheduling && (
              <div className="space-y-3 rounded-lg border border-[var(--line)] p-3.5">
                <p className="text-sm font-medium">Move to a new slot</p>
                <input
                  type="date"
                  value={newDate}
                  min={toIsoDate(new Date())}
                  onChange={(event) => setNewDate(event.target.value)}
                  className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                />
                {slotsLoading ? (
                  <p className="text-sm text-[var(--muted)]">Loading available slots&hellip;</p>
                ) : availableTimes.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No open slots that day.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setNewTime(time)}
                        className={`rounded-lg border px-2.5 py-1.5 font-mono text-xs ${
                          newTime === time ? "border-[var(--brand)] bg-emerald-50 text-[var(--brand-deep)]" : "border-[var(--line)]"
                        }`}
                      >
                        {formatTime12h(time)}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2.5">
                  <Button
                    disabled={!newTime}
                    loading={busy}
                    onClick={() => newTime && run({ action: "reschedule", date: newDate, time: newTime })}
                  >
                    Confirm new slot
                  </Button>
                  <Button variant="ghost" onClick={() => setRescheduling(false)} disabled={busy}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {confirming === "cancel" && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3.5">
                <p className="text-sm font-medium text-red-800">Cancel this appointment? The patient will be notified.</p>
                <div className="mt-3 flex gap-2.5">
                  <Button variant="secondary" className="border-red-300 text-red-800 hover:border-red-400" loading={busy} onClick={() => run({ action: "cancel" })}>
                    Yes, cancel
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirming(null)} disabled={busy}>
                    Never mind
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmed, time has passed: mark completed / missed */}
        {appointment.status === "confirmed" && isPast && (
          <div className="mt-5 border-t border-[var(--line)] pt-4">
            <p className="mb-3 text-sm text-[var(--muted)]">This visit&apos;s time has passed. Update the outcome:</p>
            <div className="flex flex-wrap gap-2.5">
              <Button onClick={() => run({ action: "complete", prescriptionAvailable, prescriptionNotes })} loading={busy}>
                Mark as completed
              </Button>
              <Button variant="secondary" className="border-red-300 text-red-800 hover:border-red-400" onClick={() => run({ action: "missed" })} disabled={busy}>
                Mark as missed
              </Button>
            </div>
          </div>
        )}

        {/* Completed: read-only + prescription management */}
        {appointment.status === "completed" && (
          <div className="mt-5 space-y-3 border-t border-[var(--line)] pt-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={prescriptionAvailable}
                onChange={(event) => setPrescriptionAvailable(event.target.checked)}
              />
              Prescription available for the patient
            </label>
            {prescriptionAvailable && (
              <textarea
                rows={3}
                value={prescriptionNotes}
                onChange={(event) => setPrescriptionNotes(event.target.value)}
                placeholder="Medication, dosage, and follow-up instructions"
                className="w-full rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
              />
            )}
            <Button onClick={submitPrescription} loading={busy}>
              Save prescription
            </Button>
          </div>
        )}

        {/* Cancelled / missed: fully read-only */}
        {(appointment.status === "cancelled" || appointment.status === "missed") && (
          <p className="mt-5 border-t border-[var(--line)] pt-4 text-sm text-[var(--muted)]">
            This appointment is read-only.
          </p>
        )}
      </div>
    </div>
  );
}
