import { testReports } from "@/lib/mock-data/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get("patientId");
  if (!patientId) {
    return Response.json({ error: "patientId is required" }, { status: 400 });
  }
  const data = testReports
    .filter((item) => item.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));
  return Response.json({ data });
}
