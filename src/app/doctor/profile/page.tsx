"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DoctorShell } from "@/components/layout/doctor-shell";
import { useDoctorSession } from "@/features/doctor-portal/hooks/use-doctor-session";
import { ProfileForm } from "@/features/doctor-portal/components/profile-form";
import { AvailabilityManager } from "@/features/doctor-portal/components/availability-manager";

export default function DoctorProfilePage() {
  const router = useRouter();
  const { session, status } = useDoctorSession();

  useEffect(() => {
    if (status === "signed-out") router.replace("/doctor/login");
  }, [status, router]);

  if (status !== "signed-in" || !session) {
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
        <p className="text-sm font-medium text-[var(--brand)]">Profile</p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight sm:text-4xl">Your details</h1>
        <p className="mt-2 max-w-xl text-[var(--muted)]">
          Keep your profile current, and manage the recurring hours patients can book into.
        </p>

        <div className="mt-8">
          <ProfileForm />
        </div>

        <div className="mt-10">
          <h2 className="mb-3 font-semibold">Appointment availability</h2>
          <AvailabilityManager doctorId={session.doctor.id} />
        </div>
      </div>
    </DoctorShell>
  );
}
