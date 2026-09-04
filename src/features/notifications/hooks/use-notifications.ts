"use client";
import { useCallback, useEffect, useState } from "react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/api/notifications-client";
import type { AppNotification, NotificationRecipient } from "@/types/notification";

export function useNotifications(recipientType: NotificationRecipient, recipientId: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const reload = useCallback(() => {
    if (!recipientId) return;
    getNotifications(recipientType, recipientId)
      .then((data) => {
        setNotifications(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [recipientType, recipientId]);

  useEffect(() => {
    reload();
    if (!recipientId) return;
    const interval = window.setInterval(reload, 20000);
    return () => window.clearInterval(interval);
  }, [reload, recipientId]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    try {
      await markNotificationRead(id);
    } catch {
      // Best-effort; the periodic reload will reconcile state.
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!recipientId) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    try {
      await markAllNotificationsRead(recipientType, recipientId);
    } catch {
      // Best-effort.
    }
  }, [recipientType, recipientId]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  return { notifications, status, unreadCount, reload, markRead, markAllRead };
}
