"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DoctorShell } from "@/components/layout/doctor-shell";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { useDoctorSession } from "@/features/doctor-portal/hooks/use-doctor-session";
import { useDoctorAppointments } from "@/features/doctor-portal/hooks/use-doctor-appointments";
import { useCalendarAvailability } from "@/features/doctor-portal/hooks/use-calendar-availability";
import { CalendarGrid } from "@/features/doctor-portal/components/calendar-grid";
import { CalendarMonth } from "@/features/doctor-portal/components/calendar-month";
import { addDays, monthGrid, startOfWeek, toIsoDate } from "@/lib/utils/date";

type View = "day" | "week" | "month";

function CalendarPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, status: sessionStatus } = useDoctorSession();
  const { appointments, status, runAction, mutationError } = useDoctorAppointments(session?.doctor.id);

  const [view, setView] = useState<View>((searchParams.get("view") as View) || "week");
  const [anchor, setAnchor] = useState<Date>(() => {
    const paramDate = searchParams.get("date");
    return paramDate ? new Date(`${paramDate}T00:00:00`) : new Date();
  });

  useEffect(() => {
    if (sessionStatus === "signed-out") router.replace("/doctor/login");
  }, [sessionStatus, router]);

  const dates = useMemo(() => {
    if (view === "day") return [anchor];
    if (view === "week") return Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(anchor), index));
    return monthGrid(anchor);
  }, [view, anchor]);

  const fetchDates = view === "month" ? [] : dates;
  const { byDate, loading } = useCalendarAvailability(session?.doctor.id, fetchDates);

  function step(direction: 1 | -1) {
    if (view === "day") setAnchor((prev) => addDays(prev, direction));
    else if (view === "week") setAnchor((prev) => addDays(prev, 7 * direction));
    else setAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  }

  const rangeLabel = useMemo(() => {
    if (view === "day") return new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" }).format(anchor);
    if (view === "week") {
      const start = startOfWeek(anchor);
      const end = addDays(start, 6);
      return `${new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(start)} \u2013 ${new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(end)}`;
    }
    return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(anchor);
  }, [view, anchor]);

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
        <p className="text-sm font-medium text-[var(--brand)]">Calendar</p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight sm:text-4xl">Schedule &amp; availability</h1>
        <p className="mt-2 max-w-xl text-[var(--muted)]">
          Drag a pending or confirmed appointment onto an open slot to reschedule it.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => step(-1)} className="grid size-8 place-items-center rounded-lg border border-[var(--line)] hover:border-[var(--brand)]">
              <ChevronLeftIcon className="size-4" aria-hidden="true" />
            </button>
            <p className="w-48 text-center font-medium sm:w-56">{rangeLabel}</p>
            <button type="button" onClick={() => step(1)} className="grid size-8 place-items-center rounded-lg border border-[var(--line)] hover:border-[var(--brand)]">
              <ChevronRightIcon className="size-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setAnchor(new Date())} className="ml-1 text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
              Today
            </button>
          </div>
          <div className="flex gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Calendar view">
            {(["day", "week", "month"] as View[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setView(item)}
                className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                  view === item ? "bg-white font-medium shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {mutationError && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
            {mutationError}
          </p>
        )}

        <div className="mt-5">
          {status === "loading" ? (
            <div className="h-64 animate-pulse rounded-xl bg-stone-100" aria-busy="true" aria-label="Loading calendar" />
          ) : view === "month" ? (
            <CalendarMonth
              days={dates}
              month={anchor.getMonth()}
              appointments={appointments}
              onSelectDay={(date) => {
                setAnchor(date);
                setView("day");
              }}
            />
          ) : (
            <CalendarGrid
              dates={dates}
              appointments={appointments.filter((item) => dates.some((date) => toIsoDate(date) === item.date))}
              availabilityByDate={byDate}
              loading={loading}
              onAction={runAction}
            />
          )}
        </div>
      </div>
    </DoctorShell>
  );
}

export default function DoctorCalendarPage() {
  return (
    <Suspense fallback={null}>
      <CalendarPageInner />
    </Suspense>
  );
}
