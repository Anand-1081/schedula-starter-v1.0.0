"use client";
import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { AlertIcon } from "@/components/ui/icons";
import { formatLongDate } from "@/lib/utils/date";
import type { PublicPatientAccount } from "@/types/patient-account";
import type { PatientProfile, PatientProfileInput } from "@/types/patient-profile";
import type { TestReport } from "@/types/test-report";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ProfileFormValues = {
  name: string;
  email: string;
  phone: string;
} & PatientProfileInput;

function toFormValues(account: PublicPatientAccount, profile: PatientProfile): ProfileFormValues {
  return {
    name: account.name,
    email: account.email,
    phone: account.phone,
    dateOfBirth: profile.dateOfBirth ?? "",
    gender: profile.gender ?? "",
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    bloodGroup: profile.bloodGroup ?? "",
    medicalConditions: profile.medicalConditions ?? "",
    allergies: profile.allergies ?? "",
    currentMedications: profile.currentMedications ?? "",
    insuranceProvider: profile.insuranceProvider ?? "",
    insurancePolicyNumber: profile.insurancePolicyNumber ?? "",
    insuranceValidTill: profile.insuranceValidTill ?? "",
    emergencyContactName: profile.emergencyContactName ?? "",
    emergencyContactRelationship: profile.emergencyContactRelationship ?? "",
    emergencyContactPhone: profile.emergencyContactPhone ?? "",
  };
}

function Row({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value || value === 0 ? value : <span className="text-stone-400">Not added yet</span>}</dd>
    </div>
  );
}

