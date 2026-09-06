import Link from "next/link";
import type { Doctor } from "@/types/doctor";

export function DoctorRow({ doctor }: { doctor: Doctor }) {
  return (
    <li className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 px-5 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto]">
      <span className="grid size-12 place-items-center rounded-full bg-emerald-100 font-serif text-base text-[var(--brand-deep)]">
        {doctor.initials}
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="font-serif text-lg font-medium tracking-tight">{doctor.name}</h3>
          <span className="text-sm text-[var(--muted)]">{doctor.credentials}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-medium text-[var(--ink)]">
            {doctor.specialty}
          </span>
          <span className="text-[var(--muted)]">
            {doctor.yearsExperience} yrs &middot; {doctor.clinic}
          </span>
        </div>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">{doctor.bio}</p>
      </div>

      <div className="col-span-2 flex items-center justify-between gap-3 border-t border-dashed border-[var(--line)] pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
        <p className="font-mono text-sm tabular text-[var(--muted)]">&#8377;{doctor.consultFee} / visit</p>
        <Link
          href={`/doctors/${doctor.id}/book`}
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
        >
          Book visit
        </Link>
      </div>
    </li>
  );
}
