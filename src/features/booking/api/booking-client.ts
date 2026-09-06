import type { Doctor } from "@/types/doctor";
import type { BookingConfirmation, BookingRequest, DayAvailability } from "@/types/booking";

export async function getDoctorById(doctorId: string): Promise<Doctor | undefined> {
  const response = await fetch("/api/doctors");
  if (!response.ok) throw new Error("Unable to load doctor");
  const body: { data: Doctor[] } = await response.json();
  return body.data.find((doctor) => doctor.id === doctorId);
}

export async function getAvailability(doctorId: string, date: string): Promise<DayAvailability> {
  const response = await fetch(`/api/doctors/${doctorId}/availability?date=${date}`);
  if (!response.ok) throw new Error("Unable to load availability");
  const body: { data: DayAvailability } = await response.json();
  return body.data;
}

export async function createBooking(request: BookingRequest): Promise<BookingConfirmation> {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Unable to confirm booking");
  return body.data as BookingConfirmation;
}
