"use client";
import { useMemo, useRef, useState } from "react";
import { AppointmentDetailDialog } from "@/features/doctor-portal/components/appointment-detail-dialog";
import { STATUS_STYLES } from "@/features/doctor-portal/components/appointment-row";
import type { AppointmentActionPayload } from "@/features/doctor-portal/api/doctor-portal-client";
import { formatTime12h, isPastMoment, toIsoDate } from "@/lib/utils/date";
import type { BookingConfirmation } from "@/types/booking";
import type { Slot } from "@/types/booking";

type Props = {
  dates: Date[];
  appointments: BookingConfirmation[];
  availabilityByDate: Record<string, Slot[]>;
  loading: boolean;
  onAction: (bookingId: string, payload: AppointmentActionPayload) => Promise<unknown>;
};

const DAY_LABEL = new Intl.DateTimeFormat("en", { weekday: "short" });
const DAY_NUM = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });

export function CalendarGrid({ dates, appointments, availabilityByDate, loading, onAction }: Props) {
  const [selected, setSelected] = useState<BookingConfirmation | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [dropError, setDropError] = useState<string>();
  const draggedId = useRef<string | null>(null);

  const isoDates = dates.map((date) => toIsoDate(date));
  const isoKey = isoDates.join(",");

  // Union of every time that appears either as a working-hours slot or an
  // existing appointment across the visible dates, so week view rows line up.
  const times = useMemo(() => {
    const set = new Set<string>();
    for (const iso of isoDates) {
      for (const slot of availabilityByDate[iso] ?? []) set.add(slot.time);
    }
    for (const item of appointments) {
      if (isoDates.includes(item.date)) set.add(item.time);
    }
    return Array.from(set).sort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isoKey, availabilityByDate, appointments]);

  function appointmentAt(iso: string, time: string) {
    return appointments.find((item) => item.date === iso && item.time === time);
  }

  function slotAt(iso: string, time: string) {
    return (availabilityByDate[iso] ?? []).find((slot) => slot.time === time);
  }

  async function handleDrop(iso: string, time: string) {
    setDragOverKey(null);
    setDropError(undefined);
    const bookingId = draggedId.current;
    draggedId.current = null;
    if (!bookingId) return;
    const slot = slotAt(iso, time);
    const existing = appointmentAt(iso, time);
    if (existing || !slot || !slot.available) {
      setDropError("That slot isn't available.");
      return;
    }
    try {
      await onAction(bookingId, { action: "reschedule", date: iso, time });
    } catch (error) {
      setDropError(error instanceof Error ? error.message : "Unable to reschedule.");
    }
  }

  const openAppointment = selected ? appointments.find((item) => item.id === selected.id) ?? selected : null;

  if (times.length === 0 && !loading) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-white p-10 text-center text-sm text-[var(--muted)]">
        No availability configured for this range yet. Add hours from your Profile page.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
      {dropError && (
        <div role="alert" className="border-b border-[var(--line)] bg-red-50 px-4 py-2 text-sm text-red-800">
          {dropError}
        </div>
      )}
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[640px]"
          style={{ gridTemplateColumns: `5.5rem repeat(${dates.length}, minmax(7.5rem, 1fr))` }}
        >
          <div className="border-b border-r border-[var(--line)] bg-stone-50" />
          {dates.map((date, index) => (
            <div key={index} className="border-b border-r border-[var(--line)] bg-stone-50 px-2 py-2 text-center last:border-r-0">
              <p className="text-xs font-medium text-[var(--muted)]">{DAY_LABEL.format(date)}</p>
              <p className="text-sm font-semibold">{DAY_NUM.format(date)}</p>
            </div>
          ))}

          {times.map((time) => (
            <FragmentRow
              key={time}
              time={time}
              isoDates={isoDates}
              appointmentAt={appointmentAt}
              slotAt={slotAt}
              dragOverKey={dragOverKey}
              setDragOverKey={setDragOverKey}
              onDragStart={(id) => (draggedId.current = id)}
              onDrop={handleDrop}
              onOpen={setSelected}
            />
          ))}
        </div>
      </div>

      {openAppointment && (
        <AppointmentDetailDialog
          appointment={openAppointment}
          onClose={() => setSelected(null)}
          onAction={(payload) => onAction(openAppointment.id, payload)}
        />
      )}
    </div>
  );
}

function FragmentRow({
  time,
  isoDates,
  appointmentAt,
  slotAt,
  dragOverKey,
  setDragOverKey,
  onDragStart,
  onDrop,
  onOpen,
}: {
  time: string;
  isoDates: string[];
  appointmentAt: (iso: string, time: string) => BookingConfirmation | undefined;
  slotAt: (iso: string, time: string) => Slot | undefined;
  dragOverKey: string | null;
  setDragOverKey: (key: string | null) => void;
  onDragStart: (id: string) => void;
  onDrop: (iso: string, time: string) => void;
  onOpen: (appointment: BookingConfirmation) => void;
}) {
  return (
    <>
      <div className="border-b border-r border-[var(--line)] px-2 py-2 text-right font-mono text-xs text-[var(--muted)]">
        {formatTime12h(time)}
      </div>
      {isoDates.map((iso) => {
        const appointment = appointmentAt(iso, time);
        const slot = slotAt(iso, time);
        const cellKey = `${iso}-${time}`;
        const isDragOver = dragOverKey === cellKey;
        const isDroppable = !appointment && slot?.available;
        const isDraggable =
          appointment && (appointment.status === "pending" || appointment.status === "confirmed") && !isPastMoment(iso, time);
        const isReadOnly = appointment && !isDraggable;

        return (
          <div
            key={iso}
            className={`min-h-14 border-b border-r border-[var(--line)] p-1 last:border-r-0 ${
              isDroppable ? "bg-emerald-50/30" : !slot && !appointment ? "bg-stone-50" : ""
            } ${isDragOver ? "ring-2 ring-inset ring-[var(--brand)]" : ""}`}
            onDragOver={(event) => {
              if (isDroppable) {
                event.preventDefault();
                setDragOverKey(cellKey);
              }
            }}
            onDragLeave={() => setDragOverKey(dragOverKey === cellKey ? null : dragOverKey)}
            onDrop={(event) => {
              event.preventDefault();
              onDrop(iso, time);
            }}
          >
            {appointment ? (
              <button
                type="button"
                draggable={Boolean(isDraggable)}
                onDragStart={() => isDraggable && onDragStart(appointment.id)}
                onClick={() => onOpen(appointment)}
                title={isReadOnly ? "Read-only" : "Drag to reschedule, or click for details"}
                className={`w-full rounded-md px-2 py-1.5 text-left text-xs ring-1 ring-inset ${STATUS_STYLES[appointment.status]} ${
                  isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                }`}
              >
                <p className="truncate font-semibold">{appointment.patientName}</p>
                <p className="truncate capitalize">{appointment.status}</p>
              </button>
            ) : slot?.available ? (
              <span className="flex h-full items-center justify-center text-[11px] text-emerald-700/70">Open</span>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
