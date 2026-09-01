import { doctors as seedDoctors } from "@/lib/mock-data/doctors";
import type { DoctorAccount, PublicDoctorAccount } from "@/types/doctor-account";
import type { AvailabilityRule } from "@/types/availability-rule";
import type { BookingConfirmation } from "@/types/booking";

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
  const handle = doctor.id.replace(/^doc-/, "").replace(/-\d+$/, "");
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
