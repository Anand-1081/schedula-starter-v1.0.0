"use client";
import { formatDayNumber, formatMonth, formatWeekday, nextDays, toIsoDate } from "@/lib/utils/date";

export function DateStrip({ selectedDate, onSelect }: { selectedDate: string; onSelect: (date: string) => void }) {
  const days = nextDays(14);

  return (
    <div role="group" aria-label="Choose a date" className="flex gap-2 overflow-x-auto pb-2">
      {days.map((day) => {
        const iso = toIsoDate(day);
        const active = iso === selectedDate;
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelect(iso)}
            aria-pressed={active}
            className={`flex min-w-[4.25rem] flex-col items-center gap-0.5 rounded-lg border px-2.5 py-2.5 ${
              active
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--brand)]"
            }`}
          >
            <span className={`text-xs font-medium ${active ? "text-emerald-50" : "text-[var(--muted)]"}`}>
              {formatWeekday(day)}
            </span>
            <span className="font-mono text-lg font-medium tabular">{formatDayNumber(day)}</span>
            <span className={`text-[11px] ${active ? "text-emerald-50" : "text-[var(--muted)]"}`}>{formatMonth(day)}</span>
          </button>
        );
      })}
    </div>
  );
}
