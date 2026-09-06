import { bookings, prescriptions, testReports } from "@/lib/mock-data/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get("patientId");
  if (!patientId) {
    return Response.json({ error: "patientId is required" }, { status: 400 });
  }

  const data = {
    totalPrescriptions: prescriptions.filter((item) => item.patientId === patientId).length,
    completedAppointments: bookings.filter((item) => item.userId === patientId && item.status === "completed").length,
    testReports: testReports.filter((item) => item.patientId === patientId).length,
  };

  return Response.json({ data });
}
