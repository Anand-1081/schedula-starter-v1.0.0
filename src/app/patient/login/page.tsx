"use client";
import { Suspense } from "react";
import Link from "next/link";
import { PatientShell } from "@/components/layout/patient-shell";
import { PatientLoginForm } from "@/features/patient/components/patient-login-form";

export default function PatientLoginPage() {
  return (
    <PatientShell>
      <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-0">
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] shadow-sm">
          <div className="px-7 pt-7">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Patient portal</p>
            <h1 className="mt-2 font-serif text-2xl font-medium tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-[var(--muted)]">Sign in to book visits and track your appointments.</p>
          </div>
          <div className="px-7 pb-7 pt-6">
            <Suspense fallback={null}>
              <PatientLoginForm />
            </Suspense>
          </div>
          <div className="stub-tear mx-7" />
          <p className="px-7 py-3.5 text-center text-sm text-[var(--muted)]">
            New here?{" "}
            <Link href="/patient/register" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
              Create an account
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Are you a doctor?{" "}
          <Link href="/doctor/login" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
            Go to the doctor portal
          </Link>
        </p>
      </div>
    </PatientShell>
  );
}
