"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PatientShell } from "@/components/layout/patient-shell";
import { usePatientSession } from "@/features/patient/hooks/use-patient-session";
import { usePatientProfile } from "@/features/patient/hooks/use-patient-profile";
import { updatePatientAccount } from "@/features/patient/api/patient-client";
import { ProfileSummaryCards } from "@/features/patient/components/profile-summary-cards";
import { ProfilePanel, type ProfileFormValues } from "@/features/patient/components/profile-panel";

export default function PatientProfilePage() {
  const router = useRouter();
  const { session, status: sessionStatus, updatePatient } = usePatientSession();
  const { profile, summary, testReports, status, saveProfile } = usePatientProfile(session?.patient.id);

  useEffect(() => {
    if (sessionStatus === "signed-out") router.replace("/patient/login?next=/patient/profile");
  }, [sessionStatus, router]);

  async function handleSave(values: ProfileFormValues) {
    if (!session) return;
    const { name, email, phone, ...profileFields } = values;
    const account = await updatePatientAccount(session.patient.id, { name, email, phone });
    updatePatient(account);
    await saveProfile(profileFields);
  }

  if (sessionStatus !== "signed-in" || !session) {
    return (
      <PatientShell>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
          <div className="h-40 animate-pulse rounded-xl bg-stone-100" aria-busy="true" aria-label="Checking session" />
        </div>
      </PatientShell>
    );
  }

  return (
    <PatientShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
        <p className="text-sm font-medium text-[var(--brand)]">Your profile</p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight sm:text-4xl">Profile &amp; health details</h1>
        <p className="mt-2 max-w-xl text-[var(--muted)]">
          Keep this up to date so your doctors have accurate information during visits.
        </p>

        <div className="mt-6">
          <ProfileSummaryCards summary={summary} />
        </div>

        <div className="mt-6">
          {status === "loading" && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-32 animate-pulse rounded-xl bg-stone-100" aria-busy="true" aria-label="Loading profile" />
              ))}
            </div>
          )}
          {status === "error" && (
            <div className="rounded-xl border border-[var(--line)] bg-white p-8 text-center" role="alert">
              <p className="font-medium">We couldn&apos;t load your profile.</p>
            </div>
          )}
          {status === "ready" && profile && (
            <ProfilePanel account={session.patient} profile={profile} testReports={testReports} onSave={handleSave} />
          )}
        </div>
      </div>
    </PatientShell>
  );
}
