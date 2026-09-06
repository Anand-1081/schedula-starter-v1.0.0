export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export type AvailabilityRule = {
  id: string;
  doctorId: string;
  label: string;
  weekdays: Weekday[];
  startTime: string; // "09:00"
  endTime: string; // "13:00"
  slotMinutes: number;
};
