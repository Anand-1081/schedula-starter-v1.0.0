import { doctorAccounts, toPublicDoctorAccount } from "@/lib/mock-data/store";
import type { DoctorAccount } from "@/types/doctor-account";

type RegisterBody = {
  name?: string;
  specialty?: string;
  credentials?: string;
  yearsExperience?: number;
  registrationNumber?: string;
  clinic?: string;
  bio?: string;
  consultFee?: number;
  email?: string;
  phone?: string;
  password?: string;
};

const REQUIRED_FIELDS: (keyof RegisterBody)[] = [
  "name",
  "specialty",
  "credentials",
  "registrationNumber",
  "clinic",
  "email",
  "phone",
  "password",
];

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase() || "DR";
}

function slugFor(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/^dr\.?\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `doc-${base}-${Date.now().toString(36)}`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;

  const missing = REQUIRED_FIELDS.filter((field) => !body[field]);
  if (missing.length > 0) {
    return Response.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  const email = body.email!.trim().toLowerCase();
  if (doctorAccounts.some((account) => account.email.toLowerCase() === email)) {
    return Response.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  if (!body.password || body.password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const account: DoctorAccount = {
    id: slugFor(body.name!),
    name: body.name!.trim(),
    initials: initialsFor(body.name!),
    specialty: body.specialty!.trim(),
    credentials: body.credentials!.trim(),
    yearsExperience: Number(body.yearsExperience) || 0,
    languages: ["English"],
    clinic: body.clinic!.trim(),
    bio: body.bio?.trim() || "",
    consultFee: Number(body.consultFee) || 0,
    email,
    phone: body.phone!.trim(),
    registrationNumber: body.registrationNumber!.trim(),
    password: body.password,
  };

  doctorAccounts.push(account);

  return Response.json({ data: toPublicDoctorAccount(account) }, { status: 201 });
}
