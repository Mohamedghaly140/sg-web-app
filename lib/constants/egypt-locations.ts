import { z } from "zod";

/** Fixed country for v1 — Egypt-only; not a multi-country abstraction. */
export const DEFAULT_COUNTRY = "Egypt" as const;

export const countrySchema = z.literal(DEFAULT_COUNTRY);

/**
 * Seed list of Egypt's 27 governorates with a few major cities each.
 * Extendable — add cities as shipping coverage expands; labels must stay
 * canonical (shipping-zone matching is case-sensitive on the backend).
 */
export const EGYPT_LOCATIONS = [
  { governorate: "Cairo", cities: ["Nasr City", "Heliopolis", "Maadi", "Zamalek", "New Cairo"] },
  { governorate: "Giza", cities: ["Dokki", "Mohandessin", "6th of October", "Sheikh Zayed", "Haram"] },
  { governorate: "Alexandria", cities: ["Smouha", "Stanley", "Gleem", "Montaza", "Agami"] },
  { governorate: "Dakahlia", cities: ["Mansoura", "Talkha", "Mit Ghamr", "Belqas"] },
  { governorate: "Red Sea", cities: ["Hurghada", "Safaga", "El Quseir", "Marsa Alam"] },
  { governorate: "Beheira", cities: ["Damanhur", "Kafr El Dawwar", "Rashid", "Edku"] },
  { governorate: "Fayoum", cities: ["Fayoum", "Sinnuris", "Ibshaway", "Tamiya"] },
  { governorate: "Gharbia", cities: ["Tanta", "El Mahalla El Kubra", "Kafr El Zayat", "Zifta"] },
  { governorate: "Ismailia", cities: ["Ismailia", "Fayed", "Qantara", "Abu Suwir"] },
  { governorate: "Menofia", cities: ["Shibin El Kom", "Menouf", "Ashmoun", "Quesna"] },
  { governorate: "Minya", cities: ["Minya", "Mallawi", "Beni Mazar", "Samalut"] },
  { governorate: "Qaliubiya", cities: ["Banha", "Shubra El Kheima", "Qalyub", "Khanka"] },
  { governorate: "New Valley", cities: ["Kharga", "Dakhla", "Farafra", "Baris"] },
  { governorate: "Suez", cities: ["Suez", "Ain Sokhna", "Ataqah", "Arbaeen"] },
  { governorate: "Aswan", cities: ["Aswan", "Kom Ombo", "Edfu", "Abu Simbel"] },
  { governorate: "Assiut", cities: ["Assiut", "Dairut", "Manfalut", "Abnub"] },
  { governorate: "Bani Suef", cities: ["Bani Suef", "El Wasta", "Nasser", "Biba"] },
  { governorate: "Port Said", cities: ["Port Said", "Port Fouad", "El Manakh", "El Arab"] },
  { governorate: "Damietta", cities: ["Damietta", "New Damietta", "Faraskur", "Kafr Saad"] },
  { governorate: "Sharkia", cities: ["Zagazig", "10th of Ramadan", "Belbeis", "Abu Hammad"] },
  { governorate: "South Sinai", cities: ["Sharm El Sheikh", "Dahab", "Nuweiba", "El Tor"] },
  { governorate: "Kafr El Sheikh", cities: ["Kafr El Sheikh", "Desouk", "Baltim", "Fuwwah"] },
  { governorate: "Matrouh", cities: ["Marsa Matrouh", "El Alamein", "Siwa", "Sidi Barrani"] },
  { governorate: "Luxor", cities: ["Luxor", "Armant", "Esna", "El Tod"] },
  { governorate: "Qena", cities: ["Qena", "Nag Hammadi", "Qus", "Dishna"] },
  { governorate: "North Sinai", cities: ["Arish", "Sheikh Zuweid", "Rafah", "Bir El Abd"] },
  { governorate: "Sohag", cities: ["Sohag", "Akhmim", "Girga", "Tahta"] },
] as const;

export const EGYPT_GOVERNORATE_NAMES: readonly string[] = EGYPT_LOCATIONS.map(
  (entry) => entry.governorate,
);

export function getCitiesForGovernorate(governorate: string): readonly string[] {
  const match = EGYPT_LOCATIONS.find(
    (entry) => entry.governorate === governorate,
  );
  return match?.cities ?? [];
}
