export type PatientProfile = {
  patientId: string;
  dateOfBirth?: string;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  bloodGroup?: string;
  medicalConditions?: string;
  allergies?: string;
  currentMedications?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceValidTill?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  updatedAt?: string;
};

export type PatientProfileInput = Omit<PatientProfile, "patientId" | "updatedAt">;
