"use client";
import { useState, type FormEvent } from "react";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { AlertIcon, CalendarIcon, ClockIcon } from "@/components/ui/icons";
import { formatLongDate, formatTime12h } from "@/lib/utils/date";
import type { Doctor } from "@/types/doctor";
import type { PatientDetails } from "@/features/booking/types";

type Errors = Partial<Record<keyof PatientDetails, string>>;

function validate(details: PatientDetails): Errors {
  const errors: Errors = {};
  if (!details.patientName.trim()) errors.patientName = "Enter the patient's full name.";
  const age = Number(details.patientAge);
  if (!details.patientAge) errors.patientAge = "Enter the patient's age.";
  else if (!Number.isInteger(age) || age <= 0 || age > 120) errors.patientAge = "Enter a valid age.";
  if (!details.reason.trim()) errors.reason = "Add a short reason for the visit.";
  return errors;
}

type Props = {
  doctor: Doctor;
  date: string;
  time: string;
  submitting: boolean;
  submitError?: string;
  onSubmit: (details: PatientDetails) => void;
};

export function PatientDetailsForm({ doctor, date, time, submitting, submitError, onSubmit }: Props) {
  const [details, setDetails] = useState<PatientDetails>({ patientName: "", patientAge: "", reason: "" });
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(details);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(details);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {submitError && (
          <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-800">
            <AlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}
        <Field
          label="Patient full name"
          value={details.patientName}
          onChange={(event) => setDetails((prev) => ({ ...prev, patientName: event.target.value }))}
          error={errors.patientName}
          placeholder="Maya Patel"
        />
        <Field
          label="Patient age"
          type="number"
          min={0}
          max={120}
          value={details.patientAge}
          onChange={(event) => setDetails((prev) => ({ ...prev, patientAge: event.target.value }))}
          error={errors.patientAge}
          placeholder="34"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reason" className="text-sm font-medium text-[var(--ink)]">
            Reason for visit
          </label>
          <textarea
            id="reason"
            rows={3}
            value={details.reason}
            onChange={(event) => setDetails((prev) => ({ ...prev, reason: event.target.value }))}
            placeholder="Follow-up on blood pressure medication"
            aria-invalid={Boolean(errors.reason) || undefined}
            className={`rounded-lg border px-3.5 py-2.5 text-sm outline-none ${
              errors.reason ? "border-red-300 bg-red-50/40" : "border-[var(--line)] bg-white focus:border-[var(--brand)]"
            }`}
          />
          {errors.reason && (
            <p className="text-xs font-medium text-red-700" role="alert">
              {errors.reason}
            </p>
          )}
        </div>
        <Button type="submit" loading={submitting} className="mt-1 w-full sm:w-fit">
          {submitting ? "Confirming" : "Confirm appointment"}
        </Button>
      </form>

      <aside className="h-fit rounded-xl border border-[var(--line)] bg-white p-5">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Visit summary</p>
        <p className="mt-3 font-serif text-lg font-medium">{doctor.name}</p>
        <p className="text-sm text-[var(--muted)]">{doctor.specialty}</p>
        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-[var(--muted)]" aria-hidden="true" />
            <dd>{formatLongDate(date)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="size-4 text-[var(--muted)]" aria-hidden="true" />
            <dd className="font-mono tabular">{formatTime12h(time)}</dd>
          </div>
        </dl>
        <p className="mt-4 border-t border-[var(--line)] pt-3 text-sm text-[var(--muted)]">{doctor.clinic}</p>
      </aside>
    </div>
  );
}
