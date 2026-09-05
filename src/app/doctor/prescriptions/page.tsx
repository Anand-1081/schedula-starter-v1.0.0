"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DoctorShell } from "@/components/layout/doctor-shell";
import { AlertIcon, SearchIcon } from "@/components/ui/icons";
import { useDoctorSession } from "@/features/doctor-portal/hooks/use-doctor-session";
import { useDoctorPrescriptions } from "@/features/prescriptions/hooks/use-doctor-prescriptions";
import { PrescriptionFormDialog } from "@/features/prescriptions/components/prescription-form-dialog";
import { formatLongDate, formatTime12h } from "@/lib/utils/date";
import type { DoctorPrescriptionEntry } from "@/features/prescriptions/api/prescriptions-client";

type Filter = "all" | "pending" | "issued";

export default function DoctorPrescriptionsPage() {
  const router = useRouter();
  const { session, status: sessionStatus } = useDoctorSession();
  const { entries, status, save, mutationError } = useDoctorPrescriptions(session?.doctor.id);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<DoctorPrescriptionEntry | null>(null);

  useEffect(() => {
    if (sessionStatus === "signed-out") router.replace("/doctor/login");
  }, [sessionStatus, router]);

  const visible = useMemo(() => {
    return entries
      .filter((entry) => {
        if (filter === "pending") return !entry.prescription;
        if (filter === "issued") return Boolean(entry.prescription);
        return true;
      })
      .filter((entry) => (search.trim() ? entry.booking.patientName.toLowerCase().includes(search.trim().toLowerCase()) : true));
  }, [entries, filter, search]);

  const pendingCount = entries.filter((entry) => !entry.prescription).length;

  // Keep the open dialog's data fresh after a save updates `entries`.
  const openEntry = active ? entries.find((entry) => entry.booking.id === active.booking.id) ?? active : null;

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
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
        <p className="text-sm font-medium text-[var(--brand)]">Prescriptions</p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight sm:text-4xl">Prescription management</h1>
        <p className="mt-2 max-w-xl text-[var(--muted)]">
          Add or update a prescription for any completed visit. Patients see updates immediately in their portal.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Completed visits</p>
            <p className="mt-1 text-2xl font-semibold">{entries.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Awaiting prescription</p>
            <p className="mt-1 text-2xl font-semibold text-amber-800">{pendingCount}</p>
          </div>
          <div className="col-span-2 rounded-xl border border-[var(--line)] bg-white p-4 sm:col-span-1">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Issued</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-800">{entries.length - pendingCount}</p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
          {mutationError && (
            <div role="alert" className="flex items-start gap-2 border-b border-[var(--line)] bg-red-50 px-5 py-3 text-sm text-red-800">
              <AlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{mutationError}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 border-b border-[var(--line)] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Filter by prescription status">
              {(["all", "pending", "issued"] as Filter[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                    filter === item ? "bg-white font-medium shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="relative sm:w-64">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by patient name"
                className="w-full rounded-lg border border-[var(--line)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--brand)]"
              />
            </div>
          </div>

          {status === "loading" && (
            <div className="space-y-4 p-5" aria-busy="true" aria-label="Loading completed visits">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-lg bg-stone-100" />
              ))}
            </div>
          )}

          {status === "error" && (
            <div className="p-8 text-center" role="alert">
              <p className="font-medium">We couldn&apos;t load completed visits.</p>
            </div>
          )}

          {status === "ready" && visible.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-medium">No completed visits match this view.</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Mark a confirmed appointment as completed to add a prescription for it.
              </p>
            </div>
          )}

          {status === "ready" && visible.length > 0 && (
            <ul className="divide-y divide-[var(--line)]" role="list">
              {visible.map((entry) => (
                <li key={entry.booking.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{entry.booking.patientName}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {formatLongDate(entry.booking.date)} &middot; {formatTime12h(entry.booking.time)}
                    </p>
                    {entry.prescription && (
                      <p className="mt-0.5 truncate text-sm text-[var(--muted)]">{entry.prescription.diagnosis}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                        entry.prescription ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-amber-50 text-amber-800 ring-amber-200"
                      }`}
                    >
                      {entry.prescription ? "Prescription issued" : "Awaiting prescription"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActive(entry)}
                      className="text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]"
                    >
                      {entry.prescription ? "Edit" : "Add prescription"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {openEntry && (
        <PrescriptionFormDialog
          booking={openEntry.booking}
          existing={openEntry.prescription}
          onClose={() => setActive(null)}
          onSave={(input) => save(openEntry.booking.id, input)}
        />
      )}
    </DoctorShell>
  );
}
