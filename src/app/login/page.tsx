import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <AppShell>
      <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-0">
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] shadow-sm">
          <div className="px-7 pt-7">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Staff access</p>
            <h1 className="mt-2 font-serif text-2xl font-medium tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-[var(--muted)]">
              Sign in to manage today&apos;s schedule and bookings.
            </p>
          </div>
          <div className="px-7 pb-7 pt-6">
            <LoginForm />
          </div>
          <div className="stub-tear mx-7" />
          <p className="px-7 py-3.5 text-center font-mono text-[11px] tracking-wide text-[var(--muted)]">
            SCHEDULA CLINIC OPS &middot; ID CARD 04
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Are you a doctor?{" "}
          <Link href="/doctor/login" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
            Go to the doctor portal
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
