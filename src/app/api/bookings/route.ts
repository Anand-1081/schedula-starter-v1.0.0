import { doctors } from "@/lib/mock-data/doctors";
import { getAvailability } from "@/lib/mock-data/availability";
import type { BookingConfirmation, BookingRequest } from "@/types/booking";

function confirmationCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<BookingRequest>;
  const { doctorId, date, time, patientName, reason } = body;

  if (!doctorId || !date || !time || !patientName || !reason) {
    return Response.json({ error: "Missing required booking fields" }, { status: 400 });
  }

  const doctor = doctors.find((item) => item.id === doctorId);
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
    reason,
    createdAt: new Date().toISOString(),
  };

  return Response.json({ data: confirmation }, { status: 201 });
}
