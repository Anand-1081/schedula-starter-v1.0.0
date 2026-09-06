import type { Doctor } from "@/types/doctor";

export type DoctorAccount = Doctor & {
  email: string;
  phone: string;
  registrationNumber: string;
  password: string;
};

export type PublicDoctorAccount = Omit<DoctorAccount, "password">;

export type DoctorSession = {
  doctor: PublicDoctorAccount;
  token: string;
};
