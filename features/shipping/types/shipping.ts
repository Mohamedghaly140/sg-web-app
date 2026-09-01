export type ShippingZone = {
  country: string;
  governorate: string;
  city: string | null;
};

export type ShippingFee = {
  fee: string;
  zone: ShippingZone;
};
