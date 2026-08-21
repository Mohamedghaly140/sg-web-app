import { z } from "zod";

export const optionalBlankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const aliasSchema = z.string().trim().min(1).max(120);
export const governorateSchema = z.string().trim().min(1).max(120);
export const citySchema = z.string().trim().min(1).max(120);
export const areaSchema = z.string().trim().min(1).max(120);
export const addressLine1Schema = z.string().trim().min(1).max(500);
export const detailsSchema = z.string().trim().min(1).max(1000);

export const postalCodeSchema = z.preprocess(
  optionalBlankToUndefined,
  z.coerce.number().int().min(1).max(999999).optional(),
);

export const latitudeSchema = z.preprocess(
  optionalBlankToUndefined,
  z.coerce.number().min(-90).max(90).optional(),
);

export const longitudeSchema = z.preprocess(
  optionalBlankToUndefined,
  z.coerce.number().min(-180).max(180).optional(),
);
