"use client";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "@/components/ui/icons";
import { buildSimplePdf, downloadBlob, wrapText } from "@/lib/utils/pdf";
import { formatLongDate, formatTime12h } from "@/lib/utils/date";
import type { BookingConfirmation } from "@/types/booking";

export function PrescriptionDialog({ appointment, onClose }: { appointment: BookingConfirmation; onClose: () => void }) {
  function handleDownload() {
    const lines = [
      "Schedula Clinic - Prescription",
      "",
      `Patient: ${appointment.patientName} (${appointment.patientAge} yrs)`,
      `Doctor: ${appointment.doctorName} - ${appointment.specialty}`,
      `Clinic: ${appointment.clinic}`,
      `Visit date: ${formatLongDate(appointment.date)} at ${formatTime12h(appointment.time)}`,
      "",
      "Notes:",
      ...wrapText(appointment.prescriptionNotes || "No additional notes provided."),
    ];
    const blob = buildSimplePdf(lines);
    downloadBlob(blob, `prescription-${appointment.id}.pdf`);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-xl font-medium">Prescription</h2>
          <button type="button" onClick={onClose} className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]">
            Close
          </button>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {appointment.doctorName} &middot; {formatLongDate(appointment.date)}
        </p>
        <div className="mt-4 whitespace-pre-wrap rounded-lg border border-[var(--line)] bg-stone-50 p-4 text-sm">
          {appointment.prescriptionNotes || "No additional notes provided."}
        </div>
        <Button onClick={handleDownload} className="mt-5 w-full sm:w-fit">
          <DownloadIcon className="size-4" aria-hidden="true" />
          Download as PDF
        </Button>
      </div>
    </div>
  );
}
