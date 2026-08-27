/**
 * The atelier's real address, hours, phone, email and WhatsApp number are
 * unconfirmed pending client sign-off. Never fabricate a value here — a
 * fabricated contact detail is worse than a visibly missing one. Add a
 * field only once the real value is supplied; the UI must render each row
 * conditionally so an absent field is simply omitted, not blanked.
 */
export type AtelierContact = {
  address?: string;
  hours?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
};

export const atelier: AtelierContact = {
  whatsapp: "+201020733663",
  phone: "+201020733663",
  email: "info@safaghaly.com",
  hours: "10:00 AM - 7:00 PM",
};
