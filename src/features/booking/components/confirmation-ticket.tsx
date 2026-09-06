import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { formatLongDate, formatTime12h } from "@/lib/utils/date";
import type { BookingConfirmation } from "@/types/booking";

export function ConfirmationTicket({ confirmation }: { confirmation: BookingConfirmation }) {
  return (
    <div className="mx-auto max-w-md">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-emerald-100 text-[var(--brand-deep)]">
          <CheckIcon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight">Appointment confirmed</h1>
          <p className="text-sm text-[var(--muted)]">A slip has been added to the schedule.</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm">
        <div className="px-6 pt-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Confirmation code</p>
          <p className="mt-1 font-mono text-2xl tabular tracking-wide text-[var(--brand-deep)]">
            {confirmation.confirmationCode}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 px-6 py-6 text-sm">
          <div>
            <dt className="text-[var(--muted)]">Patient</dt>
            <dd className="mt-0.5 font-medium">{confirmation.patientName}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Doctor</dt>
            <dd className="mt-0.5 font-medium">{confirmation.doctorName}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Date</dt>
            <dd className="mt-0.5 font-medium">{formatLongDate(confirmation.date)}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Time</dt>
            <dd className="mt-0.5 font-mono font-medium tabular">{formatTime12h(confirmation.time)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[var(--muted)]">Reason</dt>
            <dd className="mt-0.5 font-medium">{confirmation.reason}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[var(--muted)]">Location</dt>
            <dd className="mt-0.5 font-medium">{confirmation.clinic}</dd>
          </div>
        </dl>

        <div className="stub-tear mx-6" />
        <p className="px-6 py-3.5 text-center font-mono text-[11px] tracking-wide text-[var(--muted)]">
          SCHEDULA CLINIC OPS &middot; {confirmation.id.toUpperCase()}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <Link href="/patient/dashboard" className="flex-1">
          <Button variant="primary" className="w-full">
            Go to dashboard
          </Button>
        </Link>
        <Link href="/doctors" className="flex-1">
          <Button variant="secondary" className="w-full">
            Book another visit
          </Button>
        </Link>
      </div>
    </div>
  );
}
