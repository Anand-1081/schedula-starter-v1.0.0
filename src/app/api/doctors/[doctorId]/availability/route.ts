import { doctors } from "@/lib/mock-data/doctors";
import { getAvailability } from "@/lib/mock-data/availability";

type RouteContext = { params: Promise<{ doctorId: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { doctorId } = await params;
  const doctor = doctors.find((item) => item.id === doctorId);
  if (!doctor) {
    return Response.json({ error: "Doctor not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  if (!date) {
    return Response.json({ error: "A date query parameter is required" }, { status: 400 });
  }

  return Response.json({ data: getAvailability(doctorId, date) });
}
