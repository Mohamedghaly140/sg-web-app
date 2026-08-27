# Phase 11 — Contact & Order Help (S9)

**Objective:** ship the contact screen as a new route, with its order-help half fully wired to the real tracking lookup and its message half handled honestly while no contact endpoint exists.

**Prerequisites:** Phase 10 DoD.

**API surface:** `GET /orders/guest/:token` (Public, 10/60s). **No contact endpoint exists** — see GAP-5.

**This phase is net-new work, not a re-skin.** There is no `/contact` route, no contact feature, and no `contact` directory anywhere in the repo today.

## The backend gap, stated plainly

The storefront API has **no contact, message, enquiry or support endpoint**. Three separate surfaces in the approved design depend on one: this screen's form, screen S13's "Message the atelier" button, and the `SHIPPING_NOT_AVAILABLE` recovery fallback. This is filed as **GAP-5** in `docs/backend-contract-gaps.md`.

Until it is answered, this phase follows the repo's established precedent — the footer newsletter shipped **visibly disabled rather than faked**, because no subscribe endpoint exists. Applying that principle here does not mean disabling the screen; it means never rendering a success state we cannot prove.

## Tasks

### 11.1 Route and feature scaffold

- [x] Create `app/contact/page.tsx` as a thin page rendering `ContactFeature`, with `generateMetadata`. Keep it a Server Component; the two interactive forms are the only client boundaries.
- [x] Create `features/contact/` following the house shape: `index.tsx` exporting a default `ContactFeature` Server Component, `components/contact-form.tsx`, `components/order-help-form.tsx`, and `schema/contact-message-schema.ts`.
- [x] Add `lib/constants/atelier.ts` as the single source for the atelier's address, opening hours, phone, email and WhatsApp number. **Mark every value as a placeholder awaiting client sign-off, and do not invent a phone number** — a fabricated contact detail is materially worse than a visibly missing one. If a value has not been supplied, omit that row rather than filling it.
- [x] Add `/contact` to the Phase 8 footer row, and note the route for `app/sitemap.ts` in Phase 15.

### 11.2 Left column — atelier facts and order help

- [x] Compose the left column per the design: a kicker, a 38px/1.06 `h2`, 46ch of justified copy through `.measure`, a hairline, then a two-column facts block (The atelier: address and hours; Direct: phone in tabular figures, email link, and the WhatsApp note), a hairline, the Order help card, and a 220px `.plate` for the map or atelier photograph.
- [x] Flag the map/photograph as a **content gap**. Ship the plate placeholder rather than embedding a third-party map — a `<script>` from an external map provider would also be the app's first such dependency and needs its own decision.
- [x] Build the **Order help** card: the design's copy, a tracking-code input, and a `Find order` primary. This half of the screen is fully backed by the contract and must actually work.
- [x] Reuse the existing pieces rather than writing new ones: `features/orders/schema/claim-token-schema.ts` for the exact 64-character validation, and `features/orders/queries/get-guest-order.ts` as the already-implemented lookup.
- [x] **Navigate to `/orders/track/[token]`; do not fetch the order into the contact page.** Phase 6 established that the tracking token may appear only in that one browser path and its server-side call. A client-side `router.push` to the tracking route puts the token exactly where it is already permitted; a contact-page Server Action that returns order data would create a **second** surface holding order data with its own leak paths, its own caching questions, and its own error envelope. Validate the token's shape client-side, then navigate.
- [x] Honour the tracking route's existing rules: `CLAIM_TOKEN_INVALID` produces **one** message — "This tracking link is invalid or has expired" — with no distinction between invalid and expired; the lookup is limited to 10/60s; and nothing auto-retries or polls.

### 11.3 Right column — the message form

- [x] Compose the "Write to us" card per the design: Name, optional Phone, and Email fields, a topic row of tag toggles (A piece I want · Sizing & fit · Alterations · Delivery · Returns · Something else) on the Phase 8 segmented/tag control, a 150px message textarea, the privacy line, and a block `Send message` primary. Below it sit two 12.5px policy columns for Delivery and Returns.
- [x] Write `schema/contact-message-schema.ts` as a Zod whitelist over the six fields, using v4 idioms — `z.email()` rather than `z.string().email()`, and `z.enum()` for the topic. Validate client-side so the customer gets real field errors.
- [x] **Implement the fallback as a `mailto:` composer.** On valid input, URL-encode the composed message into `mailto:<atelier email>?subject=<topic>&body=<message>` and make the primary control a **link, not a submit**. Place a WhatsApp deep link (`https://wa.me/<number>?text=…`) beside it — the design already promises "WhatsApp on the same number". Render a visible 11px line stating that the message opens in the customer's mail app, so the behaviour is never a surprise.
- [x] **Write no Server Action and no success state.** There is nothing to submit to, so there is nothing to confirm. Do not render a "Thanks, we'll be in touch" state, do not store the draft server-side, and do not add an optimistic anything.
- [x] Record in the component what this fallback costs, so the trade is visible when GAP-5 is answered: no delivery confirmation, no record of the message in our own systems, and no server-side attachment of a signed-in customer's identity.
- [x] Structure the form so that swapping the `mailto:` link for a real `POST /contact` Server Action is a contained change — the schema, the fields and the layout all survive; only the submit path changes.

### 11.4 Follow-through

- [ ] Once `/contact` exists, wire the `SHIPPING_NOT_AVAILABLE` fallback link left out of Phase 10 task 10.4.
- [ ] Note for Phase 12 that screen S13's "Message the atelier" button now has a real destination — this is why Phase 11 precedes Phase 12 rather than following it.
- [ ] Update GAP-5's fallback paragraph in `docs/backend-contract-gaps.md` to record what actually shipped.

## Definition of Done

- `/contact` renders and matches `designs/Storefront Screens.dc.html`'s "Contact us" screen at 1280px, with the map and any unsupplied atelier facts visibly placeholdered rather than invented.
- **The order-help lookup resolves a real tracking token** and navigates to `/orders/track/[token]`, and the token never appears in the contact page's own network activity, logs or client state.
- An invalid or expired token produces exactly one generic message.
- The message form validates all six fields inline, opens a correctly pre-filled mail composer, and offers a working WhatsApp link.
- **The message form renders no success state**, and a reviewer reading the code can see there is no submit endpoint.
- `/contact` is reachable from the footer.
- `bun run build` succeeds.
- `bun lint` and `bunx tsc --noEmit` pass.

## Out of scope

A real `POST /contact` submission path, which is blocked on GAP-5. An embedded map. Newsletter subscription, which remains out of the contract entirely. The account area is Phase 12.
