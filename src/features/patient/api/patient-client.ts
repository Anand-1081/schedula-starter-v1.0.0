import type { PatientSession, PublicPatientAccount } from "@/types/patient-account";
import type { PatientRegistrationValues } from "@/features/patient/types";

async function parse<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Something went wrong");
  return body.data as T;
}

export async function registerPatient(values: PatientRegistrationValues): Promise<PublicPatientAccount> {
  const response = await fetch("/api/patient/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
    }),
  });
  return parse<PublicPatientAccount>(response);
}

export async function loginPatient(email: string, password: string): Promise<PatientSession> {
  const response = await fetch("/api/patient/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parse<PatientSession>(response);
}
