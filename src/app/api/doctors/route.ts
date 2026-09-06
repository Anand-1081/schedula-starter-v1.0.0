import { doctorAccounts } from "@/lib/mock-data/store";
import type { Doctor } from "@/types/doctor";

export async function GET() {
  // The public directory only needs the Doctor shape (no email/phone/
  // registration number/password), so pick just those fields.
  const data: Doctor[] = doctorAccounts.map((account) => ({
    id: account.id,
    name: account.name,
    initials: account.initials,
    specialty: account.specialty,
    credentials: account.credentials,
    yearsExperience: account.yearsExperience,
    languages: account.languages,
    clinic: account.clinic,
    bio: account.bio,
    consultFee: account.consultFee,
  }));
  return Response.json({ data, meta: { total: data.length } });
}
