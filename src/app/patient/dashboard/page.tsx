"use client";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PatientShell } from "@/components/layout/patient-shell";
import { STATUS_STYLES } from "@/features/doctor-portal/components/appointment-row";
import { usePatientSession } from "@/features/patient/hooks/use-patient-session";
import { useMyAppointments } from "@/features/user-appointments/hooks/use-my-appointments";
import { formatLongDate, formatTime12h, isPastMoment } from "@/lib/utils/date";

export default function PatientDashboardPage() {
  const router = useRouter();
  const { session, status: sessionStatus } = usePatientSession();
  const { appointments, status } = useMyAppointments(session?.patient.id);

  useEffect(() => {
    if (sessionStatus === "signed-out") router.replace("/patient/login?next=/patient/dashboard");
  }, [sessionStatus, router]);

  const upcoming = useMemo(
    () =>
      appointments
        .filter((item) => (item.status === "pending" || item.status === "confirmed") && !isPastMoment(item.date, item.time))
        .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date))),
    [appointments],
  );
  const completedCount = appointments.filter((item) => item.status === "completed").length;
  const nextVisit = upcoming[0];

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
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
        <p className="text-sm font-medium text-[var(--brand)]">Welcome back</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">{session.patient.name}</h1>
            <p className="mt-2 max-w-xl text-[var(--muted)]">
              {upcoming.length > 0
                ? `${upcoming.length} upcoming appointment${upcoming.length === 1 ? "" : "s"}`
                : "No upcoming appointments yet."}
            </p>
          </div>
          <Link
            href="/doctors"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
          >
            + New appointment
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Upcoming</p>
            <p className="mt-1 text-2xl font-semibold">{upcoming.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-sky-700">Completed</p>
            <p className="mt-1 text-2xl font-semibold text-sky-800">{completedCount}</p>
          </div>
          <div className="col-span-2 rounded-xl border border-[var(--line)] bg-white p-4 sm:col-span-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Next visit</p>
            <p className="mt-1 truncate text-sm font-semibold">
              {nextVisit ? `${formatLongDate(nextVisit.date)} \u00b7 ${formatTime12h(nextVisit.time)}` : "\u2014"}
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="font-semibold">Upcoming appointments</h2>
          <Link href="/appointments" className="text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
            View all
          </Link>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
          {status === "loading" && (
            <div className="space-y-4 p-5" aria-busy="true" aria-label="Loading appointments">
              {[1, 2].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-lg bg-stone-100" />
              ))}
            </div>
          )}

          {status === "ready" && upcoming.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-medium">Nothing on the calendar yet.</p>
              <Link href="/doctors" className="mt-2 inline-block text-sm font-semibold text-[var(--brand)]">
                Find a doctor to book with
              </Link>
            </div>
          )}

          {status === "ready" && upcoming.length > 0 && (
            <ul className="divide-y divide-[var(--line)]" role="list">
              {upcoming.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold">{item.doctorName}</p>
                    <p className="truncate text-sm text-[var(--muted)]">
                      {formatLongDate(item.date)} &middot; {formatTime12h(item.time)}
                    </p>
                  </div>
                  <span className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_STYLES[item.status]}`}>
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PatientShell>
  );
}
