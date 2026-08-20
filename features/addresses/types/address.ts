export type Address = {
  id: string;
  alias: string;
  country: string;
  governorate: string;
  city: string;
  area: string;
  phone: string;
  addressLine1: string;
  details: string;
  postalCode: number | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string;
};
