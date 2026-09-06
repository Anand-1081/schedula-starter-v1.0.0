import { addNotification, bookings, doctorAccounts } from "@/lib/mock-data/store";
import { getAvailability } from "@/lib/mock-data/availability";
import { formatLongDate, formatTime12h } from "@/lib/utils/date";
import type { BookingConfirmation, BookingRequest } from "@/types/booking";

function confirmationCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }
  const data = bookings
    .filter((booking) => booking.userId === userId)
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : b.date.localeCompare(a.date)));
  return Response.json({ data });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<BookingRequest>;
  const { doctorId, date, time, patientName, patientAge, reason, userId } = body;

  if (!doctorId || !date || !time || !patientName || !reason) {
    return Response.json({ error: "Missing required booking fields" }, { status: 400 });
  }

  const doctor = doctorAccounts.find((item) => item.id === doctorId);
  if (!doctor) {
    return Response.json({ error: "Doctor not found" }, { status: 404 });
  }

  const availability = getAvailability(doctorId, date);
  const slot = availability.slots.find((item) => item.time === time);
  if (!slot || !slot.available) {
    return Response.json({ error: "That slot is no longer available" }, { status: 409 });
  }

  const confirmation: BookingConfirmation = {
    id: `bkg-${Date.now()}`,
    confirmationCode: confirmationCode(),
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    clinic: doctor.clinic,
    date,
    time,
    patientName,
    patientAge: Number(patientAge) || 0,
    reason,
    createdAt: new Date().toISOString(),
    status: "pending",
    userId: userId || undefined,
  };

  bookings.push(confirmation);

  addNotification({
    recipientType: "doctor",
    recipientId: doctor.id,
    bookingId: confirmation.id,
    kind: "booking",
    title: "New appointment request",
    message: `${patientName} requested ${formatLongDate(date)} at ${formatTime12h(time)}.`,
  });

  return Response.json({ data: confirmation }, { status: 201 });
}
