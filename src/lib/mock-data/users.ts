export type MockUserRecord = {
  id: string;
  name: string;
  initials: string;
  email: string;
  password: string;
  role: string;
};

export const users: MockUserRecord[] = [
  {
    id: "usr-01",
    name: "Priya Nair",
    initials: "PN",
    email: "priya@schedula.clinic",
    password: "clinic123",
    role: "Front desk coordinator",
  },
  {
    id: "usr-02",
    name: "Rahul Verma",
    initials: "RV",
    email: "rahul@schedula.clinic",
    password: "clinic123",
    role: "Clinic administrator",
  },
];
