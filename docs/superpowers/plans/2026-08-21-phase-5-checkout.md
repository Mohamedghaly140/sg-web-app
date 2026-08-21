# Phase 5 — Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `GET /shipping/fee` estimates, `POST /coupons/validate` preview, and CASH-only checkout for both guest (`/checkout/guest`) and registered (`/checkout`) customers, per `docs/phase-5-checkout.md`.

**Architecture:** A single `features/checkout/` directory holds every cross-flow piece — types, schemas, the shipping/coupon interactive actions, the shared `CheckoutErrorResolver`, the payment-method config seam, and the registered flow itself (`index.tsx` → `CheckoutFeature`). A sibling `features/checkout-guest/` holds only the guest wizard's step components and `index.tsx` → `CheckoutGuestFeature`, importing shared pieces from `features/checkout/` — the same cross-feature-import pattern `features/products` already uses against `features/cart` and `features/wishlist`. Both flows are single uncontrolled `<Form>` submissions: every step's fields stay mounted for the whole flow (hidden via the URL-driven step, not unmounted), so back/forward never loses entered data, and only the final Review step's submit button actually calls the Server Action.

**Tech Stack:** Next.js 16 App Router (Server Components, Server Actions), TypeScript, Zod v4, TanStack Query v5 (coupon preview only), nuqs (wizard step), Tailwind v4, shadcn `base-lyra` on `@base-ui/react`, Bun.

**Spec:** `docs/phase-5-checkout.md` (task numbers below refer to its §5.1–§5.6), backed by `docs/integration/storefront/06-coupons.md`, `07-shipping.md`, `09-checkout.md`.

## Context

### What already exists (do not recreate)

- **Cart infra (Phase 2, done):** `features/cart/types/cart.ts` (`Cart`, `CartItem`, `EMPTY_CART`), `features/cart/hooks/cart-keys.ts` (`cartKeys.current`), `features/cart/hooks/use-cart.ts` (`useCart()`, reads `CartInitialDataProvider`), `lib/cart-response.ts` (`captureRefreshAndSanitizeCart`, `sanitizeCartResponse`), `lib/cart-session.ts` (`getCartSession`/`setCartSession`/`clearCartSession`). `lib/cart-response.ts` already has a doc comment naming `POST /coupons/validate` as its fifth caller — reuse it, don't add a second cookie path.
- **Cart merge (Phase 3, done):** `features/cart/components/cart-merge-bridge.tsx` calls `useSyncCart()` → `features/cart/actions/sync-cart.ts` (`syncCartAction`) automatically on every Clerk sign-in, and its own doc comment says *"Registered checkout depends on this completing first."* **Task 10 does not re-implement the merge** — `/checkout`'s `useCart()` read is already post-merge by the time the page can render for a signed-in user.
- **Cart drift detection (Phase 2.4/2.5, done):** `features/cart/components/cart-line-item.tsx` already renders price-drift, stock-drift, and unavailable-product banners with correction actions, and `features/cart/hooks/use-cart-error-state.ts` already parses `INSUFFICIENT_STOCK`/`INVALID_VARIANT` structured errors. **Checkout does not re-implement per-line correction UI** — when `CheckoutErrorResolver` maps a cart-shaped error, checkout's job is only to refresh the cart cache and point the customer at `/cart`, which already shows the correction.
- **Addresses (Phase 4, done):** `features/addresses/types/address.ts` (`Address`), `features/addresses/queries/get-addresses.ts` (`getAddresses(): Promise<Address[]>`, `auth: "required"`), `features/addresses/components/address-form.tsx` (`<AddressForm variant="create" hasExistingAddresses onDone={...} />`), `features/addresses/components/address-form-fields.tsx` (`AddressFormFields`, already has `mode: "registered" | "guest"` and `namePrefix` — **built for this phase, unused until now**). `features/addresses/schema/address-field-schema.ts` exports `governorateSchema`, `citySchema`, `areaSchema`, `addressLine1Schema`, `detailsSchema`, `postalCodeSchema`, `latitudeSchema`, `longitudeSchema` (all already blank-tolerant via a private `optionalBlankToUndefined` — Task 2 exports it).
- **Form system:** `components/shared/form/utils/to-action-state.ts` (`ActionState`, `EMPTY_ACTION_STATE`, `toActionState`, `fromErrorToActionState`), `components/shared/form/form.tsx` (`Form`, already `forwardRef<HTMLFormElement>` — Task 9/10 use that ref directly, no changes needed to `Form`), `components/shared/submit-button.tsx`, `components/shared/form-control/form-control.tsx` (`FormControl`), `components/shared/select-field/select-field.tsx` (`SelectField` — renders a **hidden `<input type="hidden" name={name}>`** under a custom listbox; its value is React-controlled, so it does **not** dispatch a native DOM `change` event — this is why Task 8 adds a real callback prop instead of relying on form-level event listening).
- **Cross-cutting `lib/`:** `lib/api/http.ts` (`apiFetch`), `lib/api/api-error.ts` (`ApiError`, `getStockErrors`, `getVariantErrors`, `getValidationErrors`), `lib/api/to-interactive-action-error.ts` (`InteractiveActionError`, `toInteractiveActionError`), `lib/api/redirect-on-auth-error.ts`, `lib/constants/egypt-locations.ts` (`DEFAULT_COUNTRY`, `countrySchema`), `lib/constants/egypt-phone.ts` (`egyptPhoneSchema`), `lib/format.ts` (`formatEGP`, `isSameDecimal`, `cldUrl`).
- **No `features/checkout*` or `app/checkout*` directories exist yet.** This plan creates them from scratch.
- `docs/README.md`'s Phase 5 row is already flipped to "in progress" — no edit needed until Task 12.

### Design decisions worth flagging

1. **Coupon preview never sends `email` from the UI.** §06-coupons.md: *"If neither an authenticated user nor `email` is available, the per-user limit check is skipped for this preview. Guest checkout always revalidates using `contact.email`"* at final order submission. Skipping `email` on the *preview* call keeps `CouponForm` identical for both flows and avoids threading a live-read of the (uncontrolled) `contact.email` field into it.
2. **Payment method is uncontrolled.** `PaymentMethodSelect` is a real radio group (`name="paymentMethod"`) with `defaultChecked` — v1 has exactly one enabled option, so there is no interactive state to lift.
3. **The wizard is one `<form>`, not per-step forms.** All guest steps mount inside a single `Form` (from `components/shared/form/form.tsx`); the URL `step` param only toggles `hidden` on sections. This is why uncontrolled fields survive step navigation for free, and why only one `useActionState` / one `SubmitButton` exists for the whole flow.

## Global Constraints

- Bun only — never `npm`/`npx`/`yarn`. Run `bunx tsc --noEmit && bun lint` after every task; both must be clean before committing.
- **No automated test suite exists in this repo.** Per-task verification is `bunx tsc --noEmit && bun lint`; Task 12 carries the full manual browser Definition of Done from `docs/phase-5-checkout.md`. Do not invent a test framework.
- Branch on `ApiError.code`, never `.message`. Every new action funnels errors through `resolveCheckoutError`/`fromCheckoutErrorToActionState` (Task 3) or `toInteractiveActionError` (existing) — never a bare `catch { return ... }`.
- Money stays a decimal string end-to-end; format with `formatEGP()`; never combine server amounts with browser arithmetic (§5.3 review, §5.4 review).
- Checkout is CASH-only. `paymentMethodSchema = z.literal("CASH")` — CARD is visible-but-disabled per §5.6, never submittable.
- Cart-aware calls (`cartSession: true`) go through `captureRefreshAndSanitizeCart`/`getCartSession`/`setCartSession`/`clearCartSession` exactly as documented in `AGENTS.md`'s guest-cart lifecycle rules — never write `sg_cart_session` from anywhere else.
- `sg_cart_session` is deleted on exactly one *new* event in this plan: successful `POST /orders/guest` (Task 7). Do not add a fourth deletion event for coupon validation (§5.2 explicitly forbids this).
- Lucide icons import with the `Lucide` prefix. Component prop types are named `<ComponentName>Props`. Files are kebab-case. `app/` pages stay thin; all logic lives in `features/checkout/` and `features/checkout-guest/`.
- `git commit` messages must **not** include a `Co-Authored-By` or any AI-attribution trailer, per this repo's `AGENTS.md`.

## Implementation Phases

