export type RegistrationFormValues = {
  name: string;
  specialty: string;
  credentials: string;
  yearsExperience: string;
  registrationNumber: string;
  clinic: string;
  bio: string;
  consultFee: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export type ProfileFormValues = {
  name: string;
  specialty: string;
  credentials: string;
  yearsExperience: string;
  clinic: string;
  bio: string;
  consultFee: string;
  phone: string;
};

export type AppointmentFilter = "all" | "pending" | "confirmed";
