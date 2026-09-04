"use client";
import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { BellIcon } from "@/components/ui/icons";
import type { NotificationRecipient } from "@/types/notification";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell({
  recipientType,
  recipientId,
}: {
  recipientType: NotificationRecipient;
  recipientId: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(recipientType, recipientId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!recipientId) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
        className="relative grid size-9 place-items-center rounded-full text-[var(--muted)] hover:bg-stone-100 hover:text-[var(--ink)]"
      >
        <BellIcon className="size-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-red-600 text-[9px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)]">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">You&apos;re all caught up.</p>
            )}
            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => markRead(item.id)}
                className={`flex w-full flex-col gap-0.5 border-b border-[var(--line)] px-4 py-3 text-left last:border-b-0 hover:bg-stone-50 ${
                  item.read ? "" : "bg-emerald-50/50"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  {!item.read && <span className="size-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />}
                  {item.title}
                </span>
                <span className="text-xs text-[var(--muted)]">{item.message}</span>
                <span className="mt-0.5 text-[11px] text-stone-400">{timeAgo(item.createdAt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
