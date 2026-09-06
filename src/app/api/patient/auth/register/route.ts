import { patientAccounts, toPublicPatientAccount } from "@/lib/mock-data/store";
import type { PatientAccount } from "@/types/patient-account";

type RegisterBody = { name?: string; email?: string; phone?: string; password?: string };

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase() || "PT";
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;

  const missing = (["name", "email", "phone", "password"] as (keyof RegisterBody)[]).filter((field) => !body[field]);
  if (missing.length > 0) {
    return Response.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  const email = body.email!.trim().toLowerCase();
  if (patientAccounts.some((account) => account.email.toLowerCase() === email)) {
    return Response.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  if (!body.password || body.password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const account: PatientAccount = {
    id: `pat-${Date.now().toString(36)}`,
    name: body.name!.trim(),
    initials: initialsFor(body.name!),
    email,
    phone: body.phone!.trim(),
    password: body.password,
  };

  patientAccounts.push(account);

  return Response.json({ data: toPublicPatientAccount(account) }, { status: 201 });
}
