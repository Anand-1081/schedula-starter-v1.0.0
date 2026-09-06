import type { DoctorSession, PublicDoctorAccount } from "@/types/doctor-account";
import type { AvailabilityRule, Weekday } from "@/types/availability-rule";
import type { BookingConfirmation } from "@/types/booking";
import type { RegistrationFormValues, ProfileFormValues } from "@/features/doctor-portal/types";

async function parse<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Something went wrong");
  return body.data as T;
}

export async function registerDoctor(values: RegistrationFormValues): Promise<PublicDoctorAccount> {
  const response = await fetch("/api/doctor/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: values.name,
      specialty: values.specialty,
      credentials: values.credentials,
      yearsExperience: Number(values.yearsExperience) || 0,
      registrationNumber: values.registrationNumber,
      clinic: values.clinic,
      bio: values.bio,
      consultFee: Number(values.consultFee) || 0,
      email: values.email,
      phone: values.phone,
      password: values.password,
    }),
  });
  return parse<PublicDoctorAccount>(response);
}

export async function loginDoctor(email: string, password: string): Promise<DoctorSession> {
  const response = await fetch("/api/doctor/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parse<DoctorSession>(response);
}

export async function getDoctorAppointments(doctorId: string): Promise<BookingConfirmation[]> {
  const response = await fetch(`/api/doctor/appointments?doctorId=${encodeURIComponent(doctorId)}`);
  return parse<BookingConfirmation[]>(response);
}

export type AppointmentActionPayload =
  | { action: "confirm" }
  | { action: "decline"; reason?: string }
  | { action: "cancel"; reason?: string }
  | { action: "reschedule"; date: string; time: string }
  | { action: "complete" }
  | { action: "missed" };

export async function updateAppointment(
  doctorId: string,
  bookingId: string,
  payload: AppointmentActionPayload,
): Promise<BookingConfirmation> {
  const response = await fetch(`/api/doctor/appointments/${bookingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doctorId, ...payload }),
  });
  return parse<BookingConfirmation>(response);
}

export async function getAvailabilityRules(doctorId: string): Promise<AvailabilityRule[]> {
  const response = await fetch(`/api/doctor/availability-rules?doctorId=${encodeURIComponent(doctorId)}`);
  return parse<AvailabilityRule[]>(response);
}

export async function createAvailabilityRule(rule: {
  doctorId: string;
  label: string;
  weekdays: Weekday[];
  startTime: string;
  endTime: string;
  slotMinutes: number;
}): Promise<AvailabilityRule> {
  const response = await fetch("/api/doctor/availability-rules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rule),
  });
  return parse<AvailabilityRule>(response);
}

export async function deleteAvailabilityRule(doctorId: string, ruleId: string): Promise<void> {
  const response = await fetch(`/api/doctor/availability-rules/${ruleId}?doctorId=${encodeURIComponent(doctorId)}`, {
    method: "DELETE",
  });
  await parse<{ deleted: boolean }>(response);
}

export async function updateDoctorProfile(
  doctorId: string,
  values: ProfileFormValues,
): Promise<PublicDoctorAccount> {
  const response = await fetch("/api/doctor/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      doctorId,
      name: values.name,
      specialty: values.specialty,
      credentials: values.credentials,
      yearsExperience: Number(values.yearsExperience) || 0,
      clinic: values.clinic,
      bio: values.bio,
      consultFee: Number(values.consultFee) || 0,
      phone: values.phone,
    }),
  });
  return parse<PublicDoctorAccount>(response);
}
