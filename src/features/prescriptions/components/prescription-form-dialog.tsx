"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertIcon } from "@/components/ui/icons";
import { formatLongDate, formatTime12h } from "@/lib/utils/date";
import type { BookingConfirmation } from "@/types/booking";
import type { Medicine, Prescription, PrescriptionInput } from "@/types/prescription";

function emptyMedicine(): Medicine {
  return { id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: "", dosage: "", frequency: "", duration: "" };
}

type Errors = { diagnosis?: string; medicines?: string };

export function PrescriptionFormDialog({
  booking,
  existing,
  onClose,
  onSave,
}: {
  booking: BookingConfirmation;
  existing?: Prescription | null;
  onClose: () => void;
  onSave: (input: PrescriptionInput) => Promise<unknown>;
}) {
  const [diagnosis, setDiagnosis] = useState(existing?.diagnosis ?? "");
  const [medicines, setMedicines] = useState<Medicine[]>(
    existing?.medicines && existing.medicines.length > 0 ? existing.medicines : [emptyMedicine()],
  );
  const [instructions, setInstructions] = useState(existing?.instructions ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  function updateMedicine(id: string, patch: Partial<Medicine>) {
    setMedicines((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addMedicine() {
    setMedicines((prev) => [...prev, emptyMedicine()]);
  }

  function removeMedicine(id: string) {
    setMedicines((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  }

  async function handleSubmit() {
    const cleanedMedicines = medicines
      .map((item) => ({ ...item, name: item.name.trim(), dosage: item.dosage.trim(), frequency: item.frequency.trim(), duration: item.duration.trim() }))
      .filter((item) => item.name);

    const nextErrors: Errors = {};
    if (!diagnosis.trim()) nextErrors.diagnosis = "Enter a diagnosis.";
    if (cleanedMedicines.length === 0) nextErrors.medicines = "Add at least one medicine.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setFormError(undefined);
    try {
      await onSave({ diagnosis: diagnosis.trim(), medicines: cleanedMedicines, instructions: instructions.trim() });
      onClose();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save the prescription.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              {existing ? "Edit prescription" : "New prescription"}
            </p>
            <h2 className="mt-1 font-serif text-xl font-medium">{booking.patientName}</h2>
            <p className="text-sm text-[var(--muted)]">
              {formatLongDate(booking.date)} &middot; {formatTime12h(booking.time)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]">
            Close
          </button>
        </div>

        {formError && (
          <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-800">
            <AlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-1.5">
          <label htmlFor="diagnosis" className="text-sm font-medium">
            Diagnosis
          </label>
          <textarea
            id="diagnosis"
            rows={2}
            value={diagnosis}
            onChange={(event) => setDiagnosis(event.target.value)}
            placeholder="e.g. Acute viral pharyngitis"
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none ${
              errors.diagnosis ? "border-red-300 bg-red-50/40" : "border-[var(--line)] focus:border-[var(--brand)]"
            }`}
          />
          {errors.diagnosis && (
            <p className="text-xs font-medium text-red-700" role="alert">
              {errors.diagnosis}
            </p>
          )}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Medicines</p>
            <button type="button" onClick={addMedicine} className="text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
              + Add medicine
            </button>
          </div>
          {errors.medicines && (
            <p className="mt-1 text-xs font-medium text-red-700" role="alert">
              {errors.medicines}
            </p>
          )}
          <div className="mt-2 space-y-3">
            {medicines.map((medicine, index) => (
              <div key={medicine.id} className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--line)] p-3 sm:grid-cols-4">
                <input
                  value={medicine.name}
                  onChange={(event) => updateMedicine(medicine.id, { name: event.target.value })}
                  placeholder="Medicine name"
                  aria-label={`Medicine ${index + 1} name`}
                  className="col-span-2 rounded-md border border-[var(--line)] px-2.5 py-2 text-sm outline-none focus:border-[var(--brand)] sm:col-span-1"
                />
                <input
                  value={medicine.dosage}
                  onChange={(event) => updateMedicine(medicine.id, { dosage: event.target.value })}
                  placeholder="Dosage (500mg)"
                  aria-label={`Medicine ${index + 1} dosage`}
                  className="rounded-md border border-[var(--line)] px-2.5 py-2 text-sm outline-none focus:border-[var(--brand)]"
                />
                <input
                  value={medicine.frequency}
                  onChange={(event) => updateMedicine(medicine.id, { frequency: event.target.value })}
                  placeholder="Frequency (2x/day)"
                  aria-label={`Medicine ${index + 1} frequency`}
                  className="rounded-md border border-[var(--line)] px-2.5 py-2 text-sm outline-none focus:border-[var(--brand)]"
                />
                <div className="flex gap-2">
                  <input
                    value={medicine.duration}
                    onChange={(event) => updateMedicine(medicine.id, { duration: event.target.value })}
                    placeholder="Duration (5 days)"
                    aria-label={`Medicine ${index + 1} duration`}
                    className="w-full rounded-md border border-[var(--line)] px-2.5 py-2 text-sm outline-none focus:border-[var(--brand)]"
                  />
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(medicine.id)}
                      aria-label={`Remove medicine ${index + 1}`}
                      className="shrink-0 rounded-md px-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          <label htmlFor="instructions" className="text-sm font-medium">
            Instructions <span className="font-normal text-[var(--muted)]">(optional)</span>
          </label>
          <textarea
            id="instructions"
            rows={3}
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="Follow-up advice, diet, rest, when to return"
            className="w-full rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
          />
        </div>

        <Button onClick={handleSubmit} loading={saving} className="mt-6 w-full sm:w-fit">
          {existing ? "Save changes" : "Save prescription"}
        </Button>
      </div>
    </div>
  );
}
