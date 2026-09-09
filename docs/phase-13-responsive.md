# Phase 13 — Responsive (derived mobile and tablet across all fifteen screens)

**Objective:** make every Classical screen work from 360px upward, deriving the breakpoint behaviour ourselves and recording each decision for design review.

**Prerequisites:** Phase 12 DoD.

**API surface:** none.

**The designs are 1280px only.** The handoff gives one paragraph of guidance — grids step 4 → 3 → 2 → 1, two-column screens stack, summary rails move above the fold, the buy box goes under the gallery, and the filter rail becomes a drawer. Everything else in this phase is our judgment, which is why 13.7 requires writing the decisions down rather than leaving them implicit in class strings.

**The account slice landed early, in Phase 12.7.** `docs/phase-12-account-area.md`
§12.7 shipped the responsive derivation for the six account screens,
`/orders/track/[token]` and the account sub-nav, because Phase 12 had closed with
those surfaces unusable below ~768px. Bullets already satisfied for the account
area are marked *(account done in 12.7)* below — Phase 13 **verifies** those and
extends the same decision to the screens 12.7 did not touch, rather than
rebuilding them. Every derived decision 12.7 made is already recorded in the
§13.7 table.

## Tasks

### 13.1 Frame and grids

- [x] Keep the page frame at `max-w-[1280px]` with the Classical section padding, and keep Tailwind's default breakpoints. Do not introduce custom breakpoints for one screen. *Landed: category detail now uses the same 1280px frame and `px-4 sm:px-6 lg:px-8` ladder as the other public pages; no breakpoint override was introduced. Phase 9 §9.5's S8 implementation is present in `categories-feature.tsx` and `category-column.tsx` and was adjusted here, but remains unticked pending Phase 9 sign-off.*
- [x] Apply the product grid ladder as `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, and the category and collections ladder as `1 / 2 / 3`. Use it consistently on home, listing, category detail, related products and wishlist so a customer never sees two different column rhythms at the same width. *Landed on home and the listing (live grids and Suspense skeletons in lockstep, plus matching `next/image` hints) and on the categories index, whose grid had no responsive prefix at all and ran three columns down to 320px. **Three deliberate deviations from this bullet's own wording**, all recorded in §13.7: (1) **wishlist keeps `1 / 2 / 3`** — its account content column is 959.6px rather than the public frame's 1206.4px, so a fourth column would be ~221px cells against the public grid's 276px, a different rhythm rather than the same one; (2) the three-item **collections strip stays `1 → 3`**, because a two-column rung orphans the third card as 2 + 1; (3) **category detail and PDP related products are not grids at all** but horizontal scroll rails, and neither is a designed screen in the handoff — a rail is not a column rhythm, so both are exempt from the ladder and only their image mat sizing, skeleton overflow and keyboard focus were aligned.*
- [x] Step the multi-column field grids down: guest checkout's three-column shipping grid becomes two then one; the address form's two-column grid becomes one. *(account done in 12.7: only the `columns === 2` branch of `address-form-fields.tsx`.)* *Landed: the `columns === 2` address branch is unchanged; the guest `columns === 3` branch is now `1 / 2 / 3` at base/`sm`/`md`. Three more unprefixed field grids of the same kind were pulled in so they would not fall between phases — guest contact, contact delivery/returns and atelier facts, all `1 / 2` at base/`sm`. `order-confirmation.tsx`'s `grid-cols-3` meta band is explicitly assigned to §13.6, not left unassigned; `order-status-stepper.tsx`'s `grid-cols-4` stays as-is per 12.7's recorded exception.*

**Verified in a browser** (2026-09-09) against a live `sg-backend-app`, at
360 / 414 / 640 / 768 / 1024 / 1280 / 1440 on `/`, `/products`, `/categories`,
`/categories/dresses`, `/products/[slug]`, `/checkout/guest` and `/contact`,
measuring computed `grid-template-columns`, `documentElement.scrollWidth` against
`innerWidth`, every element painting past the viewport, and — per the 12.7 lesson
that `Card`'s `overflow-hidden` hides clipping from the scroll metric — every
element whose `overflow-x` is `hidden` while its content is wider than its box.

- **Product ladder holds exactly**: `/products` and both home bands step
  1 / 1 / 2 / 2 / 3 / 4 / 4 across the seven widths. Listing cells are 308px at
  360, 276px at 640, 300px at 1024 and 284px at 1280 (the 1280 figure is 287.8
  minus a 15px scrollbar, so the frame arithmetic is confirmed).
- **Categories index** steps 1 / 1 / 2 / 2 / 3 / 3 / 3, with a 378px cell at
  1280 — the computed 377.6 exactly.
- **Collections strip** steps 1 / 1 / 3 / 3 / 3 / 3 / 3 as intended, giving 172px
  cells at 640 and 379px at 1280.
- **Guest checkout shipping fields** step 1 / 1 / 2 / 3 / 3 / 3 at
  360/414/640/768/1024/1280, reaching the shipped 3-up composition at `md` with
  ~190px cells, unchanged at 1280. Guest contact steps 1 / 1 / 2 / 2 / 2 / 2.
- **No clipped content anywhere.** The only `overflow-x: hidden` element whose
  content exceeds its box is an `h1.sr-only`, which is the screen-reader clip
  idiom, not a defect.
- **Image hints resolve sanely**: card sources land on Next's 256px and 384px
  rungs against 262–372px rendered boxes at every width — no repeat of the ~17px
  request 12.7 found. Rails were left as rails and still scroll.
- **One defect found and fixed here**: `/categories` scrolled horizontally at
  360px (380px against 360px). The Shortcuts band was a nowrap
  `flex items-center gap-3` whose label plus three tags need ~380px on one line.
  It now wraps. Nothing else on any measured route overflowed at 360px.
- **Two overflows found in the header**, which 13.1's grid work does not own.
  The checkout-variant one was fixed on request because it broke a
  conversion-critical screen; the 640px storefront one is recorded against
  §13.4 and left for that task's header rework. Both predate this diff.

### 13.2 Two-column screens

- [x] Stack every `1fr / Npx` layout below `lg` (1024px). *Already held everywhere: `cart-content.tsx:180`, `product-detail-feature.tsx:116`, `order-detail-view.tsx:39`, `features/home/components/hero.tsx:7` and `features/contact/index.tsx:8` each carry a `lg:`-only `grid-cols` declaration with no base-width column declaration, so all five stacks already existed and none needed rebuilding.*
- [x] On cart and both checkouts, move the **summary rail above** the content, per the handoff's "summary rails move above the fold". Implement with `order-first lg:order-last` rather than duplicating the markup. *Landed on cart as `order-first lg:order-last` on `CartSummary`'s own root: the summary paints above the bag below `lg`, while staying last in the DOM after the bag lines because bag-before-totals is the correct reading and tab order for a screen reader at both widths. Both checkouts are N/A, recorded rather than built: Phase 10.2/10.3 shipped single-column stepped wizards (`features/checkout/index.tsx:23` at `max-w-5xl`, `features/checkout-guest/index.tsx:5` at `max-w-2xl`, with `flex flex-col gap-6` bodies at `registered-checkout-content.tsx:197` and `guest-checkout-wizard.tsx:196`), and `CheckoutCartSummary` lives inside the review step's card at `registered-review-step.tsx:42` and `guest-review-step.tsx:65`. There is no `1fr / Npx` grid or persistent rail to reorder; hoisting the summary out of the review card would be a new composition, not a breakpoint change.*
- [x] On product detail, move the buy box under the gallery. *Already held by source order at `product-detail-feature.tsx:116`: the gallery precedes the buy box in the single-column base grid, with the `1fr / 380px` pair introduced only at `lg`; no `order-*` override was needed.*
- [x] On order detail, move the right rail below the timeline and lines. *(account done in 12.7 — in fact it already held: `order-detail-view.tsx:39` was written mobile-first with a `lg:`-only two-column grid, so the rail already fell below. Verified, not changed. The same component also serves public `/orders/track/[token]` through `order-tracking-feature.tsx:29`, as well as the account route through `order-detail-feature.tsx:23`; 12.7 verified only the account route.)*
- [x] On addresses, stack the edit panel above the list when it is open, so the form the customer just opened is what they see. *(account done in 12.7 as `order-first lg:order-last` on the editor `<aside>`; verified here with no markup duplication and no further change.)*

### 13.3 The product-detail gallery exception

- [x] Preserve the shipped mobile gallery below `sm`, and cap the thumbnail-strip/hero pair in the `sm`–`lg` band instead of deriving height from the runaway width. *Landed: below `sm`, the gallery was already the full-width snap carousel with tick indicators specified by `docs/screens/product-detail.md` §Narrow width and was left untouched. The real gap was 640–1023px, where the desktop grid renders inside the PDP's single stacked column. Measured before the cap:*

  | Viewport | Hero box | Width / height |
  |---:|---:|---:|
  | 640px | 472 × 660 | 0.72 |
  | 768px | 600 × 660 | 0.91 |
  | 1023px | 855 × 660 | **1.30 — the defect** |
  | 1024px | 428 × 660 | 0.65 |
  | 1280px | ~684 × 660 | ~1.04 |

  *`aspect-[3/4]` was measured and rejected: it computes a 629px-tall hero at 640px, no material improvement over 660px, and a **1140px-tall hero at 1023px**, taller than the viewport. `aspect-ratio` derives height from width, but width is the runaway variable. A centred `max-w-[792px]` cap below `lg` instead limits the 108px thumbnails + 12px gap + hero pair to its designed width, so the hero tops out at about 672 × 660.*
- [x] **Record the Phase 9 relationship in the code and phase notes.** *The prescription changed after measurement: no aspect-ratio exception was needed after all, so Phase 9 §9.5's "do not give the hero an aspect ratio" rule remains in force at every width; the hero keeps `h-[660px]`. The `cldUrl` crop at 600 × 648 was treated as verify-then-decide and left unchanged because `object-cover` absorbs the resulting 0.72–1.02 hero-box ratio across the capped band without requiring a second source.*

### 13.4 Shell

- [x] Collapse the header nav into the existing `Sidenav` sheet below ~~`sm`~~ **`lg`**, and turn the persistent search into an icon that expands — using the shared `SearchField` from Phase 8 in ~~both places~~ **both header states**, so the two never drift again. *Two deliberate deviations from this bullet's own wording, both recorded in §13.7. (1) **The boundary is `lg`, not `sm`.** `sm` is where the header breaks: the pile-up measured at 640px happens because that breakpoint reveals the nav, the 230px search and the Sign in / Sign up pair all at once. The whole desktop cluster now appears at `lg`, matching the account sub-nav's boundary from 12.7, and below it the `Sidenav` owns nav, categories, wishlist and auth. `md` is not impossible — with icon-search the cluster needs roughly 661px against 712.8px — but it leaves no margin, so `md` is listed as a designer-review ambiguity rather than shipped. (2) **The `Sidenav`'s own search field was removed**, so "both places" is now the header's two states (the `lg`+ inline form and the below-`lg` expanding panel) rather than header + menu. One search affordance per width, reachable without opening the menu, still one shared `SearchField`.*
  *The expanding panel (`components/shared/header/header-search.tsx`) is absolutely positioned at the header's `top-full` rather than wrapped into the flex row: it must not compete for width in the row this task exists to unbreak, and dropping it out of flow keeps the header at a constant 65px open or closed. Its openness is derived from the route it was opened on plus an `onSubmit` close, not synchronised in an effect — `react-hooks/set-state-in-effect` rejects the effect form.*
- [x] Keep the `Bag · N` button visible at every width; it is the primary conversion control. *Already held and verified, not changed: the trigger at `cart-drawer.tsx` and its parent cluster carry no responsive prefix. Asserted present at all seven widths on all eight measured routes.*
- [x] Collapse the account sub-nav into a horizontally scrolling tab row below `lg`, keeping the accent active treatment as an underline rather than a left border in that orientation. *(done in 12.7, verified here, no code change. `overflow-x-auto` sits on the `<nav>` itself; one `<Link>` set with orientation-conditional classes, never two navs.)*
- [x] Verify the three header variants (storefront, account, checkout) each collapse sensibly rather than only the default one. *(Finding from the 12.7 audit, recorded not fixed: on `/account` at `sm`+ there is no nav and no search — that is the handoff verbatim ("Account screens replace nav+search with the customer name"), so it is not a bug. The genuine oddity is that the `sm:hidden` hamburger gives mobile account users a catalogue nav that desktop account users do not get. Decide that here. The checkout variant's context line also wraps to three lines at 360px with no `truncate` or `min-w-0`.)*

  **Both defects below were measured in the 13.1 pass and recorded there; both are now FIXED in this task. The decision on the third-variant oddity: the `/account` asymmetry is kept and the `/checkout` menu is removed — see the resolutions after each measurement.**

  *Resolution of the oddity itself: **`/account` keeps the mobile menu.** The desktop account header drops nav and search by design (the handoff's "Account screens replace nav+search with the customer name"), and the wordmark is the desktop route back to the catalogue; removing the menu would leave a phone with no navigation at all, which is a worse answer than an asymmetry. **`/checkout*` loses it.** Checkout is a focus flow and a catalogue menu inside it is a leak. `Sidenav` returns `null` on the checkout variant, which also removes the `UserButton` and the wishlist icon there below `lg` — accepted, and it is chrome removal rather than a redirect or a gate, so the guest-first stance is untouched. Both gates read one `useHeaderVariant()` (`components/shared/header/use-header-variant.ts`), which replaces the `startsWith` matching that Phase 8 had duplicated across components.*

  **The original measurements:**

  - **FIXED — the storefront header overflowed at exactly 640px, on every public route.** `documentElement.scrollWidth` is **708px against a 640px viewport** on `/`, `/products`, `/categories`, `/categories/[slug]`, `/products/[slug]` and `/contact` — a 68px overflow. At `sm` the header reveals the nav (`New In` + Categories menu), the 230px `SearchField` and the Sign in / Sign up pair all at once, while `components/shared/header/index.tsx:15` is a single `flex … gap-4` row with no wrap, no `min-w-0` and no width budget. It is clean at 414px and below (the `sm:hidden` hamburger path) and clean again from 768px. This is exactly what this bullet's first two items are for: collapsing the nav into `Sidenav` and turning search into an expanding icon removes the 640px pile-up rather than patching it. **Re-measured after the fix: 640px is clean on every one of those routes, as are 360 / 414 / 768 / 1024 / 1280 / 1440.**
  - **The checkout header variant overflowed at 360px — FIXED in the 13.1 pass**, at the project owner's request, because it broke a conversion-critical screen and the fix is independent of the nav/search rework above. `/checkout/guest` and `/checkout` reported **391px against 360px**: `header-nav-area.tsx` rendered the context line as a bare `<span class="text-eyebrow">` with `0.14em` tracking, no `min-w-0` and no `truncate`, inside the same nowrap row. 12.7 recorded it as wrapping to three lines; by this pass it was real horizontal page scroll.

    **`min-w-0 truncate` alone was measured and rejected.** The row's other children — a 143px wordmark, a 119px control cluster and two 18.4px gaps — leave the context line only **9.4px at 360px, 63px at 414px and 112px at 640px**, against the **131px** the words "Secure checkout" need on their own and **335px** for the full string. Truncating therefore yields an unreadable stub at every narrow width, not a graceful ellipsis. The line is now `hidden … md:inline`: absent below 768px, truncated at 768px where 240px is available, and full from `lg`. Verified at all seven widths on both checkout routes — no horizontal scroll, header height constant at 65px.

    **Consequence this task must resolve — RESOLVED:** the header link was the *only* sign-in affordance on guest checkout — `features/checkout-guest/` contains no sign-in link of its own — so below `md` a returning customer now has no way to sign in from the checkout screen. It was already unusable there (a 9px stub, or an off-screen overflow before that), so this is a disclosure of an existing gap rather than a new regression, but it needs a real answer: either an in-body "Have an account? Sign in" row in the guest flow, or a narrow-width home for the context line. That is a composition decision, not a breakpoint one.

    **Answered with the in-body row.** `features/checkout-guest/components/guest-sign-in-row.tsx` renders "Have an account? Sign in to use your saved addresses" under the step rail on step 01, at *every* width, so the affordance no longer depends on the header having room and the flow does not change shape by viewport. It sits **outside `<Form>`**, beside the `CompletedStepSummary` rows, because a Clerk trigger inside the checkout form would be a button in that form; it therefore also leaves the screen once the customer has committed to guest details.

    **It returns to `/checkout`, not `/checkout/guest`.** Signing in performs the implicit merge and deletes `sg_cart_session`; coming back to the guest wizard would then push a merged *user* cart at `POST /orders/guest` and throw away the saved addresses the customer signed in to use. The header's `md`+ context line was changed to the same `SignInButton mode="modal" fallbackRedirectUrl="/checkout"` at the same time — it was a bare `href="/sign-in"` with no return URL, so the `md`–`lg` band was exposing two different sign-in behaviours on one screen.

### 13.5 Filters and overlays

- [x] The listing filter panel is already a `Sheet` ✅, so this is a breakpoint concern rather than a rebuild: give it a bottom-sheet presentation below `sm` where a 340px side panel is most of the viewport, and keep the applied-filter tag row horizontally scrollable rather than wrapping into three lines. *Both landed, and the drawer's implementation is the one part of this task that had to be done a specific way.*
  - ***The `side` prop is flipped, not overridden.*** The call site now passes `side="bottom"` as the **base** case and restores S2's 340px left rail with `data-[side=bottom]:sm:*`. Writing it the other way round — keeping `side="left"` and adding unprefixed mobile classes — was considered and **rejected as a silent no-op**: the primitive writes the rail as `data-[side=left]:…` attribute selectors, which beat a bare class on specificity *and* sit in a different tailwind-merge variant group, so the bottom sheet would never have applied while the horizontal enter/exit transform kept firing. That is `docs/phase-8-primitives-and-shell.md`'s "Anatomy warning" trap verbatim. A `matchMedia`-driven runtime `side` was also rejected: the variants are CSS, and it would add client state for something CSS already expresses. Measured after the change — **360px: a 360×494 sheet rising from the bottom at `rounded-t-lg`, capped at `max-h-[85svh]`, with the `Clear` / `Show N pieces` footer ending at 782px in an 800px viewport; 640 / 768 / 1280: the unchanged 340px full-height left rail.** Panel padding is `p-4 sm:p-6` so the sheet and the page share one gutter at 360px. Committing a filter still writes the URL once (`?sizes=M`) and closes the sheet, and opening still issues no request.
  - **The applied-filter row scrolls below `sm`** as `flex-nowrap overflow-x-auto` with `shrink-0` on the label, every badge and "Clear all", and an `-mx-4 px-4` bleed so tags run edge to edge inside the feature's own `px-4`. It needs no vertical inset of its own — unlike the account sub-nav's `gap-1` tab row, this row's existing `py-3` (13.8px) already clears the global 2px outline at a 2px offset. Measured with eight tags: **360px one 51px line, 725px of content scrolling inside a 360px box, no page scroll; 640px and 1280px unchanged (wrapping, `overflow-x: visible`).** Pure CSS — the tags stay server-rendered links.
- [x] Verify the cart drawer, `ConfirmDialog` and `RequireAuth` dialogs at 360px — base-ui panels take `w-3/4` and `sm:max-w-sm` by default, which needs checking against the Classical padding. *The Sheet default did fail and was fixed at the primitive; the AlertDialog default passed and was left alone.*
  - **`w-3/4` left a 270px panel at 360px — a 90px scrim.** `components/ui/sheet.tsx` now gives left/right panels `w-[calc(100%-3rem)]` below `sm`, keeping `sm:max-w-sm`, written in the same `data-[side=…]` variant group as the width it replaces so per-call-site overrides still dedupe. Measured: **cart drawer and `Sidenav` 312px at 360px, 366px at 414px, 384px from 640px (the `sm:max-w-sm` cap).** `w-3/4` is base-lyra's default rather than a design value, so this is a defaults fix; amended into `docs/phase-8-primitives-and-shell.md` §8.6 per 12.7's precedent for `CardFooter`.
  - **`AlertDialog` needed nothing.** `RequireAuth` measured **320px wide at x=20 in a 360px viewport** — 20px gutters against the page's 18.4px `px-4`, no page scroll. `w-full max-w-xs` is already correct at this width; no speculative change was made.

**Verified in a browser** (2026-09-09) against a live `sg-backend-app`, at
360 / 414 / 640 / 768 / 1024 / 1280 / 1440 on `/`, `/products`, a filtered
`/products`, `/categories`, `/contact`, `/cart`, `/checkout/guest` and
`/account`, asserting `documentElement.scrollWidth <= innerWidth`, every element
whose `overflow-x` is `hidden` while its content is wider than its box, and the
presence of the Bag button, the hamburger, the search icon and the desktop nav
at each width.

- **No horizontal scroll on any route at any width.** The 640px header
  regression is gone; so is every other rung. Header height is a constant 65px
  on storefront and account routes, and 62px on checkout below `md` where the
  context line is hidden.
- **The boundary behaves.** `menu` and `search` are present at 360 / 414 / 640 /
  768 and absent from 1024; the desktop `nav` is the exact inverse. `/checkout`
  and `/checkout/guest` report no hamburger at any width.
- **The only clipped content is `h1.sr-only`** on `/contact` and `/cart` — the
  screen-reader clip idiom, the same finding 13.1 recorded, not a defect.
- **200% zoom reflows.** Measured the WCAG way, as a 640×512 viewport (1280×1024
  at 200%): `/`, `/products`, a filtered `/products`, `/categories`, `/cart`,
  `/checkout/guest` and `/contact` are all clean, and the filter drawer's footer
  primary still lands inside a 512px-tall viewport.
- **Carried forward, not run:** the account variant *signed in*. Headless Clerk
  sign-in was attempted with a `+clerk_test@` address and abandoned — the test
  user does not exist on this instance and the sign-up form needs fields the
  script could not fill. `/account` measurements above therefore describe the
  post-redirect `/sign-in` page. The gating that matters is pathname-driven and
  proven on the other routes, but the signed-in account header at 640–1023px
  should be eyeballed before this phase closes.

### 13.6 Type, tables and touch

- [x] Give the display sizes a ladder. The design uses 52/42/38/36/34/31px at 1280px, all of which are too large below `sm` — use responsive steps or `clamp()`, and keep the weight-400 rule at every size. *Landed as `clamp()` in `@theme` rather than breakpoint steps at ten call sites, following `.measure`'s precedent of putting the responsive rule in the one place that owns it: `--text-display-1` … `-6` in `app/globals.css`, each pinned to its designed size at 1280px and interpolating to a derived floor at 360px, each paired with a `--text-display-N--line-height` so the call sites drop their arbitrary `leading-[…]` too. Browser-measured: 52/42/38/36/34/31px at 1280px and 32/28/26/24/23/22px at 360px. The middle term keeps a `rem` component deliberately — at a 32px root the ramp reads 64/56/52/48/46/44px, so browser text-resize still works, which a pure-`vw` preferred size would have broken. **Weight:** the four `text-3xl sm:text-4xl` page titles collapse into `text-display-2`, and all six surviving `font-semibold` overrides on `font-heading` h1/h2 are removed, so `h1, h2 { font-weight: 400 }` finally holds — `docs/phase-7-classical-foundation.md` §7.5 counted 23 of these and deferred them to Phases 9–12. Two of the six (`registered-address-step.tsx`, `category-products-skeleton.tsx`) are interface-size rather than display; they were swept anyway because the base rule makes no size distinction. `button.tsx`, `card.tsx` and `product-card.tsx` keep theirs — not h1/h2, so the rule does not apply.*
- [x] **Unjustify below roughly 640px.** *(done in 12.7.)* Landed in the `.measure` utility itself (`app/globals.css`) rather than as `text-left sm:text-justify` at seven call sites: `text-align: justify` is gated behind `@media (width >= 40rem)`, and `hyphens: auto` plus `max-width: 52ch` still apply at every width. Amended in `docs/phase-7-classical-foundation.md` §7.5. This also lands for the home hero, contact atelier-info and cart summary, which 12.7 does not otherwise touch — verify those three here. *Verified in 13.6, and the verification found the gap: six paragraphs use a raw `text-justify` rather than `.measure`, so the utility's `sm` gate never reached them and they stayed justified at 360px — `contact-form.tsx:268,274`, `product-detail-feature.tsx:150`, `guest-review-step.tsx:83`, `order-confirmation.tsx:56` and `categories-feature.tsx:38`. Each is now `text-left sm:text-justify`. They were deliberately **not** converted to `.measure`: it also imposes `max-width: 52ch` and `hyphens: auto`, and three of them already carry their own `max-w-[NNch]`, so adopting the utility would have silently changed their measure. The DoD line "body copy is left-aligned below `sm`" was not actually true before this.*
- [x] Convert the tables — the confirmation's order lines and the overview's earlier-orders table — into stacked definition rows below `md`, keeping tabular figures on every numeral. *(account done in 12.7: the overview's earlier-orders table only. The checkout confirmation's order lines are untouched.)* *Assigned here by 13.1: `features/checkout/components/order-confirmation.tsx`'s `grid-cols-3` meta band is unprefixed and belongs with this task's confirmation work, not with 13.1's card grids.* *Landed: the confirmation's order lines now use 12.7's pattern verbatim — one table restyled with `max-md:`, never duplicated `hidden md:block` markup — carrying its explicit `role="table|rowgroup|row|rowheader|cell"` (a `block`/`flex` computed display drops the implicit table semantics the `sr-only <thead>` associations depend on), its `aria-hidden` stacked labels, and `.figures` on the value span that survives the display flip. **One deviation from the account copy:** that table's `<thead>` was already `sr-only`; this one's was visible, and is now `sr-only` at every width, because four visible headers do not fit a 323.2px row. The Piece cell is promoted to `<th role="rowheader" scope="row">` — the account table had a row header and this one did not. Four adjacent unprefixed defects on the same screen were fixed rather than left between phases: the shell had **no horizontal padding at any width**, the totals `<dl>` was a fixed `w-[300px]`, the guest claim band was a nowrap `flex items-center`, and the action row could not wrap.*
- [x] **Raise touch targets on coarse pointers.** The design's 36px controls sit below the 44px guidance; bump interactive heights under `@media (pointer: coarse)` or at `max-lg`. This feeds directly into Phase 15's accessibility task, so do it here rather than discovering it there. *Landed on `pointer: coarse` rather than `max-lg`, so the floor keys off the input device and not the viewport; the deviation this causes on touchscreen laptops is recorded as an ambiguity below. **Three corrections to this bullet's own framing.** (1) **No custom variant was registered** — Tailwind 4.3.3 already ships `pointer-coarse:` (verified in `node_modules/tailwindcss/dist/lib.js`), so adding one would have duplicated a core variant. (2) **The floor is `min-h-10`/`min-w-10`, not `h-10`/`size-10`.** A `pointer-coarse:h-10` sorts after a plain `h-auto` and wins inside the media query, which would have clipped the deliberate `h-auto` sites in `contact-form.tsx`. `min-h-9` is 41.4px against this app's `--spacing`, so 46px is the first rung that actually clears 44. (3) **The worst targets were never the `Button` primitive** — the 23px filter and applied-filter chips are bare `<button>`/`<Link>` styled with `badgeVariants`. They grow their painted box; a `::after` hit overlay was rejected because `badgeVariants` carries `overflow-hidden` (which clips the pseudo-element) and because at `gap-[6px]` on a 23px chip a 44px overlay overlaps each neighbour by ~15px and steals taps. `badgeVariants` itself is untouched — `Badge` is overwhelmingly a non-interactive status label. Browser-verified under touch emulation at 390 × 844: zero controls below 44px on `/`, `/products`, the PDP, `/cart`, `/contact`, `/checkout/guest`, `/orders/track` and inside the open filter drawer. Also disclosed in the process: `products-sort.tsx`'s `h-auto` has always been inert, because the primitive's `data-[size=default]:h-8` is an attribute selector and outranks it — the control was already 36.8px, so it takes the floor like any other and the opt-out it was first given was removed.*
- [x] Scope `sticky-add-to-cart-bar.tsx` to mobile, where it earns its place, and confirm it still clears the `.plate` stacking-context issue at every width. *The bar was **already** scoped to mobile (`sm:hidden`), so this became a boundary decision rather than a scoping change: it is now `lg:hidden`, because §13.2 stacks the buy box under the gallery below `lg` and the 640–1023px band was therefore scrolling past a 660px hero with no bar at all. Browser-verified: the bar appears and pins to the viewport bottom at 360, 768 and 1023, and is `display: none` from 1024. **The `.plate` risk still does not materialise, now at every width rather than the single 420px sample Phase 9 §9.5 took** — walking the bar's full ancestor chain at 360/414/640/768/1023/1024/1280/1440 finds zero elements with a non-`none` `filter`, because the gallery's plated subtree is a sibling. Its CTA was `size="sm"` (32.2px) and is carried to 46px by the touch work above.*

### 13.7 Verification and hand-back

- [x] Walk every screen at **360 / 414 / 768 / 1024 / 1280 / 1440**, plus 200% browser zoom for reflow. *Walked 2026-09-10 against a live backend. Nine public routes × six widths = 54 cells, asserting `documentElement.scrollWidth <= clientWidth` and enumerating every element whose right edge passes the viewport; the PDP and a second product were walked separately. **One overflow found and fixed:** `/account-disabled` ran to 424px against 360px and 414px, because the account header variant's `{firstName}` context line is a flex item with no `min-w-0` in a nowrap row — the same defect §13.4 fixed on the checkout variant, and the storefront variant escapes it only because its nav and search collapse to zero below `lg`. Hidden below `md`, matching the checkout precedent; the matrix is clean afterwards. 200% zoom checked as 640 × 512 across ten routes — no horizontal overflow. The only elements that still cross the viewport edge are children of the deliberate `overflow-x-auto` rails (related products, applied filters, account sub-nav), which §13.1 exempted. **Carried forward, not solved:** the signed-in account and checkout headers were still not exercised — headless Clerk sign-in fails — so §13.4's carry-forward stands.*
- [x] Write the derived decisions into this doc as a short table — screen, breakpoint, what changes — and hand it to the designer. These are **our** decisions, not the designer's, and they should be reviewed as such rather than discovered later in production. *Thirteen rows added to the table above covering the display ramp and its line heights, the weight sweep, the six unjustified paragraphs, the confirmation's table / meta band / shell padding, the coarse-pointer floor and why the hit-overlay alternative was rejected, why `Badge` itself is untouched, the sticky bar's new boundary, and the account header context line.*
- [x] Flag any screen where the derivation felt genuinely ambiguous, so real mobile designs can be commissioned for those first. *Eight recorded under "Designer-review ambiguities from 13.6 / 13.7", the substantive ones being: every display floor is ours and measured from nothing; the six-rung scale may be over-fine, since 38/36/34 sit within 4px and their floors already converge; the handoff contradicts itself on the 42px rung (the mockups measure 40px, the stylesheet says 42px, and there is no 40px call site); and `pointer: coarse` changes the designed 1280px composition on touchscreen laptops. Two items are explicitly deferred to Phase 15 rather than left silent — the rating input's 14 × 28px half-star targets, which cannot all reach 44px inside ~140px without overlapping and so need a design answer, and text-link tap targets in the header and footer.*


#### Derived decisions — started by Phase 12.7 (account slice)

These are **our** derivations, not the designer's. Phase 13 extends this table to
the remaining screens and hands the whole thing back for review.

| Screen | Breakpoint | What changes | Why |
|---|---|---|---|
| Home product bands + S2 listing | `< sm` / `sm` / `lg` / `xl` | Product cards step 1 / 2 / 3 / 4 columns; live grids and skeletons share the same ladder | One public rhythm at every width, with image hints measured against the 1206.4px frame content |
| S8 categories index | `< sm` / `sm` / `lg` | Category cards step 1 / 2 / 3 columns | The former unprefixed three-column grid ran down to 320px; the 1280px composition remains three columns |
| Home collections strip | `< sm` / `sm` | Three cards step directly from 1 to 3 columns | A two-column rung would leave the third card orphaned as 2 + 1; three 176px cells are the cleaner intermediate composition |
| S6 guest shipping fields | `< sm` / `sm` / `md` | Shipping fields step 1 / 2 / 3 columns | The centred `max-w-2xl` column reaches ~193px three-up cells at `md`; delaying to `lg` yields only ~187px because the column is capped |
| S6 guest contact fields | `< sm` / `sm` | Name and phone step 1 / 2 columns; email remains full-width | Two fields no longer squeeze side by side on a 360px viewport |
| Category-detail + PDP product rails | All widths | Rails are exempt from the column ladder and remain horizontally scrollable | Neither rail is a designed screen; this pass only aligns image mat sizing, skeleton overflow and keyboard focus treatment |
| Account shell (S10–S13, wishlist, profile) | `< lg` | Sub-nav becomes a horizontally scrolling tab row above the content; column layout at `lg`+ | A `w-[210px] shrink-0` sidebar left a 76.4px content column at 360px |
| Account sub-nav | `< lg` | Active item takes `border-b` instead of `border-l`, same accent tokens | A left border is meaningless on a horizontal tab row; keeping the tokens lets Phase 14 invert it for free |
| S13 order detail | `< sm` | Four-column status timeline keeps four columns; only the per-stage timestamp is hidden | Labels fit ~74px; the timestamp does not, and the page header already prints it. 2×2 breaks the linear rule metaphor and would alter S10's `track` |
| S13 order detail | `< sm` | Header's `Placed …` timestamp drops to its own line | Order id + status tag + timestamp needs ~405px against 323.2px |
| S12 orders list | `< sm` | Card content row stacks; header and footer wrap | Buttons are `shrink-0 whitespace-nowrap`, so rows overflow rather than squeeze |
| S11 addresses | `< lg` | Open editor panel moves **above** the list | The customer must see the form they just opened |
| S11 addresses | `< sm` | Address form field grid goes to one column | Two ~155px columns cannot hold governorate names |
| Wishlist | `< sm` / `sm` / `lg` | 1 / 2 / 3 columns | §13.1 ladder; `sizes` recomputed to match |
| S10 overview | `< md` | Earlier-orders table becomes stacked rows | A `min-w-[640px]` table in a 323px viewport |
| S10 overview | `sm`–`lg` | Info cards stay one column until `lg` | At 640px two cards are ~160px each |
| All body copy | `< sm` | `.measure` is left-aligned, not justified | Justified serif at a narrow measure; `hyphens: auto` does not rescue it |
| Cart | `< lg` | Summary card paints above the bag lines via `order-first`; DOM order unchanged | The handoff's "summary rails move above the fold"; the DOM keeps bag-before-totals as the correct reading and tab order |
| Both checkouts | all | No change — the wizard has no summary rail to move | 10.2/10.3 shipped single-column stepped flows with the summary inside the review step |
| PDP gallery | `sm`–`lg` | Thumb strip + hero capped at 792px and centred | A single full-width column stretched the 660px hero to a 1.30 landscape box at 1023px |
| PDP hero | all | Keeps `h-[660px]`, still no aspect ratio | `aspect-[3/4]` computes a 1140px hero at 1023px; Phase 9 §9.5's rule needs no exception |
| Storefront header | `< lg` | Nav, categories menu, persistent search and the Sign in / Sign up pair all collapse into the `Sidenav`; the header keeps wordmark, search icon, Bag and hamburger | The whole cluster needs ~891px. `sm` reveals it at 640px and overflowed by 68px; `lg` is the first width with real margin, and it is the boundary 12.7 already gave the account sub-nav |
| Storefront header | `< lg` | Search is an icon expanding to a full-width panel at the header's `top-full` | A panel in the flex row would re-create the pile-up; out of flow, the header stays 65px open or closed |
| Header search | all | Exactly one search affordance per width — the `Sidenav`'s own field was deleted | Two entry points to the same GET form, one of them two taps deep; the shared `SearchField` still backs both header states |
| Account header | `< lg` | Keeps the catalogue `Sidenav` that desktop account users do not get | The desktop account header drops nav+search by design; without the menu a phone would have no navigation at all. The asymmetry is the lesser defect |
| Checkout header | all | No `Sidenav`, and therefore no `UserButton` or wishlist below `lg` | Checkout is a focus flow; a catalogue menu in it is a leak. Chrome removal, not a redirect or a gate |
| Guest checkout | all | An in-body "Have an account? Sign in" row on step 01, returning to `/checkout` | The header context line is hidden below `md`, and it was the only sign-in path. `/checkout/guest` would be wrong: sign-in merges the cart and deletes `sg_cart_session`, so the registered flow is what the customer asked for |
| S2 filter drawer | `< sm` | A bottom sheet capped at `85svh`, restored to the 340px left rail from `sm` | A 340px side panel is 94% of a 360px viewport. The `side` prop is flipped rather than CSS-overridden, or the primitive's `data-[side=left]` selectors would win at every width |
| S2 applied filters | `< sm` | One horizontally scrolling line instead of wrapping | Eight tags wrapped into three lines at 360px; `Badge` is `whitespace-nowrap`, so the row cannot compress |
| Sheet panels (all) | `< sm` | `w-[calc(100%-3rem)]` instead of base-lyra's `w-3/4` | 270px at 360px with a 90px scrim. This is a library default, not a design value |
| `AlertDialog` panels | all | No change | 320px at x=20 in a 360px viewport already matches the page's 18.4px gutter |
| All six display sizes | 360px → 1280px | Each rung interpolates fluidly from a derived floor to its designed size: 52→32, 42→28, 38→26, 36→24, 34→23, 31→22 | The handoff draws one width. A `clamp()` per rung in `@theme` pins 1280px to the design exactly and makes only the descent ours — measured 52/42/38/36/34/31px at 1280px and 32/28/26/24/23/22px at 360px |
| Display ramp | all | Line heights move from `leading-[…]` at the call site into `--text-display-N--line-height` | The ramp becomes one edit site, the `.measure` precedent. A call site can no longer drift from its size |
| Display h1/h2 | all | The last six `font-semibold` overrides on `font-heading` h1/h2 are removed | Phase 7.5 counted 23 and left them to Phases 9–12; these are the survivors. `h1, h2 { font-weight: 400 }` now actually holds |
| Six body paragraphs | `< sm` | `text-left sm:text-justify` added to the paragraphs that use a raw `text-justify` instead of `.measure` | 12.7 landed the unjustify rule *inside* `.measure`; these six never adopted the utility, so they stayed justified at 360px. Not converted to `.measure` — it also imposes `max-width: 52ch`, and three of them carry their own measure |
| S7 confirmation order lines | `< md` | The table restyles to stacked definition rows, reusing 12.7's single-table `max-md:` pattern with explicit ARIA roles | A four-column table in a 323.2px viewport. Its `<thead>` was visible and is now `sr-only` at every width, with `aria-hidden` stacked labels below `md` |
| S7 confirmation meta band | `< sm` | Status / Payment / Delivery step 1 → 3 columns | Assigned here by §13.1 rather than left with the card grids; it was unprefixed down to 320px |
| S7 confirmation | all | Shell gains `px-4 sm:px-6 lg:px-8`; totals `<dl>` goes `w-full sm:w-[300px]`; claim band stacks below `sm`; action row wraps | The shell had **no horizontal padding at any width**, so copy touched both edges on a phone |
| All interactive controls | `pointer: coarse` | Height/width floor of `min-h-10` / `min-w-10` (46px) via Tailwind's built-in `pointer-coarse:` variant | The designed control is `h-8` = 36.8px against this app's `--spacing: 0.2875rem`, below the 44px guidance. `min-h-9` is 41.4px and misses, so 46px is the first rung that clears |
| Filter chips, swatches, indicators | `pointer: coarse` | The painted box grows rather than a `::after` hit overlay being added | `badgeVariants` carries `overflow-hidden`, which clips a pseudo-element; and at `gap-[6px]` on a 23px chip a 44px overlay would overlap each neighbour by ~15px and steal taps |
| `Badge` itself | all | Not bumped; only the interactive call sites are | `Badge` is overwhelmingly a non-interactive status label (order, payment, stock, discount). Inflating those is not a touch fix |
| PDP sticky add-to-cart bar | `< lg` | Boundary moves from `sm:hidden` to `lg:hidden` | The buy box stacks under the gallery below `lg`, so 640–1023px had a 660px hero to scroll past and no bar at all. Verified appearing and pinned at 360/768/1023 and absent from 1024 |
| Account header context line | `< md` | The `{firstName}` / "Account" line is hidden, matching what §13.4 did to the checkout line | Found in §13.7's walk on `/account-disabled`: a flex item with no `min-w-0` in a nowrap row pushed the document to 424px against 360px. The storefront variant does not overflow only because its nav and search collapse to zero below `lg` |

#### Designer-review ambiguities from 13.1

- The home product bands render `3 + 1` at `lg` (1024–1279px). Phase 9 §9.2 set both bands to `limit: 4` to produce the designed single row, while the shared public ladder's three-column rung breaks that row only in this width band.
- The collections strip would orphan its third card as `2 + 1` at 640–1023px, so its class string deliberately stays one column below `sm` and three columns from `sm` rather than adopting a two-column step.

#### Designer-review ambiguities from 13.4 / 13.5

- **`md` as the header's collapse boundary.** With the search already an icon, the cluster needs roughly 661px against 712.8px of content at 768px, so an `md` rung is *possible* — it simply has no margin, and one longer nav label would put the overflow back. `lg` was chosen for the margin and for parity with the account sub-nav. If tablet portrait matters more than the margin, this is the row to revisit.
- **The account header's mobile-only catalogue nav.** Below `lg` an account customer gets a nav that a desktop account customer does not. The alternatives are worse (no navigation on a phone, or contradicting the handoff on desktop), but the asymmetry is a real design question rather than a derivation.
- **Checkout below `lg` has no sign-out affordance.** With the `Sidenav` gone and the context line hidden below `md`, a signed-in customer on a phone sees only the wordmark and the Bag. Deliberate for a focus flow; worth a designer's eye.

#### Designer-review ambiguities from 13.6 / 13.7

- **The display floors are entirely ours.** 32/28/26/24/23/22px at 360px are derived, not measured from anything — no mockup exists below 1280px. The tops are exact, so this is the half of the ramp that needs a designer's eye.
- **Six rungs may be an over-fine scale.** 38, 36 and 34px are within 4px of each other and drive three different screens (contact, confirmation, listing/index title bands). They are preserved because the 1280px composition is the designer's to set, but if they were meant to be one size, collapsing them would simplify the ramp. Their floors already converge to 26/24/23.
- **The handoff's own numbers disagree about the 42px rung.** The mockups measure 52/40/38/36/34/31; there is no 40px call site, and the 42px comes only from `classical-styles.css`'s `h1 { font-size: 42px }` rule, which is what the four page titles use. Either the 40px mockup or the 42px rule is stale.
- **`pointer: coarse` deviates from the designed composition on touchscreen laptops.** The 46px floor keys off the input device, not the viewport, so a touch-capable laptop at 1280px no longer renders the designed 36.8px controls. This was the deliberate choice over a `max-lg` viewport rule, which would instead have penalised mouse users at narrow widths. Worth confirming which way the design wants it.
- **Filter chips and colour swatches grow on touch devices.** Below `sm` the filter panel is a drawer the handoff never drew, so the density change costs nothing there — but the same rule also grows the designed 1280px filter rail and PDP swatch row on a touchscreen laptop. Same trade as the row above.
- **Deferred to Phase 15: the rating input.** `components/shared/rating-input/rating-input.tsx` splits each star into two `w-1/2` half-star `<label>`s, giving 14 × 28px targets. Ten half-targets inside ~140px cannot each reach 44px without overlapping, so this needs a design answer (a larger control, or dropping half-star granularity on touch), not a CSS floor.
- **Deferred to Phase 15: text-link tap targets.** The wordmark (33px) and the footer's text links (17px) are still below 44px on a coarse pointer. They are prose-height navigation text rather than controls, and giving them a 46px box would visibly change the header and footer typography.
- **The sticky bar's visible window is narrow.** Measured in §13.7: at 360px the bar is only on screen between the buy box leaving the viewport and the footer's 80px `rootMargin`, about 142px of scroll. That is Phase 9 behaviour this phase did not change, but the new 640–1023px band inherits it, and it is worth asking whether the footer rule should be looser.

## Definition of Done

- No screen scrolls horizontally at any width from 360px to 1440px.
- Every two-column screen stacks in the specified order, with cart and checkout summaries above the fold on mobile.
- The header, account sub-nav and filter drawer are usable at 360px.
- Body copy is left-aligned below `sm` and justified above it.
- Tables are readable as stacked rows on mobile with their figures still aligned.
- Touch targets meet 44px on coarse pointers.
- 200% zoom reflows without content loss or overlap.
- The derived-decisions table exists in this doc.
- `bun run build` succeeds.
- `bun lint` and `bunx tsc --noEmit` pass.

## Out of scope

RTL layout, which is out of the v1 non-goals along with localization. The dark palette is Phase 14. Formal accessibility auditing is Phase 15, though the touch-target work here is a deliberate down payment on it.
