export type Slot = {
  time: string; // "09:00"
  available: boolean;
};

export type DayAvailability = {
  doctorId: string;
  date: string; // ISO date, e.g. "2026-08-31"
  slots: Slot[];
};

export type BookingRequest = {
  doctorId: string;
  date: string;
  time: string;
  patientName: string;
  patientAge: number;
  reason: string;
};

export type AppointmentStatus = "pending" | "confirmed";

export type BookingConfirmation = {
  id: string;
  confirmationCode: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  date: string;
  time: string;
  patientName: string;
  patientAge: number;
  reason: string;
  createdAt: string;
  status: AppointmentStatus;
};
