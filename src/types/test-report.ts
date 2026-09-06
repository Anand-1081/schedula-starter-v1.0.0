export type TestReport = {
  id: string;
  patientId: string;
  title: string;
  category: string;
  date: string;
  status: "ready" | "pending";
};
