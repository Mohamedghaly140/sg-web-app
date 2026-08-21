import type { InteractiveActionError } from "@/lib/api/to-interactive-action-error";

export type CouponPreview = {
  valid: boolean;
  code: string;
  discountPercent: string;
  discountApplied: string;
  itemsSubtotal: string;
};

export type CouponPreviewTransport = CouponPreview & { sessionToken?: string };

export type CouponActionResult = CouponPreview | InteractiveActionError;
