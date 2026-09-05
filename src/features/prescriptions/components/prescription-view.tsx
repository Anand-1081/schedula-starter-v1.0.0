import { formatLongDate } from "@/lib/utils/date";
import type { Prescription } from "@/types/prescription";

export function PrescriptionView({ prescription }: { prescription: Prescription }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Diagnosis</p>
        <p className="mt-1 text-sm font-medium">{prescription.diagnosis}</p>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Medicines</p>
        <div className="mt-1.5 overflow-hidden rounded-lg border border-[var(--line)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">Medicine</th>
                <th className="px-3 py-2 font-medium">Dosage</th>
                <th className="px-3 py-2 font-medium">Frequency</th>
                <th className="px-3 py-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {prescription.medicines.map((medicine) => (
                <tr key={medicine.id}>
                  <td className="px-3 py-2 font-medium">{medicine.name}</td>
                  <td className="px-3 py-2 text-[var(--muted)]">{medicine.dosage || "\u2014"}</td>
                  <td className="px-3 py-2 text-[var(--muted)]">{medicine.frequency || "\u2014"}</td>
                  <td className="px-3 py-2 text-[var(--muted)]">{medicine.duration || "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {prescription.instructions && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Instructions</p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{prescription.instructions}</p>
        </div>
      )}

      <p className="text-xs text-[var(--muted)]">
        {prescription.doctorName} &middot; issued {formatLongDate(prescription.createdAt.slice(0, 10))}
        {prescription.updatedAt !== prescription.createdAt && " (updated)"}
      </p>
    </div>
  );
}
