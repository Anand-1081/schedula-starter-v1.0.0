export type NotificationKind =
  | "booking"
  | "confirmation"
  | "reschedule"
  | "cancellation"
  | "reminder"
  | "missed"
  | "completed"
  | "prescription";

export type NotificationRecipient = "doctor" | "user";

export type AppNotification = {
  id: string;
  recipientType: NotificationRecipient;
  recipientId: string;
  bookingId?: string;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};
