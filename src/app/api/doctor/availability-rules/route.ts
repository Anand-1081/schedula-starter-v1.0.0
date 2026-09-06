import { availabilityRules } from "@/lib/mock-data/store";
import type { AvailabilityRule, Weekday } from "@/types/availability-rule";

const VALID_WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

type CreateRuleBody = {
  doctorId?: string;
  label?: string;
  weekdays?: number[];
  startTime?: string;
  endTime?: string;
  slotMinutes?: number;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const doctorId = url.searchParams.get("doctorId");
  if (!doctorId) {
    return Response.json({ error: "doctorId is required" }, { status: 400 });
  }
  const data = availabilityRules.filter((rule) => rule.doctorId === doctorId);
  return Response.json({ data });
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateRuleBody;
  const { doctorId, label, weekdays, startTime, endTime, slotMinutes } = body;

  if (!doctorId || !label || !weekdays?.length || !startTime || !endTime || !slotMinutes) {
    return Response.json({ error: "Missing required availability fields" }, { status: 400 });
  }
  if (!weekdays.every((day) => VALID_WEEKDAYS.includes(day as Weekday))) {
    return Response.json({ error: "weekdays must be between 0 and 6" }, { status: 400 });
  }
  if (startTime >= endTime) {
    return Response.json({ error: "Start time must be before end time" }, { status: 400 });
  }

  const rule: AvailabilityRule = {
    id: `rule-${doctorId}-${Date.now().toString(36)}`,
    doctorId,
    label,
    weekdays: weekdays as Weekday[],
    startTime,
    endTime,
    slotMinutes,
  };

  availabilityRules.push(rule);
  return Response.json({ data: rule }, { status: 201 });
}
