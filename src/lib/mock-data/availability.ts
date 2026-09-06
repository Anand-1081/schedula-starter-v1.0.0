import type { DayAvailability, Slot } from "@/types/booking";

const CLINIC_HOURS = { startHour: 9, endHour: 17, stepMinutes: 30 };

// Small deterministic hash so the same doctor + date always produces the
// same "already booked" pattern, without persisting state anywhere.
function hash(input: string): number {
  let value = 0;
  for (let index = 0; index < input.length; index += 1) {
    value = (value * 31 + input.charCodeAt(index)) >>> 0;
  }
  return value;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function getAvailability(doctorId: string, date: string): DayAvailability {
  const slots: Slot[] = [];
  const seed = hash(`${doctorId}:${date}`);
  const isWeekend = [0, 6].includes(new Date(`${date}T00:00:00`).getDay());

  let index = 0;
  for (let minutesFromStart = 0; ; minutesFromStart += CLINIC_HOURS.stepMinutes) {
    const totalMinutes = CLINIC_HOURS.startHour * 60 + minutesFromStart;
    const hour = Math.floor(totalMinutes / 60);
    if (hour >= CLINIC_HOURS.endHour) break;
    const minute = totalMinutes % 60;

    // Lunch break, held open on no calendar.
    const isLunch = hour === 13;
    const bookedByPattern = (seed >> (index % 24)) % 3 === 0;

    slots.push({
      time: `${pad(hour)}:${pad(minute)}`,
      available: !isLunch && !isWeekend && !bookedByPattern,
    });
    index += 1;
  }

  return { doctorId, date, slots };
}
