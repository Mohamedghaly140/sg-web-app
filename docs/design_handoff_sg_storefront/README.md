# Handoff: SG Couture storefront UI

## Overview
Desktop web UI for the SG Couture storefront (Next.js app `Mohamedghaly140/sg-web-app`). Thirteen screens covering browse → product → cart → checkout (registered and guest) → confirmation, plus categories, contact, and the signed-in account area (overview, addresses, orders, order detail). Every screen is designed against the live storefront API contract in `docs/integration/storefront/` of that repo — field names, error codes and business rules in this document come from those docs, not from invention.

Brand line: *"A world of timeless designs that honor the people who make them & the places they're made."* Egyptian atelier, EGP pricing, English LTR, cash on delivery only.

## About the Design Files
The files in `designs/` are **design references created in HTML** — prototypes showing intended look, layout and copy. They are not production code to copy. Recreate them in the app's existing environment (Next.js App Router + React + Tailwind/shadcn per `components.json`) using its established patterns, components and data layer. `support.js` is only the preview runtime for the design files; it has no place in the product.

Open `designs/Storefront Screens.dc.html` in a browser to see all thirteen screens stacked; `designs/Options Board.dc.html` holds the earlier explorations (rejected variants included) for context on why the chosen patterns won.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, hairline structure and copy. Every value resolves from the Classical design system stylesheet in `tokens/classical-styles.css` — use those tokens (or their equivalents in the codebase's Tailwind theme) rather than the literal hex values where possible. Product photography is intentionally placeholder (`.plate`-matted grey blocks captioned "Image"); real Cloudinary `imageUrl` values from the API replace them 1:1.

## Design language (read this before any screen)
- **Ground**: `--color-bg #f3f2f2`, text `--color-text #201f1d`, single accent `--color-accent #b68235` (gold).
- **Color is stroke, never fill.** Buttons are outlined (1px accent border on transparent), cards are bordered and unfilled, sections are separated by 1px hairlines (`--color-divider`, = `#201f1d` at 16%). No filled accent blocks, no gradients.
- **Type**: Cormorant Garamond (`--font-heading`, weights 400/600) for headings, prices, product names; Lora (`--font-body`, 400/600) for body. Bold is avoided — display sizes set at weight **400**. Body copy is justified at a comfortable measure (`text-align: justify`, `max-width: 44–58ch`).
- **Figures are tabular**: every price, quantity, order id, count and date carries `font-feature-settings:'tnum'`. Running prose does not.
- **Elevation is a whisper**: `--shadow-sm/md/lg` only (`--shadow-lg` for the filter drawer and dialogs).
- **Photographs go through `.plate`**: `filter: sepia(.22) saturate(.82) contrast(1.05)`, `border: 6px solid var(--color-surface)`, `outline: 1px solid var(--color-divider)` — a matted book plate, used for every product/campaign image including 46–100px thumbnails.
- **Icons**: Lucide, 1.5–1.6 stroke, `currentColor`, 14–18px in interface positions.
- **States are themed, not default**: hover = accent tint (`color-mix(accent 12%)` on primary buttons, `text 7%` on secondary), pressed = one step darker (22% / 14%), focus = `outline: 2px solid var(--color-accent); outline-offset: 2px`. Disabled = 45% opacity. Never a browser-blue focus ring.

## Shared shell
**Header** (all storefront screens, `1px` bottom hairline, padding `var(--space-4) var(--space-6)`):
`SG·COUTURE` wordmark (Cormorant 22px, letter-spacing .04em, the middle dot in accent) · primary nav links (Lora 13.5px: New In, Dresses, Abayas, Sets, The Makers; active link and hover in accent) · persistent search input (230px, 36px tall, Lucide search glyph at 9px inset) · wishlist icon button (36×36 ghost) · **Bag · N** as an outlined primary button.
Account screens replace nav+search with the customer name and keep the bag button; checkout screens replace them with a context line ("Secure checkout · signed in as …" / "Have an account? Sign in").

**Account sub-nav** (S10–S13): 210px left column, section label "YOUR ACCOUNT" (10px, .14em, uppercase, 45% text), items at 13.5px with `padding: var(--space-2) 0 var(--space-2) 11px`; the active item takes `border-left: 1px solid var(--color-accent)` and accent text with padding-left 10px. Items: Overview, Orders, Addresses, Wishlist, Profile.

**Footer** (S1): 12px muted row — "Cash on delivery across Egypt · Delivery from 65 EGP · Track an order · © 2026 SG Couture".

**Page frame**: content max width 1280px, section padding `var(--space-6)` (27.6px), major gaps `var(--space-8)` (36.8px).

---

## Screens / Views

### S1 · Home
**Purpose**: establish the brand and route into the catalogue.
**Layout**: header → hero grid `1.15fr / 1fr`, gap `--space-8`, padding `--space-8 --space-6`: left a 520px-tall `.plate` campaign image, right centered copy — kicker "AUTUMN · 2026", `h1` 52px/1.03 weight 400 "A world of timeless designs", justified 44ch paragraph, then `Shop new in` (primary) + `Meet the makers` (secondary).
→ **The collections**: `h3` + "All categories" link over a hairline; three cards in a 3-col grid, each a 4:3 `.plate` with the category name below (Cormorant 19px) and its `productCount` right-aligned (12px muted, tnum).
→ **New in**: 4-col grid of product cards (see *Product card*), `gap: --space-4`, one card in each of the states: low stock, normal, sold out, normal.
→ **The makers**: 2-col band above a hairline — pull quote in Cormorant 24px/1.35 (max 34ch) with attribution 12px muted, and a 260px `.plate`.
**Data**: `GET /categories`, `GET /products?featured=true&limit=4`.

### Product card (used on S1, S2 — chosen variant `2a`)
Bordered `.card` with `padding: 0`, no gap. Top: 3:4 image area on `--color-surface` with a 1px bottom hairline; overlays — stock badge top-left at `--space-3` inset (`.tag.tag-outline` on `--color-bg` reading "Only 3 left", or `.tag.tag-neutral` "Sold out"), wishlist ghost icon button top-right at `--space-2`. Body `padding: --space-3`: product name (Cormorant 18px/1.15), subtitle (12px muted, `category · colors` e.g. "Evening · Black, Emerald"), then a baseline row — `priceAfterDiscount` (14.5px, tnum, "2,040 EGP"), original `price` struck through (12px muted), and the discount `.tag.tag-accent` ("−15%") pushed right with `margin-left:auto`. Sold-out cards render the body at `opacity: .6`.
Discount row only when `discount > 0`; stock badge when `quantity <= 3`; sold-out when `quantity === 0` (advisory only — stock is reserved at checkout).

### S2 · Product listing
**Purpose**: filter the catalogue down to what is in stock in your size.
**Layout**: header → title band (`h2` 34px "Dresses" + justified 56ch intro, hairline below) → controls row over a hairline: **Filter (5)** primary button + "4 of 12 pieces" (12.5px muted, tnum) on the left, "Sort: Top rated ▾" on the right (accent value) → applied-filter row: label "APPLIED" then one `.tag.tag-outline` per active filter with a ✕ ("Evening", "S", "M", "Black", "500 – 2,500 EGP") and a "Clear all" link → 4-col product grid, `gap: --space-4` → centered pagination (Previous / "Page 1 of 1" / Next, disabled buttons at 45%).
**Filter drawer** (open state shown as option `1h` in the options board): 340px panel over the grid, `--color-bg`, right hairline, `--shadow-lg`, `padding: --space-6`; header "Refine" + close icon button; sections Category (radios), Size (tag toggles), Colour (tag toggles), Price (two inputs) separated by hairlines; footer pinned to the bottom — `Clear` (secondary, flex 1) + `Show 4 pieces` (primary, flex 2). Grid behind sits at `opacity: .45`.
**Data**: `GET /products?category=&subCategory=&sizes=&colors=&minPrice=&maxPrice=&sort=&page=&limit=`; sort enum `newest | price_asc | price_desc | best_selling | top_rated`; `meta.totalPages/hasNext/hasPrev` drive pagination.

### S3 · Product detail
**Purpose**: choose a variant and add to bag.
**Layout**: header → breadcrumb row (12px muted, hairline below) → 2-col `1fr / 380px`, gap `--space-8`.
Gallery: `1fr / 108px` grid — a **660px fixed-height** hero `.plate` beside a vertical strip of three 3:4 thumbnail plates (`gap: --space-2`); the selected thumbnail's `.plate` outline switches to accent. (Do not give the hero an aspect ratio — that was the one broken variant.)
Buy box (self-aligned to start, `gap: --space-3`): kicker "DRESSES · EVENING" → `h2` 31px name → price row (Cormorant 22px `priceAfterDiscount`, 13px struck `price`, `.tag.tag-accent` discount) → "★ 4.5 · 12 reviews" 12.5px muted → hairline → Colour block (label "COLOUR — BLACK", 26px round swatches, selected gets `outline: 1px solid accent; outline-offset: 2px`) → Size block (label + "Size guide" link, `.seg` segmented control; unavailable size disabled at `opacity: .4`) → `.tag.tag-accent` "Only 3 left in this size" → **Add to bag** (primary, block, min-height 44px) → **Save to wishlist** (secondary, block) → justified 12.5px description → hairline → three 12.5px label/value rows (Delivery "Cairo, 2–4 days · 65 EGP", Payment "Cash on delivery", Returns "14 days, unworn").
Below, over a hairline: 3-col band — The making, Care, Reviews (two review excerpts in italic with "Name · ★ 4.5 · 18 Jul 2026" meta and a "Write a review" link).
**Data**: `GET /products/:slug` (gallery ordered by `sortOrder`, `subCategories` by name), `GET /products/:id/reviews`, `GET /shipping/fee?country=&governorate=&city=`.

### S4 · Cart (filled + empty)
**Purpose**: confirm what you are buying and move to checkout.
**Layout (filled)**: 2-col `1fr / 350px`. Left: "Your bag" `h3` + "Clear bag" ghost, hairline, then one row per line — 100px-wide 3:4 `.plate`, name (Cormorant 19px) with `lineTotal` right-aligned (14.5px tnum), "Black · M · 2,040.00 each" 12.5px muted, and a control row: quantity stepper built from `.seg` (− / value / +, value cell min-width 38px centered, tnum), a `.tag.tag-accent` "3 left" when stock is low, "Remove" ghost pushed right. Rows separated by hairlines; "← Continue shopping" link below.
Right summary `.card`: coupon input + Apply (secondary), hairline, "Before discounts" (struck `totalCartPrice`), "Items subtotal" (`totalPriceAfterDiscount`), "Shipping — calculated at checkout", hairline, Subtotal row (Cormorant 17px label / 21px value), **Checkout** primary block button (44px), then 11px justified note: "Stock is reserved when the order is placed, not while it sits in your bag. Guest bags are kept for seven days." (the seven days = anonymous cart `expiresAt`).
**Empty state** (520px frame): 96×120 `.plate`, `h3` "Your bag is empty", 13px muted 38ch copy, `Shop new in` (primary) + `Track an order` (secondary).
**Data**: `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:itemId`, `DELETE /cart/items/:itemId`, `DELETE /cart`, `POST /coupons/validate`.

### S5 · Checkout — registered (stepped)
**Purpose**: place an order from saved data with the fewest decisions on screen.
**Layout**: 2-col `1fr / 320px`. Step rail across the top (12px, .1em, uppercase, tnum): `01 Address ✓` and `02 Delivery` in accent (the current step underlined 1px accent), `03 Payment` / `04 Review` muted.
Completed step 01 collapses to a summary row (label "01 · ADDRESS", 13.5px value line, "Change" ghost) above a hairline. Open step 02: `h4` "02 · Delivery", two selectable `.card` rows (custom 16px radio dot — accent fill with `inset 0 0 0 4px var(--color-bg)`; selected card border switches to accent) carrying name, sub-line and fee right-aligned (tnum); then a "Notes for the courier (optional)" textarea (64px) and **Continue to payment** primary. Steps 03 and 04 render as muted labels; 03 carries "Cash on delivery — card payments coming soon".
Right summary `.card`: two line thumbnails (48px plates) with variant and line totals, coupon input + Apply with an accent-700 confirmation line ("SAVE20 applied — 20% off items"), the three-row money block, hairline, "Total so far", and the note "Confirmed at step 04. Nothing is reserved until you place the order."
**Data**: `POST /orders` `{ shippingAddressId, paymentMethod: "CASH", couponCode?, notes? }`. Throttle 5/60s — disable submit while in flight. CARD must stay disabled: it returns `422 PAYMENT_METHOD_UNAVAILABLE`.

### S6 · Checkout — guest
**Purpose**: order without an account.
**Layout**: same stepped frame; step rail `01 Contact / 02 Shipping / 03 Payment / 04 Review`. Step 01: 2-col field grid — Full name, Phone, and a full-width Email with the label "Email — receives the receipt and your tracking link". Step 02: 3-col field grid — Country, Governorate, City, Area, Phone at this address, Postal code (optional), plus full-width Street address and "Details for the courier"; below it a 12.5px row "Delivery to Nasr City, Cairo — 65.00 EGP" from the fee preview, then **Continue to payment**. Step 03 muted with "Card payments coming soon".
Summary `.card` closes with: "Checking out as a guest. We email a tracking link valid for 30 days — sign in with the same email later to keep the order in your account."
**Data**: `POST /orders/guest` with nested `contact { name, phone, email }` and `shipping { country, governorate, city, area, phone, addressLine1, details, postalCode?, latitude?, longitude? }`, sent with the anonymous cart identity (`cart_session` cookie on web, `X-Cart-Session` on mobile). Preview the fee with `GET /shipping/fee` before this step so `SHIPPING_NOT_AVAILABLE` never surprises at submit.

### S7 · Order confirmation
**Purpose**: prove the order exists and offer the claim path.
**Layout**: 760px centered column. Kicker "ORDER PLACED · 24 AUGUST 2026" → `h2` 36px "Thank you, Sara." → 13.5px justified 56ch paragraph naming `humanOrderId` (in body color, tnum) and the receipt email → hairline → 3-col meta band (Status `.tag.tag-accent` "Pending", Payment "Cash on delivery · 5,849.00 EGP", Delivery "Nasr City, Cairo · 2–4 working days") → hairline → `.table` of lines (Piece / Variant / Qty / Line total, numerics right-aligned tnum) → right-aligned 300px money block (Items subtotal, Discount · SAVE20, Shipping, hairline, Total in Cormorant 17/21px) → hairline → claim `.card`: "Keep this order in an account" with a **Create account** primary → `Track this order` (secondary) + `Continue shopping` (ghost).
**Data**: the 201 body of the checkout call. `totalOrderPrice = itemsSubtotal − discountApplied + shippingFees`. Guest responses carry `claimToken: "sent-by-email"` — the real token is only in the email.

### S8 · Categories
**Purpose**: an index of the whole catalogue, not a menu.
**Layout**: title band (`h2` 34px "The index", 58ch justified intro, "Updated hourly" 12px muted right) → 3-col grid, gap `--space-8`: each column is a 4:3 `.plate`, then a category row (name as a Cormorant 24px link in body color + `productCount` right, hairline under it), then one hairline-separated row per sub-category — name left, count right (12px muted tnum), the whole row a link into `?subCategory=`. Sub-categories with `productCount: 0` render at `opacity: .45` and are **not** links (a zero is a real answer, not a missing page — stated in a 11.5px note). Footer band: "SHORTCUTS" + four `.tag.tag-outline` links (New in, Under 2,000 EGP, Ready to ship, Top rated).
**Data**: `GET /categories` (unpaginated tree, counts are ACTIVE products only and may drift from a cached tree).

### S9 · Contact us
**Purpose**: reach the atelier; divert order questions into real tracking.
**Layout**: 2-col `1fr / 1fr`. Left: kicker "GET IN TOUCH", `h2` 38px/1.06 "Speak to the atelier", 46ch justified copy, hairline, 2-col contact facts (The atelier: address + "Sun–Thu, 11:00–19:00"; Direct: phone (tnum), email link, "WhatsApp on the same number"), hairline, an **Order help** `.card` — "Asking about an order you already placed?" with a tracking-code input + **Find order** primary, then a 220px `.plate` for a map/photograph. Right: "Write to us" `.card` — Name / Phone (optional) / Email fields, a topic row of `.tag` toggles (A piece I want, Sizing & fit, Alterations, Delivery, Returns, Something else), a 150px message textarea, a privacy line, and **Send message** primary block; below it two 12.5px policy columns (Delivery, Returns).
**⚠ Backend gap**: the storefront API has **no contact endpoint**. Either add one, or wire the form to email/WhatsApp. The Order-help field goes to `GET /orders/guest/:token` instead.

### S10 · Account overview
**Purpose**: answer "where is my order" first.
**Layout**: account sub-nav + content. Greeting `h3` with "Member since July 2026" right, hairline → **in-progress order `.card`** with accent border: kicker "IN PROGRESS" + `.tag.tag-accent` status; a row of two 52px line thumbnails, then `humanOrderId` (Cormorant 19px tnum), "Placed 24 Aug · 2 lines · cash on delivery · 5,849.00 EGP" (12.5px muted), and a four-stage status track — labels at 11px uppercase .06em with 1px connectors, completed stages and their connector in accent, the rest in `--color-divider`; actions column on the right (`View order` primary, `Cancel` secondary) → 2-col cards (Default address with "Manage" link; Profile with "Edit" link, meta "Email is managed by your sign-in") → "Earlier orders" `h4` + "All orders" link over a hairline, then a compact `.table` (order id tnum, date + line count muted, status tag, total right, "Details" link) → guest-claim `.card`: copy + tracking-code input + **Claim** primary.
**Data**: `GET /users/me`, `GET /orders?limit=3`, `GET /addresses`, `POST /orders/claim` (`token` exactly 64 chars).

### S11 · Addresses
**Purpose**: manage saved addresses; keep the default unambiguous.
**Layout**: account sub-nav, then content split `1fr / 400px`. Left: `h3` "Addresses" + **+ Add address** primary, a 12.5px count line, hairline, then one `.card` per address — alias (Cormorant 19px) with `.tag.tag-accent` "Default" or an "Added 02 Aug" date, the full address as `.card-body` (two lines: street/area/city/governorate/country/postal, then courier details + phone), and an action row: `Edit` (secondary), `Make default` (ghost; on the default itself a disabled "Already default"), `Delete` (ghost, pushed right).
Right: add/edit panel as a `.card` — title "Edit "Work"" + close icon; Label field; 2-col grid of Country, Governorate, City, Area, Phone, Postal code (optional); full-width Street address; a 60px "Details for the courier" textarea; a live 12.5px "Delivery here — 65.00 EGP · 2–4 days" row from the fee lookup; hairline; **Save address** primary (flex 1) + Cancel secondary; closing 11px note explaining that the default is changed from the list.
**Rules**: first address is forced default. `PATCH /addresses/:id/default` is the only way the UI changes the default — no `isDefault` checkbox in the form, because `isDefault: false` can leave the user with none. Deleting the default promotes the most recent remaining one; say so in the delete confirmation.
**Data**: `GET/POST /addresses`, `GET/PATCH/DELETE /addresses/:id`, `PATCH /addresses/:id/default`, `GET /shipping/fee`.

### S12 · Orders
**Purpose**: find an order and act on it.
**Layout**: `h3` "Orders" + "7 orders · newest first" (12.5px tnum) → status filter row of `.tag`s (All active as `.tag-outline`; Pending, Processing, Shipped, Delivered, Cancelled as `.tag-neutral`) → hairline → one `.card` per order, `gap: --space-3`:
header row — `humanOrderId` (Cormorant 20px tnum), status tag, date + line count right (12px muted tnum);
body row — up to three 46px line thumbnails, a 12.5px two-line summary (piece names; payment state + destination), and the total right-aligned (Cormorant 18px tnum) with "incl. 65.00 shipping" beneath;
action row — varies by status: **pending & unpaid** → `View order` primary, `Cancel order` secondary, "Need help with this order" ghost right; **delivered** → `View order` secondary, `Buy again`, `Write a review`; **cancelled** → whole card at `opacity: .75`, `View order` + `Buy again`, and the summary line states "Cancelled 29 Jul · stock returned, coupon released".
Centered pagination below.
**Rules**: render Cancel only when `status === "PENDING" && !isPaid`, and still handle `409 INVALID_STATUS_TRANSITION` by re-fetching and showing the new state. `itemsCount` is distinct lines — the copy says "lines", never "items".
**Data**: `GET /orders?status=&page=&limit=`.

### S13 · Order detail
**Purpose**: the full record, and the one action a customer can take.
**Layout**: breadcrumb (Account · Orders · ORD-000042) → 2-col `1fr / 340px`.
Left: `h3` order id (tnum) + status tag + "Placed 24 August 2026, 14:12" right → hairline → **four-column status timeline**: each column is a 1px top rule (accent for reached stages, divider otherwise) over a 12.5px stage label and an 11.5px timestamp/estimate ("24 Aug, 14:12" / "expected 25 Aug" / "—" / "2–4 working days") → hairline → "Two lines" `h4` with the 11.5px caveat "Prices as they were when you ordered", then one hairline-separated row per line: 88px 3:4 `.plate`, name (Cormorant 19px) + `lineTotal` right, "Black · M · 2 × 2,040.00" muted, and `View piece` / `Buy again` ghosts → 2-col band: "DELIVERING TO" (full address, phone muted) and "NOTE FOR THE COURIER" (the `notes` value in italic).
Right rail, three stacked `.card`s: **Payment** (money rows, hairline, Total 17/21px, then "Cash on delivery" with a `.tag.tag-outline` "Unpaid" and the 11px line "Pay the courier in cash when the parcel arrives"); **Need to change something?** (copy, **Cancel this order** primary block, `Message the atelier` secondary block, and the 11px warning "Cancelling returns the pieces to the shop and frees your coupon. It cannot be undone."); **Receipt** (kicker + `Download PDF` / `Email again` secondary buttons).
Cancel must open a confirmation dialog (`.dialog-backdrop` + `.dialog`, `--shadow-lg`) restating that stock returns and the coupon is released.
**Data**: `GET /orders/:id`, `POST /orders/:id/cancel`.

---

## Interactions & Behavior
- **Navigation**: wordmark → Home; nav links → listing per category; product card / "View piece" → PDP; Bag → cart; Checkout → S5 (signed in) or S6 (guest); Place order → S7; account sub-nav between S10–S13.
- **Filters**: opening the drawer does not fetch; **Show N pieces** commits the query and closes. Each applied `.tag` ✕ removes one filter and refetches. "Clear all" resets to the category default. Filter state belongs in the URL query so a filtered listing is shareable.
- **Variant selection**: colour/size drive availability; a size with no stock renders disabled, never selectable. Add-to-bag is disabled while a required variant is unchosen.
- **Quantity stepper**: `PATCH /cart/items/:itemId` with the *replacement* quantity (never 0 — use DELETE). Optimistic update, revert on error.
- **Coupon**: Apply calls the preview (`POST /coupons/validate`, 10/60s per IP) and shows the discount as an accent-700 line under the field; it is an estimate, revalidated at checkout.
- **Submit protection**: checkout is throttled 5/60s — disable the button for the whole in-flight request and show a spinner-in-button rather than a page overlay.
- **Wishlist**: idempotent `PUT/DELETE /wishlist/:productId` — optimistic fill of the heart, safe to retry. Unavailable wishlist entries (`available: false`) render disabled and unlinked.
- **Guest → user cart merge**: after sign-in, call `GET /cart` with the anonymous cookie/header still attached before anything else; the response is the merged user cart. Surface it as a quiet inline line in the cart ("We kept the 2 pieces from your bag"), not a modal.
- **Animation**: restrained — 120–160ms ease for hover tints and drawer/dialog transitions, 200ms for the drawer slide. No entrance animations on content.
- **Responsive**: designed at 1280px. Below ~1024px the two-column screens stack (summary rails move above the fold on cart/checkout, buy box under the gallery on PDP), the filter rail becomes the drawer, and grids step 4 → 3 → 2 → 1.

### Error and edge states (from the API contract — implement all)
| Case | Where | Treatment |
|---|---|---|
| `INSUFFICIENT_STOCK` (409) | add to bag, cart, checkout | inline on the offending line using `errors[]` `{productId, requested, available}` — "Only 2 left — quantity reduced"; never a toast alone |
| `INVALID_VARIANT` (422) | add to bag, checkout | disable the vanished colour/size and refetch the product |
| `CART_EMPTY` (422) | checkout | route back to the empty-cart state |
| `COUPON_*` (404/422/409) | coupon field | distinct copy per code: invalid · expired · deactivated · fully used · already used by you. Branch on `code`, never on `message` |
| `SHIPPING_NOT_AVAILABLE` (422) | address/shipping step | inline under the city/governorate fields, with a "message the atelier" fallback; preview early with `GET /shipping/fee` |
| `PAYMENT_METHOD_UNAVAILABLE` (422) | payment step | CARD stays disabled with "coming soon" — never submittable |
| `INVALID_STATUS_TRANSITION` (409) | cancel | "This order has already moved on" + refetch and re-render |
| `CLAIM_TOKEN_INVALID` (404) | guest tracking / claim | one message only: "This tracking link is invalid or has expired" |
| `RESOURCE_NOT_FOUND` on a product slug (404) | PDP | treat as gone: drop from caches, offer the category |
| Loading | listing, PDP, orders | skeletons that match the final geometry — `--color-surface` blocks at the plate's aspect ratio and 12px text bars at 55–75% width, no spinners in content areas |

## State Management
- **Cart**: server-owned; client keeps `{ id, items[], totalCartPrice, totalPriceAfterDiscount, expiresAt }` from the last mutation response (every mutation returns the whole cart — replace, don't patch). Guest identity is the `cart_session` cookie (credentialed requests) / `X-Cart-Session` header.
- **Listing**: filters, sort and page live in the URL; results and `meta` cached per query key.
- **PDP**: selected colour/size local; product and reviews server-fetched by slug/id.
- **Checkout**: step index, selected `shippingAddressId` (or guest contact/shipping form), coupon preview result, notes; submit lock while in flight.
- **Account**: `GET /users/me`, addresses list, orders page + status filter; refresh order data on screen entry — there is no polling contract.
- **Auth**: Clerk bearer token; the merge call fires once on sign-in.

## Design Tokens
Copy `tokens/classical-styles.css` verbatim as the source of truth (it also carries the full component layer for `.btn`, `.tag`, `.card`, `.input`, `.seg`, `.radio`, `.nav`, `.table`, `.dialog`, `.hr`, `.plate`). Key values:

**Color** — bg `#f3f2f2` · surface `#eae9e9` · text `#201f1d` · accent `#b68235` · divider `color-mix(in srgb,#201f1d 16%,transparent)`.
Neutral ramp 100–900: `#f8f4f4 #eae7e7 #d7d3d3 #bab6b6 #9b9797 #7d7979 #605d5d #444141 #2d2b2b`.
Accent ramp 100–900: `#fff3e4 #ffe3bf #facb8d #e1ad66 #c28d41 #a06f24 #7d5411 #5a3b0a #3a270d`. Accent text at body size uses `--color-accent-700`; accent-2 is a stand-in for the same role — treat the palette as mono.

**Spacing** (1.15× density): `4.6 · 9.2 · 13.8 · 18.4 · 27.6 · 36.8px` (`--space-1/2/3/4/6/8`).
**Radius**: `2 / 4 / 7px` (`sm/md/lg`).
**Shadows**: sm `0 1px 2px #2d2b2b@14%` · md `0 3px 10px #2d2b2b@16%` · lg `0 12px 32px #2d2b2b@22%`.
**Type scale**: h1 42 · h2 32 · h3 25 · h4 20 · h5 16 · h6 13px uppercase .08em; body 15px/1.55; headings line-height 1.12, letter-spacing −0.015em. In-screen overrides used above (52/38/36/34/31/24/22/21/20/19/18/17px display sizes at weight 400) are deliberate. Small text: 13.5px controls, 12.5px secondary, 12px meta, 11.5/11px notes; kicker 10px uppercase .14em at 45% text.
**Fonts**: `Cormorant Garamond` 400/600 and `Lora` 400/600 — Google Fonts (`@import` at the top of the stylesheet). Headings cap at 600; never substitute a sans-serif for emphasis.

## Assets
- No production imagery. Every image is a `.plate` placeholder — replace with `imageUrl` / gallery `images[]` from the API (Cloudinary). Hero and campaign slots need art direction at ~3:4 (product) and 4:3 (category).
- Icons: Lucide, inline SVG on `currentColor` (search, heart used here).
- Fonts: Google Fonts, imported by the stylesheet.
- Contact page needs a map or atelier photograph.

## Files
- `designs/Storefront Screens.dc.html` — S1–S13, each in a `<section>` with `data-screen-label`.
- `designs/Options Board.dc.html` — the exploration board: chosen options are `2a` (product card), `1b` (header), `1h` (PLP filters), `1i` (PDP), `1l` (checkout); the rest are rejected alternatives kept for context.
- `designs/support.js` — preview runtime for the two HTML files only; do not ship.
- `tokens/classical-styles.css` — the design system: tokens + component classes. Source of truth for every value.
- `tokens/classical-readme.md` — the design system's own guidance (do/don't, direction, component table).
- Source API contract: `docs/integration/storefront/*.md` in `Mohamedghaly140/sg-web-app` (00-conventions covers auth modes, the response envelope, pagination, money/date formats and the error-code table).

## Not designed yet
Wishlist page, profile edit form, sign-in/sign-up, guest order tracking page, and mobile/RTL layouts. The account sub-nav links to Wishlist and Profile already, so those two are the next screens to draw.
