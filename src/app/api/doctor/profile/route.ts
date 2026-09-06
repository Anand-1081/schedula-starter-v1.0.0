import { doctorAccounts, toPublicDoctorAccount } from "@/lib/mock-data/store";

type UpdateBody = {
  doctorId?: string;
  name?: string;
  specialty?: string;
  credentials?: string;
  yearsExperience?: number;
  clinic?: string;
  bio?: string;
  consultFee?: number;
  phone?: string;
};

export async function PATCH(request: Request) {
  const body = (await request.json()) as UpdateBody;
  const { doctorId, ...updates } = body;

  if (!doctorId) {
    return Response.json({ error: "doctorId is required" }, { status: 400 });
  }

  const account = doctorAccounts.find((item) => item.id === doctorId);
  if (!account) {
    return Response.json({ error: "Doctor not found" }, { status: 404 });
  }

  if (updates.name) account.name = updates.name.trim();
  if (updates.specialty) account.specialty = updates.specialty.trim();
  if (updates.credentials) account.credentials = updates.credentials.trim();
  if (updates.yearsExperience !== undefined) account.yearsExperience = Number(updates.yearsExperience) || 0;
  if (updates.clinic) account.clinic = updates.clinic.trim();
  if (updates.bio !== undefined) account.bio = updates.bio.trim();
  if (updates.consultFee !== undefined) account.consultFee = Number(updates.consultFee) || 0;
  if (updates.phone) account.phone = updates.phone.trim();

  return Response.json({ data: toPublicDoctorAccount(account) });
}
