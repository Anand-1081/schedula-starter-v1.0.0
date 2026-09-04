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
  userId?: string;
};

// "pending"    - booked by a user, awaiting the doctor's confirmation
// "confirmed"  - doctor confirmed; counts as "upcoming" while in the future
// "cancelled"  - declined by the doctor, or cancelled by the doctor/user
// "completed"  - the visit happened and the doctor marked it done
// "missed"     - the visit time passed and the patient didn't show
export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed" | "missed";

export type RescheduleEntry = {
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  at: string;
};

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
  userId?: string;
  cancelledBy?: "doctor" | "user";
  cancelReason?: string;
  rescheduleHistory?: RescheduleEntry[];
  prescriptionAvailable?: boolean;
  prescriptionNotes?: string;
  prescriptionIssuedAt?: string;
  reviewed?: boolean;
  reviewRating?: number;
  reviewComment?: string;
};
