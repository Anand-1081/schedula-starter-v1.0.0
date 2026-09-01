"use client";
import { useCallback, useEffect, useState } from "react";
import {
  createAvailabilityRule,
  deleteAvailabilityRule,
  getAvailabilityRules,
} from "@/features/doctor-portal/api/doctor-portal-client";
import type { AvailabilityRule, Weekday } from "@/types/availability-rule";

type Status = "loading" | "ready" | "error";

export function useAvailabilityRules(doctorId: string | undefined) {
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [mutationError, setMutationError] = useState<string>();

  const reload = useCallback(() => {
    if (!doctorId) return;
    setStatus("loading");
    getAvailabilityRules(doctorId)
      .then((data) => {
        setRules(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [doctorId]);

  useEffect(() => {
    // reload() resets to loading and fetches; effect re-runs whenever the
    // reload callback's dependencies (doctorId) change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  const addRule = useCallback(
    async (input: { label: string; weekdays: Weekday[]; startTime: string; endTime: string; slotMinutes: number }) => {
      if (!doctorId) return;
      setMutationError(undefined);
      try {
        const created = await createAvailabilityRule({ doctorId, ...input });
        setRules((prev) => [...prev, created]);
      } catch (error) {
        setMutationError(error instanceof Error ? error.message : "Unable to add availability.");
        throw error;
      }
    },
    [doctorId],
  );

  const removeRule = useCallback(
    async (ruleId: string) => {
      if (!doctorId) return;
      await deleteAvailabilityRule(doctorId, ruleId);
      setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    },
    [doctorId],
  );

  return { rules, status, addRule, removeRule, mutationError };
}
