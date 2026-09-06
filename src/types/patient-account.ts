export type PatientAccount = {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  password: string;
};

export type PublicPatientAccount = Omit<PatientAccount, "password">;

export type PatientSession = {
  patient: PublicPatientAccount;
  token: string;
};
