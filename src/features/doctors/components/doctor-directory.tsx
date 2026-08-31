"use client";
import { useMemo, useState } from "react";
import { useDoctors } from "@/features/doctors/hooks/use-doctors";
import { DoctorRow } from "@/features/doctors/components/doctor-row";
import { SearchIcon } from "@/components/ui/icons";

export function DoctorDirectory() {
  const { doctors, status } = useDoctors();
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("all");

  const specialties = useMemo(
    () => ["all", ...Array.from(new Set(doctors.map((doctor) => doctor.specialty)))],
    [doctors],
  );

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesSpecialty = specialty === "all" || doctor.specialty === specialty;
      const matchesQuery =
        !normalizedQuery ||
        doctor.name.toLowerCase().includes(normalizedQuery) ||
        doctor.specialty.toLowerCase().includes(normalizedQuery);
      return matchesSpecialty && matchesQuery;
    });
  }, [doctors, query, specialty]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or specialty"
            aria-label="Search doctors"
            className="w-full rounded-lg border border-[var(--line)] bg-white py-2.5 pl-9 pr-3.5 text-sm outline-none focus:border-[var(--brand)]"
          />
        </div>

        <div className="flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Filter by specialty">
          {specialties.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSpecialty(item)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                specialty === item ? "bg-white font-medium shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
        {status === "loading" && (
          <div className="space-y-4 p-5" aria-busy="true" aria-label="Loading doctors">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-lg bg-stone-100" />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="p-8 text-center" role="alert">
            <p className="font-medium">We couldn&apos;t load the doctor directory.</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-3 text-sm font-semibold text-[var(--brand)] underline">
              Try again
            </button>
          </div>
        )}

        {status === "ready" && visible.length > 0 && (
          <ul className="divide-y divide-[var(--line)]" role="list">
            {visible.map((doctor) => (
              <DoctorRow key={doctor.id} doctor={doctor} />
            ))}
          </ul>
        )}

        {status === "ready" && visible.length === 0 && (
          <div className="p-10 text-center">
            <p className="font-medium">No doctors match that search.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSpecialty("all");
              }}
              className="mt-2 text-sm font-semibold text-[var(--brand)]"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
