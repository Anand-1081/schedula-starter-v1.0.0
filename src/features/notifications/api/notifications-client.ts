import type { AppNotification, NotificationRecipient } from "@/types/notification";

async function parse<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Something went wrong");
  return body.data as T;
}

export async function getNotifications(
  recipientType: NotificationRecipient,
  recipientId: string,
): Promise<AppNotification[]> {
  const response = await fetch(
    `/api/notifications?recipientType=${recipientType}&recipientId=${encodeURIComponent(recipientId)}`,
  );
  return parse<AppNotification[]>(response);
}

export async function markNotificationRead(notificationId: string): Promise<AppNotification> {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ read: true }),
  });
  return parse<AppNotification>(response);
}

export async function markAllNotificationsRead(
  recipientType: NotificationRecipient,
  recipientId: string,
): Promise<void> {
  const response = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipientType, recipientId }),
  });
  await parse<{ ok: boolean }>(response);
}
