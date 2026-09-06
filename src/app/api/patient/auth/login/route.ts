import { patientAccounts, toPublicPatientAccount } from "@/lib/mock-data/store";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }

  const match = patientAccounts.find((account) => account.email.toLowerCase() === email);
  if (!match || match.password !== password) {
    return Response.json({ error: "Those credentials don't match our records" }, { status: 401 });
  }

  return Response.json({
    data: {
      patient: toPublicPatientAccount(match),
      token: `mock-${match.id}-${Date.now()}`,
    },
  });
}
