"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PatientShell } from "@/components/layout/patient-shell";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { useBookingFlow } from "@/features/booking/hooks/use-booking-flow";
import { BookingStepper } from "@/features/booking/components/booking-stepper";
import { DateStrip } from "@/features/booking/components/date-strip";
import { SlotGrid } from "@/features/booking/components/slot-grid";
import { PatientDetailsForm } from "@/features/booking/components/patient-details-form";
import { ConfirmationTicket } from "@/features/booking/components/confirmation-ticket";

export default function BookDoctorPage() {
  const params = useParams<{ doctorId: string }>();
  const doctorId = params.doctorId;
  const {
    doctor,
    doctorStatus,
    step,
    goToStep,
    selectedDate,
    chooseDate,
    selectedTime,
    chooseTime,
    availability,
    availabilityStatus,
    confirmation,
    submitError,
    submitting,
    submitBooking,
  } = useBookingFlow(doctorId);

  if (doctorStatus === "loading") {
    return (
      <PatientShell>
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
          <div className="h-40 animate-pulse rounded-xl bg-stone-100" aria-busy="true" aria-label="Loading doctor" />
        </div>
      </PatientShell>
    );
  }

  if (doctorStatus === "error" || !doctor) {
    return (
      <PatientShell>
        <div className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-8" role="alert">
          <p className="font-medium">We couldn&apos;t find that doctor.</p>
          <Link href="/doctors" className="mt-3 inline-block text-sm font-semibold text-[var(--brand)] underline">
            Back to the directory
          </Link>
        </div>
      </PatientShell>
    );
  }

  return (
    <PatientShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-10">
        {step === "confirmed" && confirmation ? (
          <ConfirmationTicket confirmation={confirmation} />
        ) : (
          <>
            <Link href="/doctors" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]">
              <ChevronLeftIcon className="size-4" aria-hidden="true" />
              Doctor directory
            </Link>

            <div className="mt-4 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-emerald-100 font-serif text-base text-[var(--brand-deep)]">
                {doctor.initials}
              </span>
              <div>
                <h1 className="font-serif text-2xl font-medium tracking-tight">{doctor.name}</h1>
                <p className="text-sm text-[var(--muted)]">
                  {doctor.specialty} &middot; {doctor.clinic}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <BookingStepper current={step} />
            </div>

            <div className="mt-7">
              {step === "date" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="mb-2 text-sm font-medium">Choose a date</p>
                    <DateStrip selectedDate={selectedDate} onSelect={chooseDate} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Choose a time</p>
                    <SlotGrid
                      availability={availability}
                      status={availabilityStatus}
                      selectedTime={selectedTime}
                      onSelect={chooseTime}
                    />
                  </div>
                </div>
              )}

              {step === "details" && selectedTime && (
                <div>
                  <button
                    type="button"
                    onClick={() => goToStep("date")}
                    className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
                  >
                    <ChevronLeftIcon className="size-4" aria-hidden="true" />
                    Change date or time
                  </button>
                  <PatientDetailsForm
                    doctor={doctor}
                    date={selectedDate}
                    time={selectedTime}
                    submitting={submitting}
                    submitError={submitError}
                    onSubmit={submitBooking}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PatientShell>
  );
}
