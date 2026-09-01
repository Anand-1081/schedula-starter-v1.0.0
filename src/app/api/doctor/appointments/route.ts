import { bookings } from "@/lib/mock-data/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const doctorId = url.searchParams.get("doctorId");
  if (!doctorId) {
    return Response.json({ error: "doctorId is required" }, { status: 400 });
  }

  const data = bookings
    .filter((booking) => booking.doctorId === doctorId)
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));

  return Response.json({ data });
}
