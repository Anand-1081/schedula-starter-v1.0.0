import Link from "next/link";
import { UserIcon, CalendarIcon, ChevronRightIcon } from "@/components/ui/icons";

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col bg-[var(--paper)]">
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[var(--brand)] font-serif text-lg text-white">
              S
            </span>
            <span className="font-serif text-lg font-medium tracking-tight">Schedula</span>
          </div>
          <Link href="/staff" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]">
            Clinic staff sign in
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center">
        <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-8">
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--brand)]">Welcome to Schedula</p>
            <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
              Who&apos;s signing in today?
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
              Choose your portal to book, manage, or track appointments.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
            <Link
              href="/patient/login"
              className="group flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-md"
            >
              <div>
                <span className="grid size-12 place-items-center rounded-xl bg-emerald-100 text-[var(--brand-deep)]">
                  <UserIcon className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-serif text-2xl font-medium">Patient portal</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Find a doctor, book an appointment, and keep track of your prescriptions and visits.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] group-hover:text-[var(--brand-deep)]">
                Continue as a patient
                <ChevronRightIcon className="size-4" aria-hidden="true" />
              </span>
            </Link>

            <Link
              href="/doctor/login"
              className="group flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-md"
            >
              <div>
                <span className="grid size-12 place-items-center rounded-xl bg-sky-100 text-sky-700">
                  <CalendarIcon className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-serif text-2xl font-medium">Doctor portal</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Manage your schedule, confirm or reschedule appointments, and add prescriptions.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] group-hover:text-[var(--brand-deep)]">
                Continue as a doctor
                <ChevronRightIcon className="size-4" aria-hidden="true" />
              </span>
            </Link>
          </div>

          <p className="mt-10 text-center text-sm text-[var(--muted)]">
            New patient?{" "}
            <Link href="/patient/register" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
              Create an account
            </Link>{" "}
            &middot; New doctor?{" "}
            <Link href="/doctor/register" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
              Register your practice
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
