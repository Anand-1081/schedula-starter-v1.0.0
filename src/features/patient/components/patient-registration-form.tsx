"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { AlertIcon } from "@/components/ui/icons";
import { registerPatient } from "@/features/patient/api/patient-client";
import { usePatientSession } from "@/features/patient/hooks/use-patient-session";
import type { PatientRegistrationValues } from "@/features/patient/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Errors = Partial<Record<keyof PatientRegistrationValues, string>>;

function validate(values: PatientRegistrationValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your full name.";
  if (!values.email.trim()) errors.email = "Enter your email.";
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = "Enter a valid email address.";
  if (!values.phone.trim()) errors.phone = "Enter a phone number.";
  if (!values.password) errors.password = "Choose a password.";
  else if (values.password.length < 6) errors.password = "Password must be at least 6 characters.";
  if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords don't match.";
  return errors;
}

export function PatientRegistrationForm() {
  const router = useRouter();
  const { signIn } = usePatientSession();
  const [values, setValues] = useState<PatientRegistrationValues>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof PatientRegistrationValues>(key: K, value: string) {
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
      await registerPatient(values);
      await signIn(values.email, values.password);
      router.push("/patient/dashboard");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {formError && (
        <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-800">
          <AlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <Field label="Full name" value={values.name} onChange={(event) => update("name", event.target.value)} error={errors.name} placeholder="Asha Kapoor" />
      <Field label="Email" type="email" autoComplete="email" value={values.email} onChange={(event) => update("email", event.target.value)} error={errors.email} placeholder="you@example.com" />
      <Field label="Phone" type="tel" value={values.phone} onChange={(event) => update("phone", event.target.value)} error={errors.phone} placeholder="98765 43210" />
      <Field label="Password" type="password" autoComplete="new-password" value={values.password} onChange={(event) => update("password", event.target.value)} error={errors.password} />
      <Field label="Confirm password" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} error={errors.confirmPassword} />

      <Button type="submit" loading={submitting} className="mt-1 w-full">
        {submitting ? "Creating account" : "Create account"}
      </Button>
    </form>
  );
}
