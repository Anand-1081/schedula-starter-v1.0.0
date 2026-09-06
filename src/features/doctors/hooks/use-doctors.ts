"use client";
import { useEffect, useState } from "react";
import { getDoctors } from "@/features/doctors/api/doctors-client";
import type { Doctor } from "@/types/doctor";

type Status = "loading" | "ready" | "error";

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    getDoctors()
      .then((data) => {
        if (cancelled) return;
        setDoctors(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { doctors, status };
}
