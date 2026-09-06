"use client";
import { toIsoDate } from "@/lib/utils/date";
import type { BookingConfirmation } from "@/types/booking";

const DAY_LABEL = new Intl.DateTimeFormat("en", { weekday: "short" });

const DOT_STYLES: Record<string, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-emerald-500",
  completed: "bg-sky-500",
  cancelled: "bg-stone-400",
  missed: "bg-red-500",
};

export function CalendarMonth({
  days,
  month,
  appointments,
  onSelectDay,
}: {
  days: Date[];
  month: number;
  appointments: BookingConfirmation[];
  onSelectDay: (date: Date) => void;
}) {
  const today = toIsoDate(new Date());

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
      <div className="grid grid-cols-7 border-b border-[var(--line)] bg-stone-50">
        {days.slice(0, 7).map((date, index) => (
          <div key={index} className="px-2 py-2 text-center text-xs font-medium text-[var(--muted)]">
            {DAY_LABEL.format(date)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const iso = toIsoDate(date);
          const dayAppointments = appointments.filter((item) => item.date === iso);
          const inMonth = date.getMonth() === month;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectDay(date)}
              className={`flex min-h-24 flex-col items-start gap-1 border-b border-r p-2 text-left last:border-r-0 hover:bg-emerald-50/40 ${
                inMonth ? "border-[var(--line)]" : "border-[var(--line)] bg-stone-50/60 text-stone-400"
              }`}
            >
              <span className={`text-xs font-semibold ${iso === today ? "rounded-full bg-[var(--brand)] px-1.5 py-0.5 text-white" : ""}`}>
                {date.getDate()}
              </span>
              {dayAppointments.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {dayAppointments.slice(0, 6).map((item) => (
                    <span key={item.id} className={`size-1.5 rounded-full ${DOT_STYLES[item.status]}`} />
                  ))}
                </div>
              )}
              {dayAppointments.length > 0 && (
                <span className="text-[10px] text-[var(--muted)]">{dayAppointments.length} visit{dayAppointments.length === 1 ? "" : "s"}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
