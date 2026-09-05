import type { PatientProfile, PatientProfileInput } from "@/types/patient-profile";
import type { TestReport } from "@/types/test-report";

async function parse<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Something went wrong");
  return body.data as T;
}

export type PatientSummary = {
  totalPrescriptions: number;
  completedAppointments: number;
  testReports: number;
};

export async function getPatientProfile(patientId: string): Promise<PatientProfile> {
  const response = await fetch(`/api/patient/profile?patientId=${encodeURIComponent(patientId)}`);
  return parse<PatientProfile>(response);
}

export async function updatePatientProfile(
  patientId: string,
  fields: Partial<PatientProfileInput>,
): Promise<PatientProfile> {
  const response = await fetch("/api/patient/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientId, ...fields }),
  });
  return parse<PatientProfile>(response);
}

export async function getPatientSummary(patientId: string): Promise<PatientSummary> {
  const response = await fetch(`/api/patient/summary?patientId=${encodeURIComponent(patientId)}`);
  return parse<PatientSummary>(response);
}

export async function getPatientTestReports(patientId: string): Promise<TestReport[]> {
  const response = await fetch(`/api/patient/test-reports?patientId=${encodeURIComponent(patientId)}`);
  return parse<TestReport[]>(response);
}
