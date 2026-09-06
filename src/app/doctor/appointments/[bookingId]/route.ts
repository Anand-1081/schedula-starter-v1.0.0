import { bookings } from "@/lib/mock-data/store";
import type { AppointmentStatus } from "@/types/booking";

type RouteContext = { params: Promise<{ bookingId: string }> };

const VALID_STATUSES: AppointmentStatus[] = ["pending", "confirmed", "cancelled"];

export async function PATCH(request: Request, { params }: RouteContext) {
  const { bookingId } = await params;
  const body = (await request.json()) as { status?: AppointmentStatus; doctorId?: string };

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return Response.json({ error: "A valid status is required" }, { status: 400 });
  }

  const booking = bookings.find((item) => item.id === bookingId);
  if (!booking) {
    return Response.json({ error: "Appointment not found" }, { status: 404 });
  }
  if (body.doctorId && booking.doctorId !== body.doctorId) {
    return Response.json({ error: "Not authorized to update this appointment" }, { status: 403 });
  }

  booking.status = body.status;
  return Response.json({ data: booking });
}