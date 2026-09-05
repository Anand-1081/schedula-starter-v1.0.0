"use client";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "@/components/ui/icons";
import { usePrescription } from "@/features/prescriptions/hooks/use-prescription";
import { PrescriptionView } from "@/features/prescriptions/components/prescription-view";
import { buildSimplePdf, downloadBlob, wrapText } from "@/lib/utils/pdf";
import { formatLongDate, formatTime12h } from "@/lib/utils/date";
import type { BookingConfirmation } from "@/types/booking";

export function PrescriptionDialog({ appointment, onClose }: { appointment: BookingConfirmation; onClose: () => void }) {
  const { prescription, status } = usePrescription(appointment.id, { patientId: appointment.userId });

  function handleDownload() {
    if (!prescription) return;
    const lines = [
      "Schedula Clinic - Prescription",
      "",
      `Patient: ${appointment.patientName} (${appointment.patientAge} yrs)`,
      `Doctor: ${appointment.doctorName} - ${appointment.specialty}`,
      `Clinic: ${appointment.clinic}`,
      `Visit date: ${formatLongDate(appointment.date)} at ${formatTime12h(appointment.time)}`,
      "",
      `Diagnosis: ${prescription.diagnosis}`,
      "",
      "Medicines:",
      ...prescription.medicines.map(
        (medicine) => `- ${medicine.name} | ${medicine.dosage || "-"} | ${medicine.frequency || "-"} | ${medicine.duration || "-"}`,
      ),
      "",
      "Instructions:",
      ...wrapText(prescription.instructions || "No additional instructions provided."),
    ];
    const blob = buildSimplePdf(lines);
    downloadBlob(blob, `prescription-${appointment.id}.pdf`);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-xl font-medium">Prescription</h2>
          <button type="button" onClick={onClose} className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]">
            Close
          </button>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {appointment.doctorName} &middot; {formatLongDate(appointment.date)}
        </p>

        <div className="mt-4">
          {status === "loading" && (
            <div className="space-y-2" aria-busy="true" aria-label="Loading prescription">
              <div className="h-4 w-1/2 animate-pulse rounded bg-stone-100" />
              <div className="h-20 animate-pulse rounded-lg bg-stone-100" />
            </div>
          )}
          {status === "error" && <p className="text-sm text-red-700">We couldn&apos;t load this prescription.</p>}
          {status === "not-found" && <p className="text-sm text-[var(--muted)]">No prescription details found for this visit.</p>}
          {status === "ready" && prescription && <PrescriptionView prescription={prescription} />}
        </div>

        <Button onClick={handleDownload} disabled={status !== "ready"} className="mt-5 w-full sm:w-fit">
          <DownloadIcon className="size-4" aria-hidden="true" />
          Download as PDF
        </Button>
      </div>
    </div>
  );
}
