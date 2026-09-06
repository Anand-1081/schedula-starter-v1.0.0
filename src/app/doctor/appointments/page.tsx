"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DoctorShell } from "@/components/layout/doctor-shell";
import { useDoctorSession } from "@/features/doctor-portal/hooks/use-doctor-session";
import { useDoctorAppointments } from "@/features/doctor-portal/hooks/use-doctor-appointments";
import { AppointmentList } from "@/features/doctor-portal/components/appointment-list";

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const { session, status: sessionStatus } = useDoctorSession();
  const { appointments, status, runAction, mutationError } = useDoctorAppointments(session?.doctor.id);

  useEffect(() => {
    if (sessionStatus === "signed-out") router.replace("/doctor/login");
  }, [sessionStatus, router]);

  if (sessionStatus !== "signed-in" || !session) {
    return (
      <DoctorShell>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
          <div className="h-40 animate-pulse rounded-xl bg-stone-100" aria-busy="true" aria-label="Checking session" />
        </div>
      </DoctorShell>
    );
  }

  return (
    <DoctorShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
        <p className="text-sm font-medium text-[var(--brand)]">Appointments</p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight sm:text-4xl">All appointments</h1>
        <p className="mt-2 max-w-xl text-[var(--muted)]">Every visit booked with you, past and upcoming.</p>

        <div className="mt-8">
          <AppointmentList
            appointments={appointments}
            status={status}
            onAction={runAction}
            showFilter
            showSearch
            emptyMessage="No appointments yet."
            mutationError={mutationError}
          />
        </div>
      </div>
    </DoctorShell>
  );
}
