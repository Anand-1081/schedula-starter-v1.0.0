import { PatientShell } from "@/components/layout/patient-shell";
import { DoctorDirectory } from "@/features/doctors/components/doctor-directory";

export default function DoctorsPage() {
  return (
    <PatientShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
        <p className="text-sm font-medium text-[var(--brand)]">Directory</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find a doctor</h1>
            <p className="mt-2 max-w-xl text-[var(--muted)]">
              Browse the clinic&apos;s doctors and book the next available slot.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <DoctorDirectory />
        </div>
      </div>
    </PatientShell>
  );
}
