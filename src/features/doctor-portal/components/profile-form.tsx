"use client";
import { useState, type FormEvent } from "react";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { AlertIcon, CheckIcon } from "@/components/ui/icons";
import { updateDoctorProfile } from "@/features/doctor-portal/api/doctor-portal-client";
import { useDoctorSession } from "@/features/doctor-portal/hooks/use-doctor-session";
import type { PublicDoctorAccount } from "@/types/doctor-account";
import type { ProfileFormValues } from "@/features/doctor-portal/types";

type Errors = Partial<Record<keyof ProfileFormValues, string>>;

function toFormValues(doctor: PublicDoctorAccount): ProfileFormValues {
  return {
    name: doctor.name,
    specialty: doctor.specialty,
    credentials: doctor.credentials,
    yearsExperience: String(doctor.yearsExperience),
    clinic: doctor.clinic,
    bio: doctor.bio,
    consultFee: String(doctor.consultFee),
    phone: doctor.phone,
  };
}

function validate(values: ProfileFormValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your full name.";
  if (!values.specialty.trim()) errors.specialty = "Enter your specialty.";
  if (!values.credentials.trim()) errors.credentials = "Enter your qualifications.";
  const years = Number(values.yearsExperience);
  if (!Number.isInteger(years) || years < 0 || years > 60) errors.yearsExperience = "Enter a valid number of years.";
  if (!values.clinic.trim()) errors.clinic = "Enter your clinic location.";
  const fee = Number(values.consultFee);
  if (Number.isNaN(fee) || fee <= 0) errors.consultFee = "Enter a valid fee.";
  if (!values.phone.trim()) errors.phone = "Enter a phone number.";
  return errors;
}

export function ProfileForm() {
  const { session, updateDoctor } = useDoctorSession();
  const [values, setValues] = useState<ProfileFormValues>(() =>
    session ? toFormValues(session.doctor) : { name: "", specialty: "", credentials: "", yearsExperience: "", clinic: "", bio: "", consultFee: "", phone: "" },
  );
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof ProfileFormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError(undefined);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const updated = await updateDoctorProfile(session.doctor.id, values);
      updateDoctor(updated);
      setSaved(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save changes.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) return null;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 rounded-xl border border-[var(--line)] bg-white p-5">
      {formError && (
        <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-800">
          <AlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
          <CheckIcon className="size-4 shrink-0" aria-hidden="true" />
          <span>Profile updated.</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" value={values.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
        <Field label="Specialty" value={values.specialty} onChange={(e) => set("specialty", e.target.value)} error={errors.specialty} />
        <Field label="Qualifications" value={values.credentials} onChange={(e) => set("credentials", e.target.value)} error={errors.credentials} />
        <Field label="Years of experience" type="number" min={0} max={60} value={values.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value)} error={errors.yearsExperience} />
        <Field label="Consultation fee (&#8377;)" type="number" min={0} value={values.consultFee} onChange={(e) => set("consultFee", e.target.value)} error={errors.consultFee} />
        <Field label="Phone" type="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />
      </div>
      <Field label="Clinic location" value={values.clinic} onChange={(e) => set("clinic", e.target.value)} error={errors.clinic} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-bio" className="text-sm font-medium text-[var(--ink)]">
          Short bio
        </label>
        <textarea
          id="profile-bio"
          rows={3}
          value={values.bio}
          onChange={(e) => set("bio", e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
        />
      </div>

      <Button type="submit" loading={submitting} className="w-full sm:w-fit">
        {submitting ? "Saving" : "Save changes"}
      </Button>
    </form>
  );
}
