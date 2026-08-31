export type BookingStep = "date" | "time" | "details" | "confirmed";

export type PatientDetails = {
  patientName: string;
  patientAge: string;
  reason: string;
};
