import { doctors as seedDoctors } from "@/lib/mock-data/doctors";
import type { DoctorAccount, PublicDoctorAccount } from "@/types/doctor-account";
import type { AvailabilityRule } from "@/types/availability-rule";
import type { BookingConfirmation } from "@/types/booking";
import type { AppNotification, NotificationKind, NotificationRecipient } from "@/types/notification";
import type { PatientAccount, PublicPatientAccount } from "@/types/patient-account";
import type { Prescription } from "@/types/prescription";
import type { PatientProfile } from "@/types/patient-profile";
import type { TestReport } from "@/types/test-report";

/**
 * In-memory mock "database" for the whole app. This starter has no real
 * database or persistence layer, so this module is the single source of
 * truth at runtime: it holds doctor accounts, the recurring availability
 * rules doctors configure, and every booking made through either portal.
 *
 * Important: this resets whenever the dev server restarts (or on most hot
 * reloads of this file). That's expected for a mock backend — swap this
 * module out for real database calls when wiring up a persistence layer.
 */

function seedAccount(doctor: (typeof seedDoctors)[number], index: number): DoctorAccount {
  const handle = doctor.id.replace(/^doc-/, "");
  return {
    ...doctor,
    email: `${handle.replace(/-/g, ".")}@schedula.clinic`,
    phone: `9${(700000000 + index * 111111).toString().slice(0, 9)}`,
    registrationNumber: `MCI-${20000 + index}`,
    password: "doctor123",
  };
}

export const doctorAccounts: DoctorAccount[] = seedDoctors.map(seedAccount);

// Seed weekday clinic-hours rules (with a lunch gap) for every seeded doctor
// so the Day 1 booking demo keeps working without any manual setup. Doctors
// registered later start with no rules until they configure some in Profile.
export const availabilityRules: AvailabilityRule[] = seedDoctors.flatMap((doctor) => [
  {
    id: `rule-${doctor.id}-am`,
    doctorId: doctor.id,
    label: "Weekday mornings",
    weekdays: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "13:00",
    slotMinutes: 30,
  },
  {
    id: `rule-${doctor.id}-pm`,
    doctorId: doctor.id,
    label: "Weekday afternoons",
    weekdays: [1, 2, 3, 4, 5],
    startTime: "14:00",
    endTime: "17:00",
    slotMinutes: 30,
  },
]);

export const bookings: BookingConfirmation[] = [];

// Patients are a separate account type from clinic staff (`users.ts`) and
// doctors (`doctorAccounts` above) — they self-register through the patient
// portal. One demo account is seeded so the flow can be tried immediately.
export const patientAccounts: PatientAccount[] = [
  {
    id: "pat-01",
    name: "Asha Kapoor",
    initials: "AK",
    email: "asha@example.com",
    phone: "9812345678",
    password: "patient123",
  },
];

export function toPublicPatientAccount(account: PatientAccount): PublicPatientAccount {
  return {
    id: account.id,
    name: account.name,
    initials: account.initials,
    email: account.email,
    phone: account.phone,
  };
}

// Structured prescriptions, one per completed booking (keyed by bookingId).
// `BookingConfirmation.prescriptionAvailable` stays as a quick flag for list
// views; the full diagnosis/medicines/instructions live here.
export const prescriptions: Prescription[] = [];

export function getPrescriptionByBooking(bookingId: string): Prescription | undefined {
  return prescriptions.find((item) => item.bookingId === bookingId);
}

// Extended patient profile info (physical details, medical history,
// insurance, emergency contact) — separate from the account/credentials
// record so it can be filled in gradually after registration.
export const patientProfiles: PatientProfile[] = [];

export function getOrCreatePatientProfile(patientId: string): PatientProfile {
  let profile = patientProfiles.find((item) => item.patientId === patientId);
  if (!profile) {
    profile = { patientId };
    patientProfiles.push(profile);
  }
  return profile;
}

// Mock test-report records, purely so the patient profile's summary card
// has something real to count. No upload flow exists yet.
export const testReports: TestReport[] = [
  { id: "tr-01", patientId: "pat-01", title: "Complete Blood Count", category: "Pathology", date: "2026-07-12", status: "ready" },
  { id: "tr-02", patientId: "pat-01", title: "Lipid Profile", category: "Pathology", date: "2026-08-02", status: "ready" },
];

/**
 * Notifications for both portals. Like `bookings`, this is in-memory only
 * and resets on server restart. Every appointment-lifecycle mutation
 * (booking, confirming, declining, cancelling, rescheduling, completing,
 * marking missed, adding a prescription) should call `addNotification` so
 * the recipient's bell stays in sync with the appointment state.
 */
export const notifications: AppNotification[] = [];

export function addNotification(input: {
  recipientType: NotificationRecipient;
  recipientId: string;
  bookingId?: string;
  kind: NotificationKind;
  title: string;
  message: string;
}): AppNotification {
  const notification: AppNotification = {
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...input,
  };
  notifications.push(notification);
  return notification;
}

export function toPublicDoctorAccount(account: DoctorAccount): PublicDoctorAccount {
  return {
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
    email: account.email,
    phone: account.phone,
    registrationNumber: account.registrationNumber,
  };
}
