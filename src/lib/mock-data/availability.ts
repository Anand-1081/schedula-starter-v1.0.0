import { availabilityRules, bookings } from "@/lib/mock-data/store";
import type { DayAvailability, Slot } from "@/types/booking";
import type { Weekday } from "@/types/availability-rule";

function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(total: number): string {
  const hour = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const minute = (total % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

// Slots come from whichever recurring rules the doctor has configured for
// this weekday, minus any time already booked. This is what makes slots a
// doctor creates on the Profile page show up immediately on the user portal.
export function getAvailability(doctorId: string, date: string): DayAvailability {
  const weekday = new Date(`${date}T00:00:00`).getDay() as Weekday;

  const matchingRules = availabilityRules.filter(
    (rule) => rule.doctorId === doctorId && rule.weekdays.includes(weekday),
  );

  const times = new Set<string>();
  for (const rule of matchingRules) {
    const start = timeToMinutes(rule.startTime);
    const end = timeToMinutes(rule.endTime);
    for (let minute = start; minute + rule.slotMinutes <= end; minute += rule.slotMinutes) {
      times.add(minutesToTime(minute));
    }
  }

  // Cancelled/completed/missed visits free up their slot; only a pending or
  // confirmed booking should block someone else (or a reschedule) from
  // taking that time.
  const bookedTimes = new Set(
    bookings
      .filter(
        (booking) =>
          booking.doctorId === doctorId &&
          booking.date === date &&
          (booking.status === "pending" || booking.status === "confirmed"),
      )
      .map((booking) => booking.time),
  );

  const slots: Slot[] = Array.from(times)
    .sort()
    .map((time) => ({ time, available: !bookedTimes.has(time) }));

  return { doctorId, date, slots };
}
