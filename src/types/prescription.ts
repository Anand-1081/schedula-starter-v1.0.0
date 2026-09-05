export type Medicine = {
  id: string;
  name: string;
  dosage: string; // e.g. "500mg"
  frequency: string; // e.g. "Twice a day, after food"
  duration: string; // e.g. "5 days"
};

export type Prescription = {
  id: string;
  bookingId: string;
  doctorId: string;
  doctorName: string;
  patientId?: string;
  patientName: string;
  diagnosis: string;
  medicines: Medicine[];
  instructions: string;
  createdAt: string;
  updatedAt: string;
};

export type PrescriptionInput = {
  diagnosis: string;
  medicines: Medicine[];
  instructions: string;
};
