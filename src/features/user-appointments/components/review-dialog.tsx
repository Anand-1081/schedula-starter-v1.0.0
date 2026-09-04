"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertIcon, StarIcon } from "@/components/ui/icons";
import type { BookingConfirmation } from "@/types/booking";

export function ReviewDialog({
  appointment,
  onClose,
  onSubmit,
}: {
  appointment: BookingConfirmation;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<unknown>;
}) {
  const [rating, setRating] = useState(appointment.reviewRating ?? 5);
  const [comment, setComment] = useState(appointment.reviewComment ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit() {
    setBusy(true);
    setError(undefined);
    try {
      await onSubmit(rating, comment);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-xl font-medium">Review {appointment.doctorName}</h2>
          <button type="button" onClick={onClose} className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]">
            Close
          </button>
        </div>

        <div className="mt-4 flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              className={value <= rating ? "text-amber-500" : "text-stone-300"}
            >
              <StarIcon className="size-7" aria-hidden="true" />
            </button>
          ))}
        </div>

        <textarea
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="How was your visit?"
          className="mt-4 w-full rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
        />

        {error && (
          <div role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-800">
            <AlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <Button onClick={handleSubmit} loading={busy} className="mt-5 w-full sm:w-fit">
          Submit review
        </Button>
      </div>
    </div>
  );
}
