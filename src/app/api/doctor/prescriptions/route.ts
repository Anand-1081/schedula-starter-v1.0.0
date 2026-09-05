import { addNotification, bookings, getPrescriptionByBooking, prescriptions } from "@/lib/mock-data/store";
import { formatLongDate, formatTime12h } from "@/lib/utils/date";
import type { Medicine, Prescription } from "@/types/prescription";

type PostBody = {
  doctorId?: string;
  bookingId?: string;
  diagnosis?: string;
  medicines?: Medicine[];
  instructions?: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const doctorId = url.searchParams.get("doctorId");
  if (!doctorId) {
    return Response.json({ error: "doctorId is required" }, { status: 400 });
  }

  const data = bookings
    .filter((booking) => booking.doctorId === doctorId && booking.status === "completed")
    .sort((a, b) => (a.date === b.date ? b.time.localeCompare(a.time) : b.date.localeCompare(a.date)))
    .map((booking) => ({ booking, prescription: getPrescriptionByBooking(booking.id) ?? null }));

  return Response.json({ data });
}

export async function POST(request: Request) {
  const body = (await request.json()) as PostBody;

  if (!body.doctorId || !body.bookingId) {
    return Response.json({ error: "doctorId and bookingId are required" }, { status: 400 });
  }
  const diagnosis = body.diagnosis?.trim();
  if (!diagnosis) {
    return Response.json({ error: "A diagnosis is required" }, { status: 400 });
  }
  const medicines = (body.medicines ?? []).filter((item) => item.name?.trim());
  if (medicines.length === 0) {
    return Response.json({ error: "Add at least one medicine" }, { status: 400 });
  }

  const booking = bookings.find((item) => item.id === body.bookingId);
  if (!booking) {
    return Response.json({ error: "Appointment not found" }, { status: 404 });
  }
  if (booking.doctorId !== body.doctorId) {
    return Response.json({ error: "Not authorized to prescribe for this appointment" }, { status: 403 });
  }
  if (booking.status !== "completed") {
    return Response.json({ error: "Prescriptions can only be added to completed appointments" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const existing = getPrescriptionByBooking(booking.id);
  const wasNew = !existing;

  const record: Prescription = {
    id: existing?.id ?? `rx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    bookingId: booking.id,
    doctorId: booking.doctorId,
    doctorName: booking.doctorName,
    patientId: booking.userId,
    patientName: booking.patientName,
    diagnosis,
    medicines,
    instructions: body.instructions?.trim() ?? "",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (existing) {
    Object.assign(existing, record);
  } else {
    prescriptions.push(record);
  }

  booking.prescriptionAvailable = true;
  booking.prescriptionIssuedAt = now;

  if (booking.userId) {
    addNotification({
      recipientType: "user",
      recipientId: booking.userId,
      bookingId: booking.id,
      kind: "prescription",
      title: wasNew ? "Prescription available" : "Prescription updated",
      message: `${booking.doctorName} ${wasNew ? "added" : "updated"} a prescription for your ${formatLongDate(booking.date)} at ${formatTime12h(booking.time)} visit.`,
    });
  }

  return Response.json({ data: record }, { status: wasNew ? 201 : 200 });
}
