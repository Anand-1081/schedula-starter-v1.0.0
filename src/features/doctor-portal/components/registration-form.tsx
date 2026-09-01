"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { AlertIcon } from "@/components/ui/icons";
import { registerDoctor } from "@/features/doctor-portal/api/doctor-portal-client";
import type { RegistrationFormValues } from "@/features/doctor-portal/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9]{10}$/;

const EMPTY_VALUES: RegistrationFormValues = {
  name: "",
  specialty: "",
  credentials: "",
  yearsExperience: "",
  registrationNumber: "",
  clinic: "",
  bio: "",
  consultFee: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

type Errors = Partial<Record<keyof RegistrationFormValues, string>>;

function validate(values: RegistrationFormValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your full name.";
  if (!values.specialty.trim()) errors.specialty = "Enter your specialty.";
  if (!values.credentials.trim()) errors.credentials = "Enter your qualifications, e.g. MBBS, MD.";
  const years = Number(values.yearsExperience);
  if (!values.yearsExperience) errors.yearsExperience = "Enter years of experience.";
  else if (!Number.isInteger(years) || years < 0 || years > 60) errors.yearsExperience = "Enter a valid number of years.";
  if (!values.registrationNumber.trim()) errors.registrationNumber = "Enter your medical registration number.";
  if (!values.clinic.trim()) errors.clinic = "Enter your clinic location, e.g. Room 12, First floor.";
  const fee = Number(values.consultFee);
  if (!values.consultFee) errors.consultFee = "Enter your consultation fee.";
  else if (Number.isNaN(fee) || fee <= 0) errors.consultFee = "Enter a valid fee.";
  if (!values.email.trim()) errors.email = "Enter your email.";
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = "Enter a valid email address.";
  if (!values.phone.trim()) errors.phone = "Enter your phone number.";
  else if (!PHONE_PATTERN.test(values.phone.replace(/\D/g, ""))) errors.phone = "Enter a 10-digit phone number.";
  if (!values.password) errors.password = "Create a password.";
  else if (values.password.length < 6) errors.password = "Password must be at least 6 characters.";
  if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords don't match.";
  return errors;
}

export function RegistrationForm() {
  const router = useRouter();
  const [values, setValues] = useState<RegistrationFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof RegistrationFormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError(undefined);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await registerDoctor(values);
      router.push("/doctor/login");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to register.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      {formError && (
        <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-800">
          <AlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <fieldset className="flex flex-col gap-4">
        <legend className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Personal</legend>
        <Field label="Full name" value={values.name} onChange={(e) => set("name", e.target.value)} error={errors.name} placeholder="Dr. Asha Menon" />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Professional</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Specialty" value={values.specialty} onChange={(e) => set("specialty", e.target.value)} error={errors.specialty} placeholder="General medicine" />
          <Field label="Qualifications" value={values.credentials} onChange={(e) => set("credentials", e.target.value)} error={errors.credentials} placeholder="MBBS, MD" />
          <Field label="Years of experience" type="number" min={0} max={60} value={values.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value)} error={errors.yearsExperience} placeholder="8" />
          <Field label="Registration number" value={values.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} error={errors.registrationNumber} placeholder="MCI-12345" />
          <Field label="Consultation fee (&#8377;)" type="number" min={0} value={values.consultFee} onChange={(e) => set("consultFee", e.target.value)} error={errors.consultFee} placeholder="600" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="bio" className="text-sm font-medium text-[var(--ink)]">
            Short bio <span className="font-normal text-[var(--muted)]">(optional)</span>
          </label>
          <textarea
            id="bio"
            rows={3}
            value={values.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="What you treat, who you typically see"
            className="rounded-lg border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Contact</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Work email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} error={errors.email} placeholder="you@schedula.clinic" />
          <Field label="Phone" type="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} placeholder="9876543210" />
        </div>
        <Field label="Clinic location" value={values.clinic} onChange={(e) => set("clinic", e.target.value)} error={errors.clinic} placeholder="Room 12 · First floor" />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Account</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" type="password" value={values.password} onChange={(e) => set("password", e.target.value)} error={errors.password} />
          <Field label="Confirm password" type="password" value={values.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} error={errors.confirmPassword} />
        </div>
      </fieldset>

      <Button type="submit" loading={submitting} className="w-full sm:w-fit">
        {submitting ? "Creating account" : "Create account"}
      </Button>
    </form>
  );
}
