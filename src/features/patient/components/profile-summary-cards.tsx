import type { PatientSummary } from "@/features/patient/api/patient-profile-client";

export function ProfileSummaryCards({ summary }: { summary: PatientSummary | null }) {
  const cards = [
    { label: "Total prescriptions", value: summary?.totalPrescriptions ?? 0, tone: "text-[var(--brand-deep)]" },
    { label: "Completed appointments", value: summary?.completedAppointments ?? 0, tone: "text-sky-800" },
    { label: "Test reports", value: summary?.testReports ?? 0, tone: "text-amber-800" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-[var(--line)] bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{card.label}</p>
          <p className={`mt-1 text-2xl font-semibold ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
