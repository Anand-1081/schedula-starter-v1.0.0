"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePatientSession } from "@/features/patient/hooks/use-patient-session";
import { LogOutIcon } from "@/components/ui/icons";
import { NotificationBell } from "@/features/notifications/components/notification-bell";

const NAV_LINKS = [
  { href: "/patient/dashboard", label: "Dashboard" },
  { href: "/doctors", label: "Find a doctor" },
  { href: "/appointments", label: "My appointments" },
];

export function PatientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, status, signOut } = usePatientSession();
  const minimal = pathname === "/patient/login" || pathname === "/patient/register";

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3.5 sm:px-8 lg:px-12">
          <Link href={session ? "/patient/dashboard" : "/doctors"} className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[var(--brand)] font-serif text-lg text-white">
              S
            </span>
            <span className="font-serif text-lg font-medium tracking-tight">Schedula</span>
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

          <div className="flex items-center gap-3">
            <Link
              href="/doctor/login"
              className="hidden rounded-lg border border-[var(--line)] px-3.5 py-2 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)] sm:inline-flex"
            >
              Doctor portal
            </Link>

            {!minimal && status !== "loading" && (
              <>
                {session ? (
                  <div className="flex items-center gap-3">
                    <NotificationBell recipientType="user" recipientId={session.patient.id} />
                    <span className="grid size-8 place-items-center rounded-full bg-emerald-100 text-xs font-semibold text-[var(--brand-deep)]">
                      {session.patient.initials}
                    </span>
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
                    >
                      <LogOutIcon className="size-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Sign out</span>
                    </button>
                  </div>
                ) : (
                  <Link href="/patient/login" className="text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
                    Sign in
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
