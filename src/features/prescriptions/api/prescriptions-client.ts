import type { BookingConfirmation } from "@/types/booking";
import type { Prescription, PrescriptionInput } from "@/types/prescription";

async function parse<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Something went wrong");
  return body.data as T;
}

export type DoctorPrescriptionEntry = {
  booking: BookingConfirmation;
  prescription: Prescription | null;
};

export async function getDoctorPrescriptions(doctorId: string): Promise<DoctorPrescriptionEntry[]> {
  const response = await fetch(`/api/doctor/prescriptions?doctorId=${encodeURIComponent(doctorId)}`);
  return parse<DoctorPrescriptionEntry[]>(response);
}

export async function saveDoctorPrescription(
  doctorId: string,
  bookingId: string,
  input: PrescriptionInput,
): Promise<Prescription> {
  const response = await fetch("/api/doctor/prescriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doctorId, bookingId, ...input }),
  });
  return parse<Prescription>(response);
}

export async function getPrescription(
  bookingId: string,
  opts: { doctorId?: string; patientId?: string },
): Promise<Prescription> {
  const params = new URLSearchParams();
  if (opts.doctorId) params.set("doctorId", opts.doctorId);
  if (opts.patientId) params.set("patientId", opts.patientId);
  const query = params.toString();
  const response = await fetch(`/api/prescriptions/${bookingId}${query ? `?${query}` : ""}`);
  return parse<Prescription>(response);
}
