export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
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
