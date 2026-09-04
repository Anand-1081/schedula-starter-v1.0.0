import { addNotification, bookings, notifications } from "@/lib/mock-data/store";
import { formatLongDate, formatTime12h, toDateTime } from "@/lib/utils/date";

const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;

// Reminders aren't pushed by a background job in this mock backend, so we
// lazily create one the first time a user's notifications are requested
// while a confirmed appointment sits within the next 24 hours.
function ensureReminders(userId: string) {
  const now = Date.now();
  for (const booking of bookings) {
    if (booking.userId !== userId || booking.status !== "confirmed") continue;
    const startsAt = toDateTime(booking.date, booking.time).getTime();
    const withinWindow = startsAt > now && startsAt - now <= REMINDER_WINDOW_MS;
    if (!withinWindow) continue;
    const alreadySent = notifications.some(
      (item) => item.bookingId === booking.id && item.kind === "reminder",
    );
    if (alreadySent) continue;
    addNotification({
      recipientType: "user",
      recipientId: userId,
      bookingId: booking.id,
      kind: "reminder",
      title: "Upcoming appointment",
      message: `Reminder: your appointment with ${booking.doctorName} is on ${formatLongDate(booking.date)} at ${formatTime12h(booking.time)}.`,
    });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const recipientType = url.searchParams.get("recipientType");
  const recipientId = url.searchParams.get("recipientId");

  if ((recipientType !== "doctor" && recipientType !== "user") || !recipientId) {
    return Response.json({ error: "recipientType and recipientId are required" }, { status: 400 });
  }

  if (recipientType === "user") {
    ensureReminders(recipientId);
  }

  const data = notifications
    .filter((item) => item.recipientType === recipientType && item.recipientId === recipientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return Response.json({ data });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    recipientType?: "doctor" | "user";
    recipientId?: string;
  };
  if (!body.recipientType || !body.recipientId) {
    return Response.json({ error: "recipientType and recipientId are required" }, { status: 400 });
  }
  for (const item of notifications) {
    if (item.recipientType === body.recipientType && item.recipientId === body.recipientId) {
      item.read = true;
    }
  }
  return Response.json({ data: { ok: true } });
}