export function ProfilePanel({
  account,
  profile,
  testReports,
  onSave,
}: {
  account: PublicPatientAccount;
  profile: PatientProfile;
  testReports: TestReport[];
  onSave: (values: ProfileFormValues) => Promise<unknown>;
}) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<ProfileFormValues>(() => toFormValues(account, profile));
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({});
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  function update<K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function startEditing() {
    setValues(toFormValues(account, profile));
    setErrors({});
    setFormError(undefined);
    setEditing(true);
  }

  async function handleSave() {
    const nextErrors: Partial<Record<keyof ProfileFormValues, string>> = {};
    if (!values.name.trim()) nextErrors.name = "Enter your name.";
    if (!values.email.trim() || !EMAIL_PATTERN.test(values.email)) nextErrors.email = "Enter a valid email.";
    if (!values.phone.trim()) nextErrors.phone = "Enter a phone number.";
    if (values.heightCm !== undefined && values.heightCm !== null && Number(values.heightCm) <= 0) {
      nextErrors.heightCm = "Enter a valid height.";
    }
    if (values.weightKg !== undefined && values.weightKg !== null && Number(values.weightKg) <= 0) {
      nextErrors.weightKg = "Enter a valid weight.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setFormError(undefined);
    try {
      await onSave(values);
      setEditing(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">View your details, or update anything that&apos;s changed.</p>
          <Button variant="secondary" onClick={startEditing}>
            Edit profile
          </Button>
        </div>

        <Section title="Personal information">
          <Row label="Full name" value={account.name} />
          <Row label="Email" value={account.email} />
          <Row label="Phone" value={account.phone} />
        </Section>

        <Section title="Physical details">
          <Row label="Date of birth" value={profile.dateOfBirth ? formatLongDate(profile.dateOfBirth) : undefined} />
          <Row label="Gender" value={profile.gender} />
          <Row label="Height" value={profile.heightCm ? `${profile.heightCm} cm` : undefined} />
          <Row label="Weight" value={profile.weightKg ? `${profile.weightKg} kg` : undefined} />
          <Row label="Blood group" value={profile.bloodGroup} />
        </Section>

        <Section title="Medical conditions & allergies">
          <Row label="Medical conditions" value={profile.medicalConditions} />
          <Row label="Allergies" value={profile.allergies} />
        </Section>

        <Section title="Current medications">
          <Row label="Medications" value={profile.currentMedications} />
        </Section>

        <Section title="Insurance details">
          <Row label="Provider" value={profile.insuranceProvider} />
          <Row label="Policy number" value={profile.insurancePolicyNumber} />
          <Row label="Valid till" value={profile.insuranceValidTill ? formatLongDate(profile.insuranceValidTill) : undefined} />
        </Section>

        <Section title="Emergency contact">
          <Row label="Name" value={profile.emergencyContactName} />
          <Row label="Relationship" value={profile.emergencyContactRelationship} />
          <Row label="Phone" value={profile.emergencyContactPhone} />
        </Section>

        {testReports.length > 0 && (
          <Section title="Recent test reports">
            <ul className="col-span-2 divide-y divide-[var(--line)]">
              {testReports.map((report) => (
                <li key={report.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    {report.title} <span className="text-[var(--muted)]">&middot; {report.category}</span>
                  </span>
                  <span className="text-[var(--muted)]">{formatLongDate(report.date)}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {formError && (
        <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-800">
          <AlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <FormSection title="Personal information">
        <Field label="Full name" value={values.name} onChange={(e) => update("name", e.target.value)} error={errors.name} />
        <Field label="Email" type="email" value={values.email} onChange={(e) => update("email", e.target.value)} error={errors.email} />
        <Field label="Phone" type="tel" value={values.phone} onChange={(e) => update("phone", e.target.value)} error={errors.phone} />
      </FormSection>

      <FormSection title="Physical details">
        <Field label="Date of birth" type="date" value={values.dateOfBirth ?? ""} onChange={(e) => update("dateOfBirth", e.target.value)} />
        <SelectField
          label="Gender"
          value={values.gender ?? ""}
          onChange={(value) => update("gender", value)}
          options={["", "Female", "Male", "Other", "Prefer not to say"]}
        />
        <Field
          label="Height (cm)"
          type="number"
          value={values.heightCm ?? ""}
          onChange={(e) => update("heightCm", e.target.value ? Number(e.target.value) : undefined)}
          error={errors.heightCm}
        />
        <Field
          label="Weight (kg)"
          type="number"
          value={values.weightKg ?? ""}
          onChange={(e) => update("weightKg", e.target.value ? Number(e.target.value) : undefined)}
          error={errors.weightKg}
        />
        <SelectField
          label="Blood group"
          value={values.bloodGroup ?? ""}
          onChange={(value) => update("bloodGroup", value)}
          options={["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
        />
      </FormSection>

      <FormSection title="Medical conditions & allergies">
        <TextareaField label="Medical conditions" value={values.medicalConditions ?? ""} onChange={(value) => update("medicalConditions", value)} placeholder="e.g. Asthma, Hypertension" />
        <TextareaField label="Allergies" value={values.allergies ?? ""} onChange={(value) => update("allergies", value)} placeholder="e.g. Penicillin, Peanuts" />
      </FormSection>

      <FormSection title="Current medications">
        <TextareaField label="Medications" value={values.currentMedications ?? ""} onChange={(value) => update("currentMedications", value)} placeholder="e.g. Metformin 500mg once daily" />
      </FormSection>

      <FormSection title="Insurance details">
        <Field label="Provider" value={values.insuranceProvider ?? ""} onChange={(e) => update("insuranceProvider", e.target.value)} />
        <Field label="Policy number" value={values.insurancePolicyNumber ?? ""} onChange={(e) => update("insurancePolicyNumber", e.target.value)} />
        <Field label="Valid till" type="date" value={values.insuranceValidTill ?? ""} onChange={(e) => update("insuranceValidTill", e.target.value)} />
      </FormSection>

      <FormSection title="Emergency contact">
        <Field label="Name" value={values.emergencyContactName ?? ""} onChange={(e) => update("emergencyContactName", e.target.value)} />
        <Field label="Relationship" value={values.emergencyContactRelationship ?? ""} onChange={(e) => update("emergencyContactRelationship", e.target.value)} />
        <Field label="Phone" type="tel" value={values.emergencyContactPhone ?? ""} onChange={(e) => update("emergencyContactPhone", e.target.value)} />
      </FormSection>

      <div className="flex gap-2.5">
        <Button onClick={handleSave} loading={saving}>
          Save changes
        </Button>
        <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-5">
      <h2 className="font-semibold">{title}</h2>
      <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</dl>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-5">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--ink)]">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option || "Select"}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:col-span-2">
      <label className="text-sm font-medium text-[var(--ink)]">{label}</label>
      <textarea
        rows={2}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
      />
    </div>
  );
}
