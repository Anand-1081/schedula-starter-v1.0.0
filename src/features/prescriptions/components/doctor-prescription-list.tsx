"use client";
import { useMemo, useState } from "react";
import { DoctorPrescriptionRow } from "@/features/prescriptions/components/doctor-prescription-row";
import { PrescriptionFormDialog } from "@/features/prescriptions/components/prescription-form-dialog";
import { PrescriptionViewDialog } from "@/features/prescriptions/components/prescription-view-dialog";
import { SearchIcon, AlertIcon } from "@/components/ui/icons";
import type { DoctorPrescriptionEntry } from "@/features/prescriptions/api/prescriptions-client";
import type { PrescriptionInput } from "@/types/prescription";

type Filter = "all" | "needs" | "prescribed";

export function DoctorPrescriptionList({
  entries,
  status,
  onSave,
  mutationError,
}: {
  entries: DoctorPrescriptionEntry[];
  status: "loading" | "ready" | "error";
  onSave: (bookingId: string, input: PrescriptionInput) => Promise<unknown>;
  mutationError?: string;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [viewing, setViewing] = useState<DoctorPrescriptionEntry | null>(null);
  const [editing, setEditing] = useState<DoctorPrescriptionEntry | null>(null);

  const visible = useMemo(() => {
    return entries
      .filter((entry) => {
        if (filter === "needs") return !entry.prescription;
        if (filter === "prescribed") return Boolean(entry.prescription);
        return true;
      })
      .filter((entry) => (search.trim() ? entry.booking.patientName.toLowerCase().includes(search.trim().toLowerCase()) : true));
  }, [entries, filter, search]);

  const needsCount = entries.filter((entry) => !entry.prescription).length;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
      {mutationError && (
        <div role="alert" className="flex items-start gap-2 border-b border-[var(--line)] bg-red-50 px-5 py-3 text-sm text-red-800">
          <AlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{mutationError}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 border-b border-[var(--line)] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Filter prescriptions">
          {(["all", "needs", "prescribed"] as Filter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                filter === item ? "bg-white font-medium shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {item === "needs" ? "Needs prescription" : item === "prescribed" ? "Prescribed" : "All"}
              {item === "needs" && needsCount > 0 && <span className="ml-1 text-xs">{needsCount}</span>}
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
        <div className="space-y-4 p-5" aria-busy="true" aria-label="Loading prescriptions">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-16 animate-pulse rounded-lg bg-stone-100" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="p-8 text-center" role="alert">
          <p className="font-medium">We couldn&apos;t load your completed appointments.</p>
        </div>
      )}

      {status === "ready" && visible.length === 0 && (
        <div className="p-10 text-center">
          <p className="font-medium">No completed appointments here yet.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Prescriptions can be added once a visit is marked completed.</p>
        </div>
      )}

      {status === "ready" && visible.length > 0 && (
        <ul className="divide-y divide-[var(--line)]" role="list">
          {visible.map((entry) => (
            <DoctorPrescriptionRow
              key={entry.booking.id}
              entry={entry}
              onView={() => setViewing(entry)}
              onEdit={() => setEditing(entry)}
            />
          ))}
        </ul>
      )}

      {viewing?.prescription && (
        <PrescriptionViewDialog
          prescription={viewing.prescription}
          patientName={viewing.booking.patientName}
          onClose={() => setViewing(null)}
        />
      )}

      {editing && (
        <PrescriptionFormDialog
          booking={editing.booking}
          existing={editing.prescription}
          onClose={() => setEditing(null)}
          onSave={(input) => onSave(editing.booking.id, input)}
        />
      )}
    </div>
  );
}
