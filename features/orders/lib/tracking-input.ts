import { claimTokenSchema } from "@/features/orders/schema/claim-token-schema";

export const TRACKING_INPUT_INVALID_MESSAGE =
  "That doesn't look like a valid tracking link or code.";

export function parseTrackingInput(raw: string): string | null {
  const value = raw.trim();
  const token = value.includes("/")
    ? (value.split("/").filter(Boolean).at(-1) ?? "")
    : value;
  const parsed = claimTokenSchema.safeParse(token);
  return parsed.success ? parsed.data : null;
}
