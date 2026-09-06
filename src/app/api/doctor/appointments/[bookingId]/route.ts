import { addNotification, bookings, doctorAccounts } from "@/lib/mock-data/store";
import { getAvailability } from "@/lib/mock-data/availability";
import { formatLongDate, formatTime12h, isPastMoment } from "@/lib/utils/date";

type RouteContext = { params: Promise<{ bookingId: string }> };

type ActionBody = {
  doctorId?: string;
  action?: "confirm" | "decline" | "cancel" | "reschedule" | "complete" | "missed" | "prescription";
  reason?: string;
  date?: string;
  time?: string;
  prescriptionAvailable?: boolean;
  prescriptionNotes?: string;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { bookingId } = await params;
  const body = (await request.json()) as ActionBody;

  const booking = bookings.find((item) => item.id === bookingId);
  if (!booking) {
    return Response.json({ error: "Appointment not found" }, { status: 404 });
  }
  if (body.doctorId && booking.doctorId !== body.doctorId) {
    return Response.json({ error: "Not authorized to update this appointment" }, { status: 403 });
  }

  const doctor = doctorAccounts.find((item) => item.id === booking.doctorId);
  const doctorName = doctor?.name ?? booking.doctorName;
  const whenLabel = () => `${formatLongDate(booking.date)} at ${formatTime12h(booking.time)}`;

  switch (body.action) {
    case "confirm": {
      if (booking.status !== "pending") {
        return Response.json({ error: "Only pending appointments can be confirmed" }, { status: 409 });
      }
      booking.status = "confirmed";
      if (booking.userId) {
        addNotification({
          recipientType: "user",
          recipientId: booking.userId,
          bookingId: booking.id,
          kind: "confirmation",
          title: "Appointment confirmed",
          message: `${doctorName} confirmed your appointment on ${whenLabel()}.`,
        });
      }
      break;
    }
    case "decline": {
      if (booking.status !== "pending") {
        return Response.json({ error: "Only pending appointments can be declined" }, { status: 409 });
      }
      booking.status = "cancelled";
      booking.cancelledBy = "doctor";
      booking.cancelReason = body.reason || "Declined by doctor";
      if (booking.userId) {
        addNotification({
          recipientType: "user",
          recipientId: booking.userId,
          bookingId: booking.id,
          kind: "cancellation",
          title: "Appointment declined",
          message: `${doctorName} declined your request for ${whenLabel()}.`,
        });
      }
      break;
    }
    case "cancel": {
      if (booking.status !== "confirmed" && booking.status !== "pending") {
        return Response.json({ error: "Only pending or confirmed appointments can be cancelled" }, { status: 409 });
      }
      booking.status = "cancelled";
      booking.cancelledBy = "doctor";
      booking.cancelReason = body.reason || "Cancelled by doctor";
      if (booking.userId) {
        addNotification({
          recipientType: "user",
          recipientId: booking.userId,
          bookingId: booking.id,
          kind: "cancellation",
          title: "Appointment cancelled",
          message: `${doctorName} cancelled your appointment on ${whenLabel()}.`,
        });
      }
      break;
    }
    case "reschedule": {
      if (booking.status !== "confirmed" && booking.status !== "pending") {
        return Response.json({ error: "Only pending or confirmed appointments can be rescheduled" }, { status: 409 });
      }
      if (!body.date || !body.time) {
        return Response.json({ error: "A new date and time are required" }, { status: 400 });
      }
      if (isPastMoment(body.date, body.time)) {
        return Response.json({ error: "Choose a slot in the future" }, { status: 400 });
      }
      const sameSlotTaken = bookings.some(
        (item) =>
          item.id !== booking.id &&
          item.doctorId === booking.doctorId &&
          item.date === body.date &&
          item.time === body.time &&
          (item.status === "pending" || item.status === "confirmed"),
      );
      if (sameSlotTaken) {
        return Response.json({ error: "That slot is already booked" }, { status: 409 });
      }
      const availability = getAvailability(booking.doctorId, body.date);
      const slot = availability.slots.find((item) => item.time === body.time);
      if (!slot || !slot.available) {
        return Response.json({ error: "That slot is not available" }, { status: 409 });
      }

      const fromDate = booking.date;
      const fromTime = booking.time;
      booking.date = body.date;
      booking.time = body.time;
      booking.status = "confirmed";
      booking.rescheduleHistory = [
        ...(booking.rescheduleHistory ?? []),
        { fromDate, fromTime, toDate: body.date, toTime: body.time, at: new Date().toISOString() },
      ];
      if (booking.userId) {
        addNotification({
          recipientType: "user",
          recipientId: booking.userId,
          bookingId: booking.id,
          kind: "reschedule",
          title: "Appointment rescheduled",
          message: `${doctorName} moved your appointment to ${whenLabel()}.`,
        });
      }
      break;
    }
    case "complete": {
      if (booking.status !== "confirmed") {
        return Response.json({ error: "Only confirmed appointments can be marked completed" }, { status: 409 });
      }
      booking.status = "completed";
      if (body.prescriptionAvailable) {
        booking.prescriptionAvailable = true;
        booking.prescriptionNotes = body.prescriptionNotes || "";
        booking.prescriptionIssuedAt = new Date().toISOString();
      }
      if (booking.userId) {
        addNotification({
          recipientType: "user",
          recipientId: booking.userId,
          bookingId: booking.id,
          kind: "completed",
          title: "Appointment completed",
          message: `Your visit with ${doctorName} on ${whenLabel()} is marked completed.`,
        });
        if (booking.prescriptionAvailable) {
          addNotification({
            recipientType: "user",
            recipientId: booking.userId,
            bookingId: booking.id,
            kind: "prescription",
            title: "Prescription available",
            message: `${doctorName} added a prescription for your ${whenLabel()} visit.`,
          });
        }
      }
      break;
    }
    case "missed": {
      if (booking.status !== "confirmed") {
        return Response.json({ error: "Only confirmed appointments can be marked missed" }, { status: 409 });
      }
      booking.status = "missed";
      if (booking.userId) {
        addNotification({
          recipientType: "user",
          recipientId: booking.userId,
          bookingId: booking.id,
          kind: "missed",
          title: "Appointment missed",
          message: `You missed your appointment with ${doctorName} on ${whenLabel()}.`,
        });
      }
      break;
    }
    case "prescription": {
      if (booking.status !== "completed") {
        return Response.json({ error: "Prescriptions can only be added to completed appointments" }, { status: 409 });
      }
      const wasAvailable = booking.prescriptionAvailable;
      booking.prescriptionAvailable = Boolean(body.prescriptionAvailable);
      booking.prescriptionNotes = body.prescriptionNotes || "";
      booking.prescriptionIssuedAt = new Date().toISOString();
      if (booking.prescriptionAvailable && !wasAvailable && booking.userId) {
        addNotification({
          recipientType: "user",
          recipientId: booking.userId,
          bookingId: booking.id,
          kind: "prescription",
          title: "Prescription available",
          message: `${doctorName} added a prescription for your ${whenLabel()} visit.`,
        });
      }
      break;
    }
    default:
      return Response.json({ error: "A valid action is required" }, { status: 400 });
  }

  return Response.json({ data: booking });
}
