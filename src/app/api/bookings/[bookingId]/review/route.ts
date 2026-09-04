import { bookings } from "@/lib/mock-data/store";

type RouteContext = { params: Promise<{ bookingId: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const { bookingId } = await params;
  const body = (await request.json()) as { userId?: string; rating?: number; comment?: string };

  const booking = bookings.find((item) => item.id === bookingId);
  if (!booking) {
    return Response.json({ error: "Appointment not found" }, { status: 404 });
  }
  if (body.userId && booking.userId !== body.userId) {
    return Response.json({ error: "Not authorized to review this appointment" }, { status: 403 });
  }
  if (booking.status !== "completed") {
    return Response.json({ error: "Only completed appointments can be reviewed" }, { status: 409 });
  }
  const rating = Number(body.rating);
  if (!rating || rating < 1 || rating > 5) {
    return Response.json({ error: "A rating from 1 to 5 is required" }, { status: 400 });
  }

  booking.reviewed = true;
  booking.reviewRating = rating;
  booking.reviewComment = body.comment?.trim() || "";

  return Response.json({ data: booking });
}
