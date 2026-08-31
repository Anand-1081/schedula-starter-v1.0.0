export type StaffUser = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
  remember: boolean;
};

export type Session = {
  user: StaffUser;
  token: string;
};
