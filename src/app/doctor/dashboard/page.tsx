"use client";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DoctorShell } from "@/components/layout/doctor-shell";
import { useDoctorSession } from "@/features/doctor-portal/hooks/use-doctor-session";
import { useDoctorAppointments } from "@/features/doctor-portal/hooks/use-doctor-appointments";
import { AppointmentList } from "@/features/doctor-portal/components/appointment-list";
import { toIsoDate } from "@/lib/utils/date";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { session, status: sessionStatus } = useDoctorSession();
  const { appointments, status, setStatusFor, mutationError } = useDoctorAppointments(session?.doctor.id);

  useEffect(() => {
    if (sessionStatus === "signed-out") router.replace("/doctor/login");
  }, [sessionStatus, router]);

  const today = useMemo(() => toIsoDate(new Date()), []);
  const upcoming = useMemo(() => appointments.filter((item) => item.date >= today), [appointments, today]);
  const pendingCount = appointments.filter((item) => item.status === "pending").length;

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
        <p className="text-sm font-medium text-[var(--brand)]">Welcome back</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">{session.doctor.name}</h1>
            <p className="mt-2 max-w-xl text-[var(--muted)]">
              {upcoming.length} upcoming visit{upcoming.length === 1 ? "" : "s"}
              {pendingCount > 0 && <> &middot; {pendingCount} awaiting confirmation</>}
            </p>
          </div>
          <div className="flex gap-2.5">
            <Link href="/doctor/profile" className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]">
              My profile
            </Link>
            <Link href="/doctor/appointments" className="rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]">
              View all appointments
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 font-semibold">Upcoming appointments</h2>
          <AppointmentList
            appointments={upcoming}
            status={status}
            onConfirm={(id) => setStatusFor(id, "confirmed")}
            emptyMessage="No upcoming appointments yet."
            mutationError={mutationError}
          />
        </div>
      </div>
    </DoctorShell>
  );
}
