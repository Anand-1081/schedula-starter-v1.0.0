"use client";
import { useCallback, useEffect, useState } from "react";
import {
  getPatientProfile,
  getPatientSummary,
  getPatientTestReports,
  updatePatientProfile,
  type PatientSummary,
} from "@/features/patient/api/patient-profile-client";
import type { PatientProfile, PatientProfileInput } from "@/types/patient-profile";
import type { TestReport } from "@/types/test-report";

type Status = "loading" | "ready" | "error";

export function usePatientProfile(patientId: string | undefined) {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [testReports, setTestReports] = useState<TestReport[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [saveError, setSaveError] = useState<string>();

  const reload = useCallback(() => {
    if (!patientId) return;
    setStatus("loading");
    Promise.all([getPatientProfile(patientId), getPatientSummary(patientId), getPatientTestReports(patientId)])
      .then(([profileData, summaryData, reportsData]) => {
        setProfile(profileData);
        setSummary(summaryData);
        setTestReports(reportsData);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [patientId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  const saveProfile = useCallback(
    async (fields: Partial<PatientProfileInput>) => {
      if (!patientId) return;
      setSaveError(undefined);
      try {
        const updated = await updatePatientProfile(patientId, fields);
        setProfile(updated);
        return updated;
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Unable to save your profile.");
        throw error;
      }
    },
    [patientId],
  );

  return { profile, summary, testReports, status, reload, saveProfile, saveError };
}
