import Link from "next/link";
import { DoctorShell } from "@/components/layout/doctor-shell";
import { RegistrationForm } from "@/features/doctor-portal/components/registration-form";

export default function DoctorRegisterPage() {
  return (
    <DoctorShell>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Doctor portal</p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight">Register your practice</h1>
        <p className="mt-2 text-[var(--muted)]">
          Create an account to manage your schedule and take bookings through Schedula.
        </p>

        <div className="mt-8">
          <RegistrationForm />
        </div>

        <p className="mt-8 text-sm text-[var(--muted)]">
          Already registered?{" "}
          <Link href="/doctor/login" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
            Sign in
          </Link>
        </p>
      </div>
    </DoctorShell>
  );
}
