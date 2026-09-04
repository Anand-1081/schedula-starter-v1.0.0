import Link from "next/link";
import { PatientShell } from "@/components/layout/patient-shell";
import { PatientRegistrationForm } from "@/features/patient/components/patient-registration-form";

export default function PatientRegisterPage() {
  return (
    <PatientShell>
      <div className="mx-auto max-w-md px-4 py-10 sm:px-0">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Patient portal</p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight">Create your account</h1>
        <p className="mt-2 text-[var(--muted)]">Book appointments and keep track of your visits and prescriptions.</p>

        <div className="mt-8">
          <PatientRegistrationForm />
        </div>

        <p className="mt-8 text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/patient/login" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
            Sign in
          </Link>
        </p>
      </div>
    </PatientShell>
  );
}
