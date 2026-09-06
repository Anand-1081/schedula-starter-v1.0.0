"use client";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { AlertIcon } from "@/components/ui/icons";
import { usePatientSession } from "@/features/patient/hooks/use-patient-session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = { email?: string; password?: string };

function validate(email: string, password: string): Errors {
  const errors: Errors = {};
  if (!email.trim()) errors.email = "Enter your email.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

export function PatientLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = usePatientSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    setFormError(undefined);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signIn(email, password);
      router.push(searchParams.get("next") || "/patient/dashboard");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && (
        <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-800">
          <AlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <Field
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        placeholder="you@example.com"
      />
      <Field
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />

      <Button type="submit" loading={submitting} className="w-full">
        {submitting ? "Signing in" : "Sign in"}
      </Button>

      <p className="text-center text-xs text-[var(--muted)]">Demo access &mdash; asha@example.com / patient123</p>
    </form>
  );
}
