"use client";
import { PrescriptionView } from "@/features/prescriptions/components/prescription-view";
import type { Prescription } from "@/types/prescription";

export function PrescriptionViewDialog({
  prescription,
  patientName,
  onClose,
}: {
  prescription: Prescription;
  patientName: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Prescription</p>
            <h2 className="mt-1 font-serif text-xl font-medium">{patientName}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]">
            Close
          </button>
        </div>
        <div className="mt-4">
          <PrescriptionView prescription={prescription} />
        </div>
      </div>
    </div>
  );
}