| Phase | Tasks | Delivers | Depends on |
|---|---|---|---|
| 1 — Foundations | 1–3 | Types, schemas, config seam, shared `CheckoutErrorResolver` | none |
| 2 — Shared interactive pieces | 4–6 | Shipping estimate, coupon preview, payment-method selector — used by both flows | Phase 1 |
| 3 — Guest checkout | 7–9 | `placeGuestOrderAction`, wizard steps, `/checkout/guest` | Phase 2 |
| 4 — Registered checkout + integration | 10–12 | `placeOrderAction`, `/checkout`, cart entry point, full DoD | Phase 2 |

Verification per phase:
- **Phases 1–2:** `bunx tsc --noEmit && bun lint` clean — nothing renders yet.
- **Phase 3:** same, plus manually driving `/checkout/guest` end-to-end in a private browser window.
- **Phase 4:** the full manual browser Definition of Done in Task 12.

---

## Phase 1 — Foundations

### Task 1: Checkout types and the payment-method config seam

**Files:**
- Create: `features/checkout/types/shipping.ts`
- Create: `features/checkout/types/coupon.ts`
- Create: `features/checkout/types/order.ts`
- Create: `lib/constants/payment-methods.ts`

**Interfaces:**
- Produces: `ShippingFee`, `CouponPreview`, `CouponPreviewTransport`, `CouponActionResult`, `OrderDetail`, `GuestOrderDetail`, `PaymentMethod`, `PAYMENT_METHODS` — consumed by every later task.

- [ ] **Step 1: `features/checkout/types/shipping.ts`**

```ts
export type ShippingZone = {
  country: string;
  governorate: string;
  city: string | null;
};

export type ShippingFee = {
  fee: string;
  zone: ShippingZone;
};
```

- [ ] **Step 2: `features/checkout/types/coupon.ts`**

```ts
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
```

- [ ] **Step 3: `features/checkout/types/order.ts`**

```ts
export type OrderItem = {
  productId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  color: string | null;
  size: string | null;
  price: string;
  lineTotal: string;
};

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type OrderDetail = {
  id: string;
  humanOrderId: string;
  status: OrderStatus;
  paymentMethod: "CASH" | "CARD";
  items: OrderItem[];
  itemsSubtotal: string;
  discountApplied: string;
  shippingFees: string;
  totalOrderPrice: string;
  isPaid: boolean;
  createdAt: string;
};

// The real claim token is never returned by the API — `claimToken` is always
// this literal marker (docs/integration/storefront/09-checkout.md §guest).
export type GuestOrderDetail = OrderDetail & { claimToken: "sent-by-email" };
```

- [ ] **Step 4: `lib/constants/payment-methods.ts`**

```ts
export type PaymentMethod = "CASH" | "CARD";

export type PaymentMethodOption = {
  value: PaymentMethod;
  label: string;
  enabled: boolean;
  disabledReason?: string;
};

/**
 * Config seam for §5.6: CARD stays visible but disabled until a real backend
 * payment-session contract exists (currently 422 PAYMENT_METHOD_UNAVAILABLE).
 * Flip `enabled` when that contract ships — `paymentMethodSchema`
 * (features/checkout/schema/payment-method-schema.ts) still gates submission
 * independently, so enabling here alone is not enough to accept CARD orders.
 */
export const PAYMENT_METHODS: PaymentMethodOption[] = [
  { value: "CASH", label: "Cash on delivery", enabled: true },
  { value: "CARD", label: "Card", enabled: false, disabledReason: "Coming soon" },
];
```

- [ ] **Step 5: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add features/checkout/types lib/constants/payment-methods.ts
git commit -m "feat: add checkout types and payment-method config seam"
```

---

### Task 2: Checkout schemas

**Files:**
- Modify: `features/addresses/schema/address-field-schema.ts` (export the existing `optionalBlankToUndefined` helper)
- Create: `features/checkout/schema/shipping-fee-schema.ts`
- Create: `features/checkout/schema/coupon-schema.ts`
- Create: `features/checkout/schema/payment-method-schema.ts`
- Create: `features/checkout/schema/guest-checkout-schema.ts`
- Create: `features/checkout/schema/registered-checkout-schema.ts`

**Interfaces:**
- Consumes: `governorateSchema`, `citySchema`, `areaSchema`, `addressLine1Schema`, `detailsSchema`, `postalCodeSchema`, `latitudeSchema`, `longitudeSchema` (existing, `features/addresses/schema/address-field-schema.ts`), `countrySchema` (existing, `lib/constants/egypt-locations.ts`), `egyptPhoneSchema` (existing, `lib/constants/egypt-phone.ts`).
- Produces: `shippingFeeInputSchema`, `couponCodeSchema`, `validateCouponSchema`, `paymentMethodSchema`, `guestCheckoutSchema` + `parseGuestCheckoutFormData(formData)`, `placeOrderSchema` — consumed by Tasks 4, 5, 7, 10.

- [ ] **Step 1: Export `optionalBlankToUndefined`**

In `features/addresses/schema/address-field-schema.ts`, change:

```ts
const optionalBlankToUndefined = (value: unknown) =>
```

to:

```ts
export const optionalBlankToUndefined = (value: unknown) =>
```

No other changes to this file.

- [ ] **Step 2: `features/checkout/schema/shipping-fee-schema.ts`**

```ts
import { z } from "zod";

import { citySchema, governorateSchema } from "@/features/addresses/schema/address-field-schema";
import { countrySchema } from "@/lib/constants/egypt-locations";

export const shippingFeeInputSchema = z.object({
  country: countrySchema,
  governorate: governorateSchema,
  city: citySchema.optional(),
});

export type ShippingFeeInput = z.infer<typeof shippingFeeInputSchema>;
```

- [ ] **Step 3: `features/checkout/schema/coupon-schema.ts`**

```ts
import { z } from "zod";

export const couponCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9_-]{3,30}$/, "Enter a valid coupon code");

export const validateCouponSchema = z.object({
  code: couponCodeSchema,
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
```

- [ ] **Step 4: `features/checkout/schema/payment-method-schema.ts`**

```ts
import { z } from "zod";

// v1 is CASH-only — CARD returns 422 PAYMENT_METHOD_UNAVAILABLE until a
// future backend contract exists (docs/phase-5-checkout.md §5.6).
export const paymentMethodSchema = z.literal("CASH");
```

- [ ] **Step 5: `features/checkout/schema/guest-checkout-schema.ts`**

```ts
import { z } from "zod";

import {
  addressLine1Schema,
  areaSchema,
  citySchema,
  detailsSchema,
  governorateSchema,
  latitudeSchema,
  longitudeSchema,
  optionalBlankToUndefined,
  postalCodeSchema,
} from "@/features/addresses/schema/address-field-schema";
import { couponCodeSchema } from "@/features/checkout/schema/coupon-schema";
import { paymentMethodSchema } from "@/features/checkout/schema/payment-method-schema";
import { countrySchema } from "@/lib/constants/egypt-locations";
import { egyptPhoneSchema } from "@/lib/constants/egypt-phone";

export const guestCheckoutSchema = z.object({
  contact: z.object({
    name: z.string().trim().min(1).max(120),
    phone: egyptPhoneSchema,
    email: z.email().trim().toLowerCase(),
  }),
  shipping: z.object({
    country: countrySchema,
    governorate: governorateSchema,
    city: citySchema,
    area: areaSchema,
    phone: egyptPhoneSchema,
    addressLine1: addressLine1Schema,
    details: detailsSchema,
    postalCode: postalCodeSchema,
    latitude: latitudeSchema,
    longitude: longitudeSchema,
  }),
  paymentMethod: paymentMethodSchema,
  couponCode: z.preprocess(optionalBlankToUndefined, couponCodeSchema.optional()),
  notes: z.preprocess(optionalBlankToUndefined, z.string().trim().max(1000).optional()),
});

export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>;

/**
 * This route's `FormData` uses dotted names (`contact.email`,
 * `shipping.governorate`, …) produced by `AddressFormFields`'s `namePrefix`.
 * `guestCheckoutSchema` validates the equivalent *nested* shape directly, so
 * on failure `z.flattenError` naturally re-produces those same dotted paths
 * as `fieldErrors` keys — this helper only bridges flat `FormData` entries
 * into that nested shape before `.parse()` runs.
 */
function unflattenFormData(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    const parts = key.split(".");
    let cursor = result;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        cursor[part] = value;
        return;
      }
      cursor[part] = (cursor[part] as Record<string, unknown> | undefined) ?? {};
      cursor = cursor[part] as Record<string, unknown>;
    });
  }

  return result;
}

