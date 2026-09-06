import { getOrCreatePatientProfile, patientAccounts } from "@/lib/mock-data/store";
import type { PatientProfileInput } from "@/types/patient-profile";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const patientId = url.searchParams.get("patientId");
  if (!patientId) {
    return Response.json({ error: "patientId is required" }, { status: 400 });
  }
  return Response.json({ data: getOrCreatePatientProfile(patientId) });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { patientId?: string } & Partial<PatientProfileInput>;
  if (!body.patientId) {
    return Response.json({ error: "patientId is required" }, { status: 400 });
  }
  if (!patientAccounts.some((account) => account.id === body.patientId)) {
    return Response.json({ error: "Patient account not found" }, { status: 404 });
  }

  const profile = getOrCreatePatientProfile(body.patientId);
  const { patientId, ...fields } = body;
  void patientId;
  Object.assign(profile, fields, { updatedAt: new Date().toISOString() });

  return Response.json({ data: profile });
}
