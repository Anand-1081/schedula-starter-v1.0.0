import type { BookingConfirmation } from "@/types/booking";

async function parse<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Something went wrong");
  return body.data as T;
}

export async function getMyAppointments(userId: string): Promise<BookingConfirmation[]> {
  const response = await fetch(`/api/bookings?userId=${encodeURIComponent(userId)}`);
  return parse<BookingConfirmation[]>(response);
}

export async function submitReview(
  bookingId: string,
  userId: string,
  rating: number,
  comment: string,
): Promise<BookingConfirmation> {
  const response = await fetch(`/api/bookings/${bookingId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, rating, comment }),
  });
  return parse<BookingConfirmation>(response);
}
