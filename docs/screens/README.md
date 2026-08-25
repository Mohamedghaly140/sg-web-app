# Screen Wireframes

> **Superseded by the approved Classical design.** These wireframes predate the approved visual
> design in [`docs/design_handoff_sg_storefront/`](../design_handoff_sg_storefront/README.md) and
> describe a different information architecture — a Home/Products/Categories nav, a four-column
> footer, horizontal-scroll rails — that Phases 8–12 replace. They are kept, not deleted, because
> they still carry non-visual behavioural notes (call-per-section data bindings, null-safe rating
> rules) that the handoff doesn't repeat. Treat the handoff as authoritative for layout,
> navigation, and visual design; treat these files as authoritative only for the data-fetching and
> null-handling notes the handoff doesn't cover.

Low-fidelity text/ASCII wireframes for each storefront screen, used to align on layout and content sections before implementation. Wireframes are illustrative, not pixel specs — real layout follows the Tailwind v4 tokens in `app/globals.css` and shadcn base-lyra primitives.

## Conventions

- Boxes are layout regions, not literal borders.
- `[ ]` marks an interactive element (button/link/input).
- `(scroll →)` marks a horizontally scrollable region.
- Wireframes show desktop first, then a narrow/mobile variant when layout materially changes.
- Every data-bearing section notes the exact backend call it renders (endpoint + query params), per `docs/integration/storefront/`. No section may show data without a documented call.

## Shared chrome

Navbar and footer are shared across every screen — see [`shared-shell.md`](./shared-shell.md). Screen files below reference it instead of repeating it.

## Screens

This table tracks these low-fidelity wireframe files only — it is not a design-coverage tracker.
The approved Classical design in
[`docs/design_handoff_sg_storefront/README.md`](../design_handoff_sg_storefront/README.md)
already covers all thirteen storefront screens (S1–S13); consult it, not this table, for what's
been designed. Rows below stay "not started" even for screens the handoff fully covers, since no
wireframe file was ever written for them and none is planned — the handoff supersedes this
wireframing exercise going forward.

| Screen | File | Status |
|---|---|---|
| Home | [home.md](./home.md) | drafted (superseded) |
| Products listing | — | not started |
| Product detail | [product-detail.md](./product-detail.md) | drafted (superseded) |
| Categories / category landing | — | not started |
| Cart | — | not started |
| Checkout | — | not started |
| Account (orders, addresses, wishlist) | — | not started |
