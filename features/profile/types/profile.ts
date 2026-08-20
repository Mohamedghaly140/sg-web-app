export type Profile = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  createdAt: string;
};

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};
