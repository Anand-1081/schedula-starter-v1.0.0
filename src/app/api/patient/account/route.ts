import { patientAccounts, toPublicPatientAccount } from "@/lib/mock-data/store";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase() || "PT";
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { patientId?: string; name?: string; email?: string; phone?: string };
  if (!body.patientId) {
    return Response.json({ error: "patientId is required" }, { status: 400 });
  }

  const account = patientAccounts.find((item) => item.id === body.patientId);
  if (!account) {
    return Response.json({ error: "Patient account not found" }, { status: 404 });
  }

  if (body.name && !body.name.trim()) {
    return Response.json({ error: "Name can't be empty" }, { status: 400 });
  }
  if (body.email) {
    const email = body.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (patientAccounts.some((item) => item.id !== account.id && item.email.toLowerCase() === email)) {
      return Response.json({ error: "Another account already uses this email" }, { status: 409 });
    }
    account.email = email;
  }
  if (body.name?.trim()) {
    account.name = body.name.trim();
    account.initials = initialsFor(account.name);
  }
  if (body.phone?.trim()) {
    account.phone = body.phone.trim();
  }

  return Response.json({ data: toPublicPatientAccount(account) });
}
