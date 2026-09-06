import { formatTime12h } from "@/lib/utils/date";
import type { DayAvailability } from "@/types/booking";

type Props = {
  availability: DayAvailability | null;
  status: "loading" | "ready" | "error";
  selectedTime?: string;
  onSelect: (time: string) => void;
};

export function SlotGrid({ availability, status, selectedTime, onSelect }: Props) {
  if (status === "loading") {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-busy="true" aria-label="Loading available times">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-11 animate-pulse rounded-lg bg-stone-100" />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <p role="alert" className="text-sm text-red-700">
        We couldn&apos;t load times for this date. Try another date.
      </p>
    );
  }

  const openSlots = availability?.slots.filter((slot) => slot.available) ?? [];
  if (openSlots.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No open slots this day &mdash; try another date.</p>;
  }

  return (
    <div role="group" aria-label="Choose a time" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {availability?.slots.map((slot) => (
        <button
          key={slot.time}
          type="button"
          disabled={!slot.available}
          aria-pressed={selectedTime === slot.time}
          onClick={() => onSelect(slot.time)}
          className={`rounded-lg border px-2 py-2.5 font-mono text-sm tabular ${
            !slot.available
              ? "cursor-not-allowed border-[var(--line)] text-stone-300 line-through"
              : selectedTime === slot.time
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--line)] bg-white hover:border-[var(--brand)]"
          }`}
        >
          {formatTime12h(slot.time)}
        </button>
      ))}
    </div>
  );
}
