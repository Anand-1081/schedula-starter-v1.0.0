import { bookings, getPrescriptionByBooking } from "@/lib/mock-data/store";

type RouteContext = { params: Promise<{ bookingId: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { bookingId } = await params;
  const url = new URL(request.url);
  const doctorId = url.searchParams.get("doctorId");
  const patientId = url.searchParams.get("patientId");

  const booking = bookings.find((item) => item.id === bookingId);
  if (!booking) {
    return Response.json({ error: "Appointment not found" }, { status: 404 });
  }
  if (doctorId && booking.doctorId !== doctorId) {
    return Response.json({ error: "Not authorized to view this prescription" }, { status: 403 });
  }
  if (patientId && booking.userId !== patientId) {
    return Response.json({ error: "Not authorized to view this prescription" }, { status: 403 });
  }

  const prescription = getPrescriptionByBooking(bookingId);
  if (!prescription) {
    return Response.json({ error: "No prescription found for this appointment" }, { status: 404 });
  }

  return Response.json({ data: prescription });
}
