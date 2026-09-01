import Link from "next/link";
import { DoctorShell } from "@/components/layout/doctor-shell";
import { DoctorLoginForm } from "@/features/doctor-portal/components/doctor-login-form";

export default function DoctorLoginPage() {
  return (
    <DoctorShell>
      <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-0">
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] shadow-sm">
          <div className="px-7 pt-7">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Doctor portal</p>
            <h1 className="mt-2 font-serif text-2xl font-medium tracking-tight">Welcome back, doctor</h1>
            <p className="mt-1.5 text-sm text-[var(--muted)]">Sign in to manage your appointments and availability.</p>
          </div>
          <div className="px-7 pb-7 pt-6">
            <DoctorLoginForm />
          </div>
          <div className="stub-tear mx-7" />
          <p className="px-7 py-3.5 text-center text-sm text-[var(--muted)]">
            New here?{" "}
            <Link href="/doctor/register" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
              Register your practice
            </Link>
          </p>
        </div>
      </div>
    </DoctorShell>
  );
}
