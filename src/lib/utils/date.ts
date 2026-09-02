export function toIsoDate(date: Date): string {
  // Build the ISO date from local date parts. `date.toISOString()` always
  // reports the date in UTC, which is a different calendar day from the
  // local date for part of every day in any timezone that isn't UTC (e.g.
  // between midnight and 5:29am in IST, UTC+5:30). That mismatch used to
  // make the date picker's selected date disagree with the date sent to
  // the availability API.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function nextDays(count: number, from: Date = new Date()): Date[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(from);
    date.setDate(date.getDate() + index);
    return date;
  });
}

export function formatWeekday(date: Date): string {
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(date);
}

export function formatDayNumber(date: Date): string {
  return new Intl.DateTimeFormat("en", { day: "numeric" }).format(date);
}

export function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("en", { month: "short" }).format(date);
}

export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${iso}T00:00:00`));
}

export function formatTime12h(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minuteStr} ${period}`;
}
