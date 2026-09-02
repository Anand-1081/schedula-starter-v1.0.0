"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { AlertIcon } from "@/components/ui/icons";
import { useAvailabilityRules } from "@/features/doctor-portal/hooks/use-availability-rules";
import { WEEKDAY_LABELS, type Weekday } from "@/types/availability-rule";

const ALL_WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
const SLOT_LENGTHS = [15, 20, 30, 45, 60];

function formatWeekdays(weekdays: Weekday[]): string {
  return [...weekdays]
    .sort((a, b) => a - b)
    .map((day) => WEEKDAY_LABELS[day])
    .join(", ");
}

export function AvailabilityManager({ doctorId }: { doctorId: string }) {
  const { rules, status, addRule, removeRule, mutationError } = useAvailabilityRules(doctorId);

  const [label, setLabel] = useState("");
  const [weekdays, setWeekdays] = useState<Weekday[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string>();

  function toggleWeekday(day: Weekday) {
    setWeekdays((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    if (!label.trim()) return setFormError("Give this availability window a short label.");
    if (weekdays.length === 0) return setFormError("Pick at least one day of the week.");
    if (startTime >= endTime) return setFormError("Start time must be before end time.");

    setSubmitting(true);
    try {
      await addRule({ label: label.trim(), weekdays, startTime, endTime, slotMinutes });
      setLabel("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to add availability.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(ruleId: string) {
    setRemovingId(ruleId);
    try {
      await removeRule(ruleId);
    } catch {
      // mutationError from the hook already surfaces this in the UI.
    } finally {
      setRemovingId(undefined);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
        <div className="border-b border-[var(--line)] px-5 py-4">
          <h3 className="font-semibold">Existing availability</h3>
          <p className="text-sm text-[var(--muted)]">Recurring windows patients can currently book into.</p>
        </div>

        {status === "loading" && (
          <div className="space-y-3 p-5" aria-busy="true" aria-label="Loading availability">
            {[1, 2].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-lg bg-stone-100" />
            ))}
          </div>
        )}

        {status === "ready" && rules.length === 0 && (
          <div className="p-8 text-center">
            <p className="font-medium">No availability set yet.</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Add a recurring window using the form to start taking bookings.</p>
          </div>
        )}

        {status === "ready" && rules.length > 0 && (
          <ul className="divide-y divide-[var(--line)]" role="list">
            {rules.map((rule) => (
              <li key={rule.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-medium">{rule.label}</p>
                  <p className="mt-0.5 font-mono text-sm tabular text-[var(--muted)]">
                    {formatWeekdays(rule.weekdays)} &middot; {rule.startTime}&ndash;{rule.endTime} &middot; {rule.slotMinutes} min slots
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(rule.id)}
                  disabled={removingId === rule.id}
                  className="shrink-0 text-sm font-medium text-red-700 hover:text-red-800 disabled:opacity-50"
                >
                  {removingId === rule.id ? "Removing" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex h-fit flex-col gap-4 rounded-xl border border-[var(--line)] bg-white p-5">
        <h3 className="font-semibold">Add availability</h3>

        {(formError || mutationError) && (
          <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-800">
            <AlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{formError ?? mutationError}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="rule-label" className="text-sm font-medium text-[var(--ink)]">
            Label
          </label>
          <input
            id="rule-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Weekday mornings"
            className="rounded-lg border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-[var(--ink)]">Repeats on</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Days of the week">
            {ALL_WEEKDAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleWeekday(day)}
                aria-pressed={weekdays.includes(day)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                  weekdays.includes(day)
                    ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                    : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--brand)]"
                }`}
              >
                {WEEKDAY_LABELS[day]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="rule-start" className="text-sm font-medium text-[var(--ink)]">
              Start time
            </label>
            <input
              id="rule-start"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="rounded-lg border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="rule-end" className="text-sm font-medium text-[var(--ink)]">
              End time
            </label>
            <input
              id="rule-end"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="rounded-lg border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="rule-slot-length" className="text-sm font-medium text-[var(--ink)]">
            Slot length
          </label>
          <select
            id="rule-slot-length"
            value={slotMinutes}
            onChange={(event) => setSlotMinutes(Number(event.target.value))}
            className="rounded-lg border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
          >
            {SLOT_LENGTHS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} minutes
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" loading={submitting} className="mt-1 w-full">
          {submitting ? "Adding" : "Add availability"}
        </Button>
      </form>
    </div>
  );
}
