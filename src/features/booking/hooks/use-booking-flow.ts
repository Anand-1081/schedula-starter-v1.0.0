"use client";
import { useCallback, useEffect, useState } from "react";
import { createBooking, getAvailability, getDoctorById } from "@/features/booking/api/booking-client";
import { usePatientSession } from "@/features/patient/hooks/use-patient-session";
import { toIsoDate } from "@/lib/utils/date";
import type { Doctor } from "@/types/doctor";
import type { BookingConfirmation, DayAvailability } from "@/types/booking";
import type { BookingStep, PatientDetails } from "@/features/booking/types";

type LoadStatus = "loading" | "ready" | "error";

export function useBookingFlow(doctorId: string) {
  const { session } = usePatientSession();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [doctorStatus, setDoctorStatus] = useState<LoadStatus>("loading");

  const [step, setStep] = useState<BookingStep>("date");
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()));
  const [selectedTime, setSelectedTime] = useState<string>();

  const [availability, setAvailability] = useState<DayAvailability | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<LoadStatus>("loading");

  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Reset to loading immediately so the doctorId change (route param)
    // shows a skeleton instead of stale doctor data while refetching.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDoctorStatus("loading");
    getDoctorById(doctorId)
      .then((found) => {
        if (cancelled) return;
        setDoctor(found ?? null);
        setDoctorStatus(found ? "ready" : "error");
      })
      .catch(() => !cancelled && setDoctorStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  useEffect(() => {
    let cancelled = false;
    // Reset to loading and clear the stale time selection immediately when
    // the date changes, so the slot grid shows a skeleton instead of the
    // previous date's slots while the new availability loads.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvailabilityStatus("loading");
    setSelectedTime(undefined);
    getAvailability(doctorId, selectedDate)
      .then((data) => {
        if (cancelled) return;
        setAvailability(data);
        setAvailabilityStatus("ready");
      })
      .catch(() => !cancelled && setAvailabilityStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [doctorId, selectedDate]);

  const chooseDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const chooseTime = useCallback((time: string) => {
    setSelectedTime(time);
    setStep("details");
  }, []);

  const goToStep = useCallback((next: BookingStep) => setStep(next), []);

  const submitBooking = useCallback(
    async (details: PatientDetails) => {
      if (!selectedTime) return;
      setSubmitting(true);
      setSubmitError(undefined);
      try {
        const result = await createBooking({
          doctorId,
          date: selectedDate,
          time: selectedTime,
          patientName: details.patientName,
          patientAge: Number(details.patientAge) || 0,
          reason: details.reason,
          userId: session?.patient.id,
        });
        setConfirmation(result);
        setStep("confirmed");
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Unable to confirm booking.");
      } finally {
        setSubmitting(false);
      }
    },
    [doctorId, selectedDate, selectedTime, session],
  );

  return {
    doctor,
    doctorStatus,
    step,
    goToStep,
    selectedDate,
    chooseDate,
    selectedTime,
    chooseTime,
    availability,
    availabilityStatus,
    confirmation,
    submitError,
    submitting,
    submitBooking,
  };
}
