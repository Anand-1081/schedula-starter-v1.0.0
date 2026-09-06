import type { BookingStep } from "@/features/booking/types";

const STEPS: { key: BookingStep; label: string }[] = [
  { key: "date", label: "Pick a time" },
  { key: "details", label: "Your details" },
  { key: "confirmed", label: "Confirmed" },
];

export function BookingStepper({ current }: { current: BookingStep }) {
  const currentIndex = STEPS.findIndex((item) => item.key === current);

  return (
    <ol className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
      {STEPS.map((item, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={item.key} className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span
                className={`grid size-5 place-items-center rounded-full border text-[10px] ${
                  isCurrent || isDone
                    ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                    : "border-[var(--line)] text-[var(--muted)]"
                }`}
              >
                {index + 1}
              </span>
              <span className={isCurrent ? "text-[var(--ink)]" : ""}>{item.label}</span>
            </span>
            {index < STEPS.length - 1 && <span className="h-px w-6 bg-[var(--line)]" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