export function parseGuestCheckoutFormData(formData: FormData): GuestCheckoutInput {
  return guestCheckoutSchema.parse(unflattenFormData(formData));
}
```

- [ ] **Step 6: `features/checkout/schema/registered-checkout-schema.ts`**

```ts
import { z } from "zod";

import { optionalBlankToUndefined } from "@/features/addresses/schema/address-field-schema";
import { couponCodeSchema } from "@/features/checkout/schema/coupon-schema";
import { paymentMethodSchema } from "@/features/checkout/schema/payment-method-schema";

export const placeOrderSchema = z.object({
  shippingAddressId: z.string().trim().min(1),
  paymentMethod: paymentMethodSchema,
  couponCode: z.preprocess(optionalBlankToUndefined, couponCodeSchema.optional()),
  notes: z.preprocess(optionalBlankToUndefined, z.string().trim().max(1000).optional()),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
```

- [ ] **Step 7: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0. Confirm no other file broke from the `optionalBlankToUndefined` export rename (it was module-private; grep confirms no shadowing import exists).

- [ ] **Step 8: Commit**

```bash
git add features/addresses/schema/address-field-schema.ts features/checkout/schema
git commit -m "feat: add checkout schemas for shipping, coupon, and both checkout flows"
```

---

### Task 3: Shared `CheckoutErrorResolver`

**Files:**
- Create: `features/checkout/lib/checkout-error-resolver.ts`

**Interfaces:**
- Consumes: `ApiError` (existing, `lib/api/api-error.ts`), `fromErrorToActionState`/`ActionState` (existing, `components/shared/form/utils/to-action-state.ts`).
- Produces: `CheckoutStep`, `resolveCheckoutError(error): CheckoutErrorProjection`, `fromCheckoutErrorToActionState(error, mode, formData): ActionState` — consumed by Tasks 7 and 10.

- [ ] **Step 1: Write the resolver**

```ts
import {
  fromErrorToActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { ApiError } from "@/lib/api/api-error";

export type CheckoutStep = "cart" | "address" | "coupon" | "payment" | "review";

export type CheckoutErrorProjection = {
  step: CheckoutStep;
  code: string;
  message: string;
};

/**
 * Maps a checkout `ApiError` to the wizard step it should send the customer
 * back to, and to customer-facing copy. Per §5.5, `INVALID_VARIANT` and
 * `INSUFFICIENT_STOCK` route to "cart" rather than carrying structured
 * per-line detail through this resolver — `/cart`'s existing drift-detection
 * UI (features/cart/components/cart-line-item.tsx) already renders that
 * correction once the cart cache is refreshed, so checkout does not
 * duplicate it. Never branch on `error.message`.
 */
export function resolveCheckoutError(error: unknown): CheckoutErrorProjection {
  if (!(error instanceof ApiError)) {
    return {
      step: "review",
      code: "UNKNOWN",
      message: error instanceof Error ? error.message : "Something went wrong.",
    };
  }

  switch (error.code) {
    case "PAYMENT_METHOD_UNAVAILABLE":
      return {
        step: "payment",
        code: error.code,
        message: "Card payment isn't available yet — choose Cash on delivery.",
      };
    case "CART_EMPTY":
      return { step: "cart", code: error.code, message: "Your cart is empty." };
    case "SHIPPING_NOT_AVAILABLE":
      return {
        step: "address",
        code: error.code,
        message: "We don't deliver to that destination yet.",
      };
    case "INVALID_VARIANT":
      return {
        step: "cart",
        code: error.code,
        message: "Some items in your cart are no longer available. Review your cart to continue.",
      };
    case "INSUFFICIENT_STOCK":
      return {
        step: "cart",
        code: error.code,
        message: "Some items don't have enough stock. Review your cart to continue.",
      };
    case "COUPON_EXPIRED":
      return { step: "coupon", code: error.code, message: "This coupon has expired." };
    case "COUPON_INACTIVE":
      return { step: "coupon", code: error.code, message: "This coupon is no longer active." };
    case "COUPON_EXHAUSTED":
      return {
        step: "coupon",
        code: error.code,
        message: "This coupon has reached its usage limit.",
      };
    case "COUPON_USER_LIMIT":
      return { step: "coupon", code: error.code, message: "You've already used this coupon." };
    case "RESOURCE_NOT_FOUND":
      // Registered checkout: ambiguous between a stale saved address and a
      // stale coupon — the code alone doesn't distinguish them (§5.5).
      return {
        step: "review",
        code: error.code,
        message: "Your selected address or coupon is no longer valid. Please review and try again.",
      };
    case "RATE_LIMITED":
      return {
        step: "review",
        code: error.code,
        message: "Too many attempts — please wait a moment and try again.",
      };
    default:
      return { step: "review", code: error.code, message: error.message };
  }
}

/**
 * `placeGuestOrderAction` and `placeOrderAction` both funnel their catch
 * block through this instead of the generic `fromErrorToActionState` —
 * reuses its `ZodError`/`ApiError` field-error extraction and
 * `redirectOnAuthError` side effect, but overrides `message`/`response`
 * with checkout-specific step routing so the wizard knows where to send the
 * customer back to.
 */
export function fromCheckoutErrorToActionState(
  error: unknown,
  mode: "public" | "optional" | "required",
  formData: FormData,
): ActionState {
  const projection = resolveCheckoutError(error);
  const base = fromErrorToActionState(error, mode, formData);

  return {
    ...base,
    message: projection.message,
    response: { ...base.response, step: projection.step, checkoutCode: projection.code },
  };
}
```

- [ ] **Step 2: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add features/checkout/lib
git commit -m "feat: add shared checkout error resolver"
```

---

## Phase 2 — Shared Interactive Pieces

### Task 4: Shipping estimate action and component

**Files:**
- Create: `features/checkout/actions/get-shipping-fee.ts`
- Create: `features/checkout/components/shipping-estimate.tsx`

**Interfaces:**
- Consumes: `shippingFeeInputSchema` (Task 2), `ShippingFee` (Task 1), `apiFetch` (existing), `toInteractiveActionError`/`InteractiveActionError` (existing).
- Produces: `getShippingFeeAction(input): Promise<ShippingFeeActionResult>`, `<ShippingEstimate country governorate city onResolved />` — consumed by Tasks 8 and 10. `onResolved` **must be a memoized (`useCallback`) function** — it is an effect dependency.

- [ ] **Step 1: `features/checkout/actions/get-shipping-fee.ts`**

```ts
"use server";

import { shippingFeeInputSchema } from "@/features/checkout/schema/shipping-fee-schema";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import { apiFetch } from "@/lib/api/http";
import {
  toInteractiveActionError,
  type InteractiveActionError,
} from "@/lib/api/to-interactive-action-error";

export type ShippingFeeActionResult = ShippingFee | InteractiveActionError;

// GET /shipping/fee is Public and not cart-aware (07-shipping.md) — no
// identity headers, no cache metadata (an estimate must always be fresh).
export async function getShippingFeeAction(
  input: unknown,
): Promise<ShippingFeeActionResult> {
  try {
    const parsed = shippingFeeInputSchema.parse(input);
    const params = new URLSearchParams({
      country: parsed.country,
      governorate: parsed.governorate,
      ...(parsed.city ? { city: parsed.city } : {}),
    });

    return await apiFetch<ShippingFee>(`/shipping/fee?${params.toString()}`, {
      auth: "public",
    });
  } catch (error) {
    return { error: toInteractiveActionError(error) };
  }
}
```

- [ ] **Step 2: `features/checkout/components/shipping-estimate.tsx`**

```tsx
"use client";

import { useEffect, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { getShippingFeeAction } from "@/features/checkout/actions/get-shipping-fee";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import { formatEGP } from "@/lib/format";

export type ShippingEstimateProps = {
  country: string;
  governorate: string;
  city: string;
  onResolved: (fee: ShippingFee | null) => void;
};

export function ShippingEstimate({
  country,
  governorate,
  city,
  onResolved,
}: ShippingEstimateProps) {
  const [isPending, startTransition] = useTransition();
  const [fee, setFee] = useState<ShippingFee | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!governorate) {
      setFee(null);
      setError(null);
      onResolved(null);
      return;
    }

    startTransition(() => {
      void (async () => {
        const result = await getShippingFeeAction({ country, governorate, city });
        if ("error" in result) {
          setFee(null);
          setError(
            result.error.code === "SHIPPING_NOT_AVAILABLE"
              ? "We don't deliver to that destination yet."
              : result.error.message,
          );
          onResolved(null);
          return;
        }

        setError(null);
        setFee(result);
        onResolved(result);
      })();
    });
  }, [country, governorate, city, onResolved]);

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Estimating shipping…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!fee) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">
        Estimated shipping
        {fee.zone.city ? null : (
          <Badge variant="secondary" className="ml-2">
            Governorate rate
          </Badge>
        )}
      </span>
      <span className="font-medium text-foreground">{formatEGP(fee.fee)}</span>
    </div>
  );
}
```

- [ ] **Step 3: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add features/checkout/actions/get-shipping-fee.ts features/checkout/components/shipping-estimate.tsx
git commit -m "feat: add shipping estimate action and component"
```

---

### Task 5: Coupon preview action, hook, and component

**Files:**
- Create: `features/checkout/actions/validate-coupon.ts`
- Create: `features/checkout/hooks/use-validate-coupon.ts`
- Create: `features/checkout/components/coupon-form.tsx`

**Interfaces:**
- Consumes: `validateCouponSchema` (Task 2), `CouponActionResult`/`CouponPreviewTransport` (Task 1), `captureRefreshAndSanitizeCart`/`getCartSession` (existing).
- Produces: `validateCouponAction(input)`, `useValidateCoupon(options)`, `<CouponForm applied onApplied />` — consumed by Tasks 8/9 (guest review) and 10 (registered).

- [ ] **Step 1: `features/checkout/actions/validate-coupon.ts`**

```ts
"use server";

import { validateCouponSchema } from "@/features/checkout/schema/coupon-schema";
import type {
  CouponActionResult,
  CouponPreviewTransport,
} from "@/features/checkout/types/coupon";
import { apiFetch } from "@/lib/api/http";
import { redirectOnAuthError } from "@/lib/api/redirect-on-auth-error";
import { toInteractiveActionError } from "@/lib/api/to-interactive-action-error";
import { captureRefreshAndSanitizeCart } from "@/lib/cart-response";
import { getCartSession } from "@/lib/cart-session";

// POST /coupons/validate is cart-aware (Optional auth, X-Cart-Session) but
// is never a cookie-deletion event — §5.2 explicitly limits deletion to
// merge, guest checkout, and anonymous clear. `captureRefreshAndSanitizeCart`
// still runs so an unexpected `sessionToken` on this response is captured or
// the existing cookie is refreshed, exactly like every other cart-aware call.
export async function validateCouponAction(
  input: unknown,
): Promise<CouponActionResult> {
  try {
    const parsed = validateCouponSchema.parse(input);
    const existingSession = await getCartSession();
    const transport = await apiFetch<CouponPreviewTransport>("/coupons/validate", {
      method: "POST",
      body: parsed,
      auth: "optional",
      cartSession: true,
    });

    return await captureRefreshAndSanitizeCart(transport, existingSession);
  } catch (error) {
    redirectOnAuthError(error, "optional");
    return { error: toInteractiveActionError(error) };
  }
}
```

- [ ] **Step 2: `features/checkout/hooks/use-validate-coupon.ts`**

```ts
"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { validateCouponAction } from "@/features/checkout/actions/validate-coupon";
import type { ValidateCouponInput } from "@/features/checkout/schema/coupon-schema";
import type { CouponActionResult } from "@/features/checkout/types/coupon";

export function useValidateCoupon(
  options?: Omit<
    UseMutationOptions<CouponActionResult, Error, ValidateCouponInput>,
    "mutationFn" | "retry"
  >,
) {
  return useMutation({
    ...options,
    mutationFn: validateCouponAction,
    retry: 0,
  });
}
```

- [ ] **Step 3: `features/checkout/components/coupon-form.tsx`**

```tsx
"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useValidateCoupon } from "@/features/checkout/hooks/use-validate-coupon";
import type { CouponPreview } from "@/features/checkout/types/coupon";
import { formatEGP } from "@/lib/format";

const COUPON_ERROR_COPY: Record<string, string> = {
  RESOURCE_NOT_FOUND: "We couldn't find that coupon code.",
  COUPON_EXPIRED: "This coupon has expired.",
  COUPON_INACTIVE: "This coupon is no longer active.",
  COUPON_EXHAUSTED: "This coupon has reached its usage limit.",
  COUPON_USER_LIMIT: "You've already used this coupon.",
  RATE_LIMITED: "Too many attempts — try again in a moment.",
};

export type CouponFormProps = {
  applied: CouponPreview | null;
  onApplied: (preview: CouponPreview | null) => void;
};

// Never passes `email` — §06-coupons.md skips the per-user check on preview
// when it's absent, and guest checkout always revalidates with
// `contact.email` at final order submission regardless (see plan Context).
export function CouponForm({ applied, onApplied }: CouponFormProps) {
  const [code, setCode] = useState(applied?.code ?? "");
  const mutation = useValidateCoupon({
    onSuccess: (result) => {
      onApplied("error" in result ? null : result);
    },
  });

  const result = mutation.data;
  const errorMessage =
    result && "error" in result
      ? (COUPON_ERROR_COPY[result.error.code] ?? result.error.message)
      : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Coupon code"
          maxLength={30}
          disabled={mutation.isPending}
          aria-label="Coupon code"
        />
        <Button
          type="button"
          variant="outline"
          disabled={mutation.isPending || code.trim().length < 3}
          onClick={() => mutation.mutate({ code })}
        >
          {mutation.isPending ? "Checking…" : "Apply"}
        </Button>
      </div>
      {applied ? (
        <div className="flex items-center justify-between text-sm">
          <Badge variant="success">{applied.code} applied</Badge>
          <span className="text-muted-foreground">-{formatEGP(applied.discountApplied)}</span>
        </div>
      ) : null}
      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add features/checkout/actions/validate-coupon.ts features/checkout/hooks/use-validate-coupon.ts features/checkout/components/coupon-form.tsx
git commit -m "feat: add coupon preview action, hook, and form"
```

---

### Task 6: Payment method selector

**Files:**
- Create: `features/checkout/components/payment-method-select.tsx`

**Interfaces:**
- Consumes: `PAYMENT_METHODS` (Task 1).
- Produces: `<PaymentMethodSelect name defaultValue />` — a real uncontrolled radio group, consumed by Tasks 9 and 10.

- [ ] **Step 1: Write the component**

```tsx
import { PAYMENT_METHODS } from "@/lib/constants/payment-methods";

export type PaymentMethodSelectProps = {
  name: string;
  defaultValue?: string;
};

// Uncontrolled by design — v1 has exactly one enabled option, so there is no
// interactive state to lift. The schema (`paymentMethodSchema`) is the real
// gate; this UI is defense in depth per §5.6.
export function PaymentMethodSelect({ name, defaultValue = "CASH" }: PaymentMethodSelectProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-foreground">Payment method</legend>
      {PAYMENT_METHODS.map((method) => (
        <label key={method.value} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={name}
            value={method.value}
            defaultChecked={method.value === defaultValue}
            disabled={!method.enabled}
            className="size-4 accent-primary disabled:opacity-50"
          />
          <span className={method.enabled ? "text-foreground" : "text-muted-foreground"}>
            {method.label}
            {method.disabledReason ? ` (${method.disabledReason})` : ""}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add features/checkout/components/payment-method-select.tsx
git commit -m "feat: add payment method selector"
```

---

## Phase 3 — Guest Checkout

### Task 7: `placeGuestOrderAction` and wizard step-param hooks

**Files:**
- Create: `features/checkout/actions/place-guest-order.ts`
- Create: `features/checkout/hooks/checkout-search-params.ts`
- Create: `features/checkout/hooks/use-checkout-step.ts`

**Interfaces:**
- Consumes: `parseGuestCheckoutFormData` (Task 2), `fromCheckoutErrorToActionState` (Task 3), `GuestOrderDetail` (Task 1), `clearCartSession` (existing).
- Produces: `placeGuestOrderAction(prev, formData): Promise<ActionState>` (success `response` carries `humanOrderId`), `GUEST_CHECKOUT_STEPS`, `GuestCheckoutStep`, `checkoutSearchParamsCache`, `useCheckoutStep()` — consumed by Tasks 8–9.

- [ ] **Step 1: `features/checkout/actions/place-guest-order.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";

import {
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { fromCheckoutErrorToActionState } from "@/features/checkout/lib/checkout-error-resolver";
import { parseGuestCheckoutFormData } from "@/features/checkout/schema/guest-checkout-schema";
import type { GuestOrderDetail } from "@/features/checkout/types/order";
import { apiFetch } from "@/lib/api/http";
import { clearCartSession } from "@/lib/cart-session";

export async function placeGuestOrderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const input = parseGuestCheckoutFormData(formData);
    const { postalCode, latitude, longitude, ...requiredShipping } = input.shipping;

    const order = await apiFetch<GuestOrderDetail>("/orders/guest", {
      method: "POST",
      body: {
        contact: input.contact,
        shipping: {
          ...requiredShipping,
          ...(postalCode !== undefined ? { postalCode } : {}),
          ...(latitude !== undefined ? { latitude } : {}),
          ...(longitude !== undefined ? { longitude } : {}),
        },
        paymentMethod: input.paymentMethod,
        ...(input.couponCode ? { couponCode: input.couponCode } : {}),
        ...(input.notes ? { notes: input.notes } : {}),
      },
      auth: "optional",
      cartSession: true,
    });

    // One of the three documented `sg_cart_session` deletion events. The
    // client-side TanStack cart cache reset to EMPTY_CART happens in the
    // wizard (Task 9) — a Server Action cannot touch `queryClient`.
    await clearCartSession();
    revalidatePath("/account/orders");

    return toActionState("SUCCESS", "Order placed", formData, {
      humanOrderId: order.humanOrderId,
    });
  } catch (error) {
    return fromCheckoutErrorToActionState(error, "optional", formData);
  }
}
```

- [ ] **Step 2: `features/checkout/hooks/checkout-search-params.ts`** (plain, no `"use client"` — parser only; unlike `reviews`/`products` there is no Server Component that needs a `createSearchParamsCache` here, since the whole wizard is client-rendered, so this file stays deliberately smaller than that pattern)

```ts
import { createParser } from "nuqs/server";

export const GUEST_CHECKOUT_STEPS = ["contact", "shipping", "review", "placed"] as const;
export type GuestCheckoutStep = (typeof GUEST_CHECKOUT_STEPS)[number];

const parseAsGuestCheckoutStep = createParser<GuestCheckoutStep>({
  parse(value) {
    return (GUEST_CHECKOUT_STEPS as readonly string[]).includes(value)
      ? (value as GuestCheckoutStep)
      : null;
  },
  serialize(value) {
    return value;
  },
}).withDefault("contact");

export const checkoutParamsParsers = {
  step: parseAsGuestCheckoutStep,
};
```

- [ ] **Step 3: `features/checkout/hooks/use-checkout-step.ts`**

```ts
"use client";

import { useQueryStates } from "nuqs";

import { checkoutParamsParsers } from "@/features/checkout/hooks/checkout-search-params";

export function useCheckoutStep() {
  return useQueryStates(checkoutParamsParsers, { shallow: false });
}
```

- [ ] **Step 4: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add features/checkout/actions/place-guest-order.ts features/checkout/hooks/checkout-search-params.ts features/checkout/hooks/use-checkout-step.ts
git commit -m "feat: add guest order placement action and wizard step state"
```

---

### Task 8: Extend `AddressFormFields`; build the guest contact and shipping steps

**Files:**
- Modify: `features/addresses/components/address-form-fields.tsx`
- Create: `features/checkout-guest/components/guest-contact-step.tsx`
- Create: `features/checkout-guest/components/guest-shipping-step.tsx`

**Interfaces:**
- Consumes: `AddressFormFields` (modified), `ShippingEstimate` (Task 4), `FormControl`/`TextareaControl` (existing).
- Produces: `AddressFormFields`'s new `onDestinationChange` prop, `<GuestContactStep active />`, `<GuestShippingStep active onNext onBack shippingFee onShippingFeeResolved />` — consumed by Task 9.

- [ ] **Step 1: Add `onDestinationChange` to `AddressFormFields`**

`SelectField` renders a React-controlled `<input type="hidden">` for its value — it does **not** dispatch a native DOM `change` event, so nothing outside `AddressFormFields` can currently observe governorate/city changes. Add an explicit callback instead of relying on form-level event listening.

In `features/addresses/components/address-form-fields.tsx`, add to the props type:

```ts
export type AddressFormFieldsProps = {
  mode: "registered" | "guest";
  namePrefix?: string;
  defaultValues?: AddressFieldValues;
  actionState?: ActionState;
  onDestinationChange?: (destination: {
    country: string;
    governorate: string;
    city: string;
  }) => void;
};
```

Destructure `onDestinationChange` in the function signature. Add a `city` state mirroring the existing `governorate` state, right after the existing `governorate` `useState`:

```ts
const [city, setCity] = useState(cityDefault);
```

Immediately after that block (still before the `return`), add:

```ts
useEffect(() => {
  onDestinationChange?.({ country: DEFAULT_COUNTRY, governorate, city });
}, [governorate, city, onDestinationChange]);
```

Add `useEffect` to the existing `"react"` import. Wire the city `SelectField` to update `city` and reset it whenever `governorate` changes (it already remounts via `key={governorate}`, so resetting on governorate change keeps `city` in sync with that remount):

```ts
onValueChange={(next) => {
  setCity(next);
}}
```

placed on the city `SelectField` alongside its existing `key`/`name`/`label`/`options` props. Then change the governorate `SelectField`'s existing `onValueChange={setGovernorate}` to also reset city:

```ts
onValueChange={(next) => {
  setGovernorate(next);
  setCity(getCitiesForGovernorate(next).includes(cityDefault) ? cityDefault : "");
}}
```

This preserves the existing "keep the address's own city if the governorate didn't actually change" behavior (`cityDefault` already encodes that) while keeping the new `city` state truthful after a governorate switch.

- [ ] **Step 2: `features/checkout-guest/components/guest-contact-step.tsx`**

```tsx
"use client";

import FormControl from "@/components/shared/form-control";
import type { ActionState } from "@/components/shared/form/utils/to-action-state";
import { Button } from "@/components/ui/button";

export type GuestContactStepProps = {
  active: boolean;
  actionState: ActionState;
  onNext: () => void;
};

export function GuestContactStep({ active, actionState, onNext }: GuestContactStepProps) {
  return (
    <section hidden={!active} className="flex flex-col gap-4" aria-label="Contact details">
      <FormControl
        name="contact.name"
        label="Full name"
        type="text"
        maxLength={120}
        actionState={actionState}
      />
      <FormControl
        name="contact.phone"
        label="Phone"
        type="tel"
        placeholder="+201000000001"
        actionState={actionState}
      />
      <FormControl
        name="contact.email"
        label="Email"
        type="email"
        actionState={actionState}
      />
      <p className="text-sm text-muted-foreground">
        We&apos;ll email your order confirmation and tracking link here.
      </p>
      <Button type="button" onClick={onNext} className="self-end">
        Continue to shipping
      </Button>
    </section>
  );
}
```

- [ ] **Step 3: `features/checkout-guest/components/guest-shipping-step.tsx`**

```tsx
"use client";

import { useCallback, useState } from "react";

import type { ActionState } from "@/components/shared/form/utils/to-action-state";
import { TextareaControl } from "@/components/shared/textarea-control/textarea-control";
import { Button } from "@/components/ui/button";
import { AddressFormFields } from "@/features/addresses/components/address-form-fields";
import { ShippingEstimate } from "@/features/checkout/components/shipping-estimate";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import { DEFAULT_COUNTRY } from "@/lib/constants/egypt-locations";

export type GuestShippingStepProps = {
  active: boolean;
  actionState: ActionState;
  onNext: () => void;
  onBack: () => void;
};

export function GuestShippingStep({
  active,
  actionState,
  onNext,
  onBack,
}: GuestShippingStepProps) {
  const [destination, setDestination] = useState({
    country: DEFAULT_COUNTRY,
    governorate: "",
    city: "",
  });
  const [shippingFee, setShippingFee] = useState<ShippingFee | null>(null);

  const handleDestinationChange = useCallback(
    (next: { country: string; governorate: string; city: string }) => {
      setDestination(next);
    },
    [],
  );

  const handleResolved = useCallback((fee: ShippingFee | null) => {
    setShippingFee(fee);
  }, []);

  return (
    <section hidden={!active} className="flex flex-col gap-4" aria-label="Shipping address">
      <AddressFormFields
        mode="guest"
        namePrefix="shipping"
        actionState={actionState}
        onDestinationChange={handleDestinationChange}
      />
      <TextareaControl
        name="notes"
        label="Order notes (optional)"
        maxLength={1000}
        actionState={actionState}
      />
      <ShippingEstimate
        country={destination.country}
        governorate={destination.governorate}
        city={destination.city}
        onResolved={handleResolved}
      />
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext} disabled={!shippingFee}>
          Continue to review
        </Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add features/addresses/components/address-form-fields.tsx features/checkout-guest/components/guest-contact-step.tsx features/checkout-guest/components/guest-shipping-step.tsx
git commit -m "feat: add guest checkout contact and shipping steps"
```

---

### Task 9: Guest review step, wizard, confirmation, and route

**Files:**
- Create: `features/checkout/components/order-confirmation.tsx` (shared with Task 10)
- Create: `features/checkout/components/checkout-cart-summary.tsx` (shared with Task 10)
- Create: `features/checkout-guest/components/guest-review-step.tsx`
- Create: `features/checkout-guest/components/guest-checkout-wizard.tsx`
- Create: `features/checkout-guest/index.tsx`
- Create: `app/checkout/guest/page.tsx`

**Interfaces:**
- Consumes: `useCart` (existing), `CouponForm` (Task 5), `PaymentMethodSelect` (Task 6), `placeGuestOrderAction` (Task 7), `checkoutSearchParamsCache`/`useCheckoutStep` (Task 7), `GuestContactStep`/`GuestShippingStep` (Task 8).
- Produces: `CheckoutGuestFeature` (default export) — consumed by `app/checkout/guest/page.tsx`.

- [ ] **Step 1: `features/checkout/components/checkout-cart-summary.tsx`** — read-only line list + server totals. Deliberately does **not** duplicate `cart-line-item.tsx`'s correction UI (Context, decision 1); it only warns and links to `/cart` when a line needs attention.

```tsx
import { LucideTriangleAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Cart } from "@/features/cart/types/cart";
import { cldUrl, formatEGP } from "@/lib/format";

export type CheckoutCartSummaryProps = {
  cart: Cart;
};

export function CheckoutCartSummary({ cart }: CheckoutCartSummaryProps) {
  const needsAttention = cart.items.some(
    (item) => item.product.status !== "ACTIVE" || item.quantity > item.product.quantity,
  );

  return (
    <div className="flex flex-col gap-4">
      {needsAttention ? (
        <Alert variant="destructive">
          <LucideTriangleAlert />
          <AlertTitle>Some items in your cart need attention</AlertTitle>
          <AlertDescription>
            <Link href="/cart" className="underline">
              Review your cart
            </Link>{" "}
            before placing your order.
          </AlertDescription>
        </Alert>
      ) : null}

      <ul className="flex flex-col divide-y divide-border">
        {cart.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <div className="relative size-16 shrink-0 overflow-hidden bg-muted">
              <Image
                src={cldUrl(item.product.imageUrl, { width: 128, height: 128, crop: "fill" })}
                alt={item.product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-sm font-medium text-foreground">
                {item.product.name}
              </span>
              <div className="flex flex-wrap gap-1">
                {item.color ? <Badge variant="outline">{item.color}</Badge> : null}
                {item.size ? <Badge variant="outline">Size {item.size}</Badge> : null}
                <Badge variant="outline">Qty {item.quantity}</Badge>
              </div>
            </div>
            <span className="text-sm font-medium text-foreground">
              {formatEGP(item.lineTotal)}
            </span>
          </li>
        ))}
      </ul>

      <Separator />

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatEGP(cart.totalCartPrice)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="font-medium text-foreground">Estimated total</dt>
          <dd className="text-lg font-semibold text-foreground">
            {formatEGP(cart.totalPriceAfterDiscount)}
          </dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">
        Shipping and any coupon discount are shown separately below and are not yet included in
        this total — the completed order confirms the final amount.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: `features/checkout/components/order-confirmation.tsx`**

```tsx
import { LucideCircleCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export type OrderConfirmationProps = {
  humanOrderId: string;
  isGuest: boolean;
  orderId?: string;
};

export function OrderConfirmation({ humanOrderId, isGuest, orderId }: OrderConfirmationProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <LucideCircleCheck className="size-12 text-primary" />
      <h1 className="font-heading text-2xl font-semibold text-foreground">Order placed</h1>
      <p className="text-muted-foreground">
        Order <span className="font-medium text-foreground">{humanOrderId}</span> is confirmed.
      </p>
      {isGuest ? (
        <p className="max-w-md text-sm text-muted-foreground">
          We emailed your order confirmation and tracking link to the address you provided.
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button render={<Link href="/products" />} nativeButton={false}>
          Continue shopping
        </Button>
        {!isGuest && orderId ? (
          <Button
            variant="outline"
            render={<Link href={`/account/orders/${orderId}`} />}
            nativeButton={false}
          >
            View order
          </Button>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `features/checkout-guest/components/guest-review-step.tsx`**

```tsx
"use client";

import { CheckoutCartSummary } from "@/features/checkout/components/checkout-cart-summary";
import { CouponForm } from "@/features/checkout/components/coupon-form";
import { PaymentMethodSelect } from "@/features/checkout/components/payment-method-select";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import type { Cart } from "@/features/cart/types/cart";
import type { CouponPreview } from "@/features/checkout/types/coupon";
import SubmitButton from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { formatEGP } from "@/lib/format";

export type GuestReviewStepProps = {
  active: boolean;
  cart: Cart;
  shippingFee: ShippingFee | null;
  applied: CouponPreview | null;
  onApplied: (preview: CouponPreview | null) => void;
  onBack: () => void;
};

export function GuestReviewStep({
  active,
  cart,
  shippingFee,
  applied,
  onApplied,
  onBack,
}: GuestReviewStepProps) {
  return (
    <section hidden={!active} className="flex flex-col gap-6" aria-label="Review order">
      <CheckoutCartSummary cart={cart} />

      {shippingFee ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium text-foreground">{formatEGP(shippingFee.fee)}</span>
        </div>
      ) : null}

      <CouponForm applied={applied} onApplied={onApplied} />
      <input type="hidden" name="couponCode" value={applied?.code ?? ""} />

      <PaymentMethodSelect name="paymentMethod" />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <SubmitButton label="Place order" />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: `features/checkout-guest/components/guest-checkout-wizard.tsx`**

```tsx
"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useActionState, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import Form from "@/components/shared/form/form";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { GuestContactStep } from "@/features/checkout-guest/components/guest-contact-step";
import { GuestReviewStep } from "@/features/checkout-guest/components/guest-review-step";
import { GuestShippingStep } from "@/features/checkout-guest/components/guest-shipping-step";
import { placeGuestOrderAction } from "@/features/checkout/actions/place-guest-order";
import { OrderConfirmation } from "@/features/checkout/components/order-confirmation";
import { useCheckoutStep } from "@/features/checkout/hooks/use-checkout-step";
import type { CouponPreview } from "@/features/checkout/types/coupon";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import { cartKeys } from "@/features/cart/hooks/cart-keys";
import { useCart } from "@/features/cart/hooks/use-cart";
import { EMPTY_CART, type Cart } from "@/features/cart/types/cart";

export function GuestCheckoutWizard() {
  const cartQuery = useCart();
  const queryClient = useQueryClient();
  const [step, setStep] = useCheckoutStep();
  const [applied, setApplied] = useState<CouponPreview | null>(null);
  const [shippingFee, setShippingFee] = useState<ShippingFee | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const [actionState, formAction] = useActionState(placeGuestOrderAction, EMPTY_ACTION_STATE);
  const cart: Cart | undefined = cartQuery.data;

  // `queryClient.setQueryData` is a side effect and must not run during
  // render — `Form`'s `onSuccess` (via `useActionFeedback`) fires it exactly
  // once per new SUCCESS `actionState.timestamp` instead.
  const handleSuccess = () => {
    if (cartQuery.data && cartQuery.data.items.length > 0) {
      queryClient.setQueryData(cartKeys.current, EMPTY_CART);
    }
    if (typeof actionState.response?.humanOrderId === "string") {
      setPlacedOrderId(actionState.response.humanOrderId);
    }
  };

  if (placedOrderId) {
    return <OrderConfirmation humanOrderId={placedOrderId} isGuest />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add something to your cart before checking out."
        action={
          <Button render={<Link href="/products" />} nativeButton={false}>
            Continue shopping
          </Button>
        }
      />
    );
  }

  return (
    <Form
      action={formAction}
      actionState={actionState}
      suppressBuiltInToasts
      onSuccess={handleSuccess}
      onError={() => {
        const nextStep = actionState.response?.step;
        if (typeof nextStep === "string" && nextStep !== "review") {
          void setStep({ step: "contact" });
        }
      }}
    >
      <GuestContactStep
        active={step.step === "contact"}
        actionState={actionState}
        onNext={() => void setStep({ step: "shipping" })}
      />
      <GuestShippingStep
        active={step.step === "shipping"}
        actionState={actionState}
        onNext={() => void setStep({ step: "review" })}
        onBack={() => void setStep({ step: "contact" })}
      />
      <GuestReviewStep
        active={step.step === "review"}
        cart={cart}
        shippingFee={shippingFee}
        applied={applied}
        onApplied={setApplied}
        onBack={() => void setStep({ step: "shipping" })}
      />
    </Form>
  );
}
```

`shippingFee` set by `GuestShippingStep` internally is not lifted here on purpose — the review step only needs the *fee amount for display* (Task 9 Step 3 already receives it as a prop). Lift it: change `GuestShippingStep`'s `onResolved` handling in Task 8 Step 3 to also accept an `onFeeChange` prop.

- [ ] **Step 4b: Lift `shippingFee` from `GuestShippingStep` to the wizard**

In `features/checkout-guest/components/guest-shipping-step.tsx` (Task 8), add a required prop:

```ts
export type GuestShippingStepProps = {
  active: boolean;
  actionState: ActionState;
  onNext: () => void;
  onBack: () => void;
  onFeeChange: (fee: ShippingFee | null) => void;
};
```

and change `handleResolved` to also call it:

```ts
const handleResolved = useCallback(
  (fee: ShippingFee | null) => {
    setShippingFee(fee);
    onFeeChange(fee);
  },
  [onFeeChange],
);
```

Back in `guest-checkout-wizard.tsx`, pass `onFeeChange={setShippingFee}` to `<GuestShippingStep>`.

- [ ] **Step 5: `features/checkout-guest/index.tsx`**

```tsx
import { GuestCheckoutWizard } from "@/features/checkout-guest/components/guest-checkout-wizard";

export default function CheckoutGuestFeature() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
        Guest checkout
      </h1>
      <GuestCheckoutWizard />
    </div>
  );
}
```

- [ ] **Step 6: `app/checkout/guest/page.tsx`**

```tsx
import type { Metadata } from "next";

import CheckoutGuestFeature from "@/features/checkout-guest";

export const metadata: Metadata = {
  title: "Guest checkout",
};

export default function CheckoutGuestPage() {
  return <CheckoutGuestFeature />;
}
```

- [ ] **Step 7: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0. Fix any prop-shape mismatches between Step 4 and Step 4b before moving on.

- [ ] **Step 8: Manual smoke test**

Run: `bun dev`, open `/checkout/guest` in a private window with at least one item in the cart. Walk contact → shipping (confirm the shipping estimate appears once a governorate is chosen and blocks "Continue to review" until it resolves) → review (apply an invalid coupon code, confirm distinct error copy; leave it unapplied) → submit with `CASH`. Confirm the confirmation screen renders and `/cart` (in another tab) now shows empty.

- [ ] **Step 9: Commit**

```bash
git add features/checkout/components/order-confirmation.tsx features/checkout/components/checkout-cart-summary.tsx features/checkout-guest app/checkout/guest
git commit -m "feat: add guest checkout review step, wizard, and route"
```

---

## Phase 4 — Registered Checkout + Integration

### Task 10: `placeOrderAction`, registered checkout content, and route

**Files:**
- Create: `features/checkout/actions/place-order.ts`
- Create: `features/checkout/components/registered-checkout-content.tsx`
- Create: `features/checkout/components/checkout-sign-in-prompt.tsx`
- Create: `features/checkout/index.tsx`
- Create: `app/checkout/page.tsx`

**Interfaces:**
- Consumes: `placeOrderSchema` (Task 2), `fromCheckoutErrorToActionState` (Task 3), `getAddresses`/`AddressForm`/`Address` (existing, Phase 4), `ShippingEstimate` (Task 4), `CouponForm` (Task 5), `PaymentMethodSelect` (Task 6), `CheckoutCartSummary`/`OrderConfirmation` (Task 9).
- Produces: `placeOrderAction`, `CheckoutFeature` (default export) — consumed by `app/checkout/page.tsx`.

- [ ] **Step 1: `features/checkout/actions/place-order.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";

import {
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { fromCheckoutErrorToActionState } from "@/features/checkout/lib/checkout-error-resolver";
import { placeOrderSchema } from "@/features/checkout/schema/registered-checkout-schema";
import type { OrderDetail } from "@/features/checkout/types/order";
import { apiFetch } from "@/lib/api/http";

// No cart-session cookie touches this action — it is Auth-only, and
// `CartMergeBridge`/`syncCartAction` already merged any guest cart before
// this page could render (see plan Context). Client-side TanStack cache
// reset to EMPTY_CART happens in `RegisteredCheckoutContent`.
export async function placeOrderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const input = placeOrderSchema.parse(Object.fromEntries(formData));

    const order = await apiFetch<OrderDetail>("/orders", {
      method: "POST",
      body: {
        shippingAddressId: input.shippingAddressId,
        paymentMethod: input.paymentMethod,
        ...(input.couponCode ? { couponCode: input.couponCode } : {}),
        ...(input.notes ? { notes: input.notes } : {}),
      },
      auth: "required",
    });

    revalidatePath("/account/orders");

    return toActionState("SUCCESS", "Order placed", formData, {
      humanOrderId: order.humanOrderId,
      orderId: order.id,
    });
  } catch (error) {
    return fromCheckoutErrorToActionState(error, "required", formData);
  }
}
```

- [ ] **Step 2: `features/checkout/components/checkout-sign-in-prompt.tsx`**

```tsx
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CheckoutSignInPrompt() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Sign in to check out faster
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Sign in to use your saved addresses, or continue without an account.
      </p>
      <div className="flex gap-2">
        <SignInButton mode="modal" fallbackRedirectUrl="/checkout">
          <Button type="button">Sign in</Button>
        </SignInButton>
        <Button variant="outline" render={<Link href="/checkout/guest" />} nativeButton={false}>
          Continue as guest
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `features/checkout/components/registered-checkout-content.tsx`**

```tsx
"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import Form from "@/components/shared/form/form";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import SubmitButton from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddressForm } from "@/features/addresses/components/address-form";
import type { Address } from "@/features/addresses/types/address";
import { placeOrderAction } from "@/features/checkout/actions/place-order";
import { CheckoutCartSummary } from "@/features/checkout/components/checkout-cart-summary";
import { CouponForm } from "@/features/checkout/components/coupon-form";
import { OrderConfirmation } from "@/features/checkout/components/order-confirmation";
import { PaymentMethodSelect } from "@/features/checkout/components/payment-method-select";
import { ShippingEstimate } from "@/features/checkout/components/shipping-estimate";
import type { CouponPreview } from "@/features/checkout/types/coupon";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import { cartKeys } from "@/features/cart/hooks/cart-keys";
import { useCart } from "@/features/cart/hooks/use-cart";
import { EMPTY_CART } from "@/features/cart/types/cart";
import { DEFAULT_COUNTRY } from "@/lib/constants/egypt-locations";

export type RegisteredCheckoutContentProps = {
  addresses: Address[];
};

export function RegisteredCheckoutContent({ addresses }: RegisteredCheckoutContentProps) {
  const cartQuery = useCart();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(
    addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? "",
  );
  const [shippingFee, setShippingFee] = useState<ShippingFee | null>(null);
  const [applied, setApplied] = useState<CouponPreview | null>(null);
  const [showCreateAddress, setShowCreateAddress] = useState(addresses.length === 0);
  const [placedOrder, setPlacedOrder] = useState<{ humanOrderId: string; orderId?: string } | null>(
    null,
  );

  const [actionState, formAction] = useActionState(placeOrderAction, EMPTY_ACTION_STATE);
  const selectedAddress = addresses.find((address) => address.id === selectedId) ?? null;

  const handleResolved = useCallback((fee: ShippingFee | null) => {
    setShippingFee(fee);
  }, []);

  // `queryClient.setQueryData` is a side effect and must not run during
  // render — `Form`'s `onSuccess` (via `useActionFeedback`) fires it exactly
  // once per new SUCCESS `actionState.timestamp` instead.
  const handleSuccess = () => {
    if (cartQuery.data && cartQuery.data.items.length > 0) {
      queryClient.setQueryData(cartKeys.current, EMPTY_CART);
    }
    if (typeof actionState.response?.humanOrderId === "string") {
      setPlacedOrder({
        humanOrderId: actionState.response.humanOrderId,
        orderId:
          typeof actionState.response.orderId === "string"
            ? actionState.response.orderId
            : undefined,
      });
    }
  };

  if (placedOrder) {
    return (
      <OrderConfirmation
        humanOrderId={placedOrder.humanOrderId}
        orderId={placedOrder.orderId}
        isGuest={false}
      />
    );
  }

  const cart = cartQuery.data;

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add something to your cart before checking out."
        action={
          <Button render={<Link href="/products" />} nativeButton={false}>
            Continue shopping
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Form
        action={formAction}
        actionState={actionState}
        suppressBuiltInToasts
        onSuccess={handleSuccess}
      >
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Shipping address
          </h2>
          {addresses.length > 0 ? (
            <fieldset className="flex flex-col gap-2">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className="flex items-start gap-3 border border-border p-3 text-sm has-checked:border-primary"
                >
                  <input
                    type="radio"
                    name="shippingAddressId"
                    value={address.id}
                    checked={selectedId === address.id}
                    onChange={() => setSelectedId(address.id)}
                    className="mt-1 size-4 accent-primary"
                  />
                  <span className="flex flex-col">
                    <span className="font-medium text-foreground">{address.alias}</span>
                    <span className="text-muted-foreground">
                      {address.addressLine1}, {address.area}, {address.city},{" "}
                      {address.governorate}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => setShowCreateAddress((current) => !current)}
          >
            {showCreateAddress ? "Cancel" : "Add a new address"}
          </Button>

          {showCreateAddress ? (
            <AddressForm
              variant="create"
              hasExistingAddresses={addresses.length > 0}
              onDone={() => {
                setShowCreateAddress(false);
                router.refresh();
              }}
            />
          ) : null}

          {selectedAddress ? (
            <ShippingEstimate
              country={DEFAULT_COUNTRY}
              governorate={selectedAddress.governorate}
              city={selectedAddress.city}
              onResolved={handleResolved}
            />
          ) : null}
        </section>

        <section className="mt-6 flex flex-col gap-4">
          <CouponForm applied={applied} onApplied={setApplied} />
          <input type="hidden" name="couponCode" value={applied?.code ?? ""} />
          <PaymentMethodSelect name="paymentMethod" />
          <SubmitButton
            label="Place order"
            disabled={!selectedAddress || !shippingFee}
            className="self-end"
          />
        </section>
      </Form>

      <Card>
        <CardContent className="pt-6">
          <CheckoutCartSummary cart={cart} />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: `features/checkout/index.tsx`**

```tsx
import { auth } from "@clerk/nextjs/server";

import { getAddresses } from "@/features/addresses/queries/get-addresses";
import { CheckoutSignInPrompt } from "@/features/checkout/components/checkout-sign-in-prompt";
import { RegisteredCheckoutContent } from "@/features/checkout/components/registered-checkout-content";

export default async function CheckoutFeature() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
        <CheckoutSignInPrompt />
      </div>
    );
  }

  const addresses = await getAddresses();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
        Checkout
      </h1>
      <RegisteredCheckoutContent addresses={addresses} />
    </div>
  );
}
```

- [ ] **Step 5: `app/checkout/page.tsx`**

```tsx
import type { Metadata } from "next";

import CheckoutFeature from "@/features/checkout";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return <CheckoutFeature />;
}
```

- [ ] **Step 6: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add features/checkout/actions/place-order.ts features/checkout/components/checkout-sign-in-prompt.tsx features/checkout/components/registered-checkout-content.tsx features/checkout/index.tsx app/checkout/page.tsx
git commit -m "feat: add registered checkout flow and route"
```

---

### Task 11: Wire "Proceed to checkout" from the cart

**Files:**
- Modify: `features/cart/components/cart-summary.tsx`

**Interfaces:**
- Consumes: nothing new — only enables an existing disabled button.

- [ ] **Step 1: Replace the disabled checkout button**

In `features/cart/components/cart-summary.tsx`, replace:

```tsx
<div className="flex flex-col gap-2">
  <Button type="button" disabled>
    Proceed to Checkout
  </Button>
  <p className="text-center text-xs text-muted-foreground">
    Checkout is coming soon.
  </p>
</div>
```

with:

```tsx
<Button render={<Link href="/checkout" />} nativeButton={false}>
  Proceed to Checkout
</Button>
```

Add `import Link from "next/link";` to the top of the file. `/checkout` itself branches on sign-in state (Task 10), so this link is correct for both guest and signed-in customers — do not special-case the href here.

- [ ] **Step 2: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 3: Manual smoke test**

Run: `bun dev`. From `/cart`, click "Proceed to Checkout" signed out → lands on `/checkout` showing the sign-in prompt. Sign in → same click now shows the address-based registered flow.

- [ ] **Step 4: Commit**

```bash
git add features/cart/components/cart-summary.tsx
git commit -m "feat: enable Proceed to Checkout from the cart"
```

---

### Task 12: Full Definition of Done and status tracker update

**Files:**
- Modify: `docs/README.md`

**Interfaces:** none — verification and documentation only.

- [ ] **Step 1: Run the full guest happy path**

Private browser window, no account. Browse → add to cart → `/cart` → "Proceed to Checkout" → `/checkout/guest` → complete contact/shipping/review → place a `CASH` order. Confirm: order confirmation renders with `humanOrderId`; `document.cookie` no longer shows `sg_cart_session` was ever readable (it's `HttpOnly`, confirm via DevTools Application tab that the cookie is gone); `/cart` now shows empty; `/api/cart` response contains no `sessionToken`.

- [ ] **Step 2: Run the full registered happy path**

Sign in with a Clerk test account (test credentials: `+clerk_test@` emails, OTP `424242`). Add an item as a guest first, then sign in and confirm the cart merges (Phase 3 behavior) before reaching `/checkout`. Select or create a saved address, apply a coupon if a test coupon exists, place a `CASH` order. Confirm the confirmation screen, `/account/orders` revalidation (the page itself is Phase 6 — confirm only that `revalidatePath` does not throw), and that `totalOrderPrice` shown anywhere traces back to the order response, never browser arithmetic.

- [ ] **Step 3: Exercise failure paths**

Rapid double-click the "Place order" button on both flows — confirm exactly one network request (via browser DevTools Network tab) and no duplicate order. Force a `429` (submit near the 5/60s limit) and confirm the form/cart state is preserved with no auto-retry. If a second browser with admin access is available, drive `INSUFFICIENT_STOCK`/`INVALID_VARIANT`/`SHIPPING_NOT_AVAILABLE`/coupon-state errors and confirm each routes to the step `CheckoutErrorResolver` maps it to; if admin access isn't available in this environment, note that explicitly rather than claiming it was verified.

- [ ] **Step 4: Network inspection**

Confirm via DevTools Network tab that no request goes to the backend origin directly (`API_URL`) from the browser — every checkout call is same-origin (`/checkout`, `/checkout/guest`, or a Server Action POST). Confirm no response body anywhere contains `sessionToken` or a Clerk JWT.

- [ ] **Step 5: `bun lint` and `bunx tsc --noEmit`**

Run: `bun lint && bunx tsc --noEmit`
Expected: both exit 0. If `bun lint` fails only on the pre-existing unrelated `eslint-plugin-react`/`.agents/skills/**` tooling error noted in `docs/phase-2-guest-cart.md`, treat that as a known, unrelated failure — do not attempt to fix it here.

- [ ] **Step 6: Update `docs/README.md`**

Change the Phase 5 row's status from `**in progress**` to `**done**` — but only after every check above has actually passed. If any DoD item above could not be verified (e.g., no admin access to force stock/coupon errors), leave the row as `**in progress**` and add a short note in `docs/phase-5-checkout.md`'s Definition of Done section (mirroring the pattern already used in `docs/phase-2-guest-cart.md`) naming exactly what remains.

- [ ] **Step 7: Commit**

```bash
git add docs/README.md docs/phase-5-checkout.md
git commit -m "docs: mark Phase 5 checkout status per verification results"
```
