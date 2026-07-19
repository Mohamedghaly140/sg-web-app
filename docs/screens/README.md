# Screen Wireframes

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

| Screen | File | Status |
|---|---|---|
| Home | [home.md](./home.md) | drafted |
| Products listing | — | not started |
| Product detail | — | not started |
| Categories / category landing | — | not started |
| Cart | — | not started |
| Checkout | — | not started |
| Account (orders, addresses, wishlist) | — | not started |

Add a row and a file per screen as they get wireframed.
