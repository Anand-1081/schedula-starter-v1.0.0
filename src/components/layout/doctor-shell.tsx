"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDoctorSession } from "@/features/doctor-portal/hooks/use-doctor-session";
import { LogOutIcon } from "@/components/ui/icons";

const NAV_LINKS = [
  { href: "/doctor/dashboard", label: "Dashboard" },
  { href: "/doctor/profile", label: "Profile" },
  { href: "/doctor/appointments", label: "Appointments" },
];

export function DoctorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, status, signOut } = useDoctorSession();
  const minimal = pathname === "/doctor/login" || pathname === "/doctor/register";

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3.5 sm:px-8 lg:px-12">
          <Link href="/doctor/dashboard" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[var(--brand)] font-serif text-lg text-white">
              S
            </span>
            <div className="leading-tight">
              <span className="font-serif text-lg font-medium tracking-tight">Schedula</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Doctor portal</span>
            </div>
          </Link>

          {!minimal && (
            <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
              {NAV_LINKS.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative px-3 py-2 text-sm font-medium ${
                      active ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {link.label}
                    {active && <span className="absolute inset-x-3 -bottom-[15px] h-0.5 rounded-full bg-[var(--brand)]" />}
                  </Link>
                );
              })}
            </nav>
          )}

          {!minimal && status !== "loading" && session && (
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-full bg-emerald-100 text-xs font-semibold text-[var(--brand-deep)]">
                {session.doctor.initials}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <LogOutIcon className="size-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
