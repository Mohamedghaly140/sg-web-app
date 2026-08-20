import "server-only";

import type { Address } from "@/features/addresses/types/address";
import { apiFetch } from "@/lib/api/http";

export async function getAddresses(): Promise<Address[]> {
  return apiFetch<Address[]>("/addresses", { auth: "required" });
}
