"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PatientShell } from "@/components/layout/patient-shell";
import { usePatientSession } from "@/features/patient/hooks/use-patient-session";
import { useMyAppointments } from "@/features/user-appointments/hooks/use-my-appointments";
import { MyAppointmentsList } from "@/features/user-appointments/components/my-appointments-list";

export default function MyAppointmentsPage() {
  const router = useRouter();
  const { session, status: sessionStatus } = usePatientSession();
  const { appointments, status, review, mutationError } = useMyAppointments(session?.patient.id);

  useEffect(() => {
    if (sessionStatus === "signed-out") router.replace("/patient/login?next=/appointments");
  }, [sessionStatus, router]);

  if (sessionStatus !== "signed-in" || !session) {
    return (
      <PatientShell>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
          <div className="h-40 animate-pulse rounded-xl bg-stone-100" aria-busy="true" aria-label="Checking session" />
        </div>
      </PatientShell>
    );
  }

  return (
    <PatientShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
        <p className="text-sm font-medium text-[var(--brand)]">Your visits</p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight sm:text-4xl">My appointments</h1>
        <p className="mt-2 max-w-xl text-[var(--muted)]">
          Track every visit you&apos;ve booked, view prescriptions, and rebook with a doctor you&apos;ve seen before.
        </p>

        <div className="mt-8">
          <MyAppointmentsList appointments={appointments} status={status} onReview={review} mutationError={mutationError} />
        </div>
      </div>
    </PatientShell>
  );
}
