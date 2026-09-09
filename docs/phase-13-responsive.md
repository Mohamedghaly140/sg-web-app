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

- [ ] Stack every `1fr / Npx` layout below `lg` (1024px).
- [ ] On cart and both checkouts, move the **summary rail above** the content, per the handoff's "summary rails move above the fold". Implement with `order-first lg:order-last` rather than duplicating the markup.
- [ ] On product detail, move the buy box under the gallery.
- [ ] On order detail, move the right rail below the timeline and lines. *(account done in 12.7 — in fact it already held: `order-detail-view.tsx` was written mobile-first with a `lg:`-only two-column grid, so the rail already fell below. Verified, not changed.)*
- [ ] On addresses, stack the edit panel above the list when it is open, so the form the customer just opened is what they see. *(account done in 12.7 as `order-first lg:order-last` on the editor `<aside>`; no markup duplication.)*

### 13.3 The product-detail gallery exception

- [ ] Let the hero's fixed 660px height bend below `lg`: `aspect-[3/4] lg:aspect-auto lg:h-[660px]`, with the thumbnail strip moving from a vertical column to a horizontal row beneath the hero.
- [ ] **State this exception in the code and in the phase notes.** Phase 9 forbids giving the hero an aspect ratio because the handoff names that as its one broken variant — but that constraint is about the *desktop* composition. Without an explicit note, a later reviewer reads this as a violation and reverts it.

### 13.4 Shell

- [ ] Collapse the header nav into the existing `Sidenav` sheet below `sm`, and turn the persistent search into an icon that expands — using the shared `SearchField` from Phase 8 in both places, so the two never drift again.
- [ ] Keep the `Bag · N` button visible at every width; it is the primary conversion control.
- [ ] Collapse the account sub-nav into a horizontally scrolling tab row below `lg`, keeping the accent active treatment as an underline rather than a left border in that orientation. *(done in 12.7. `overflow-x-auto` sits on the `<nav>` itself; one `<Link>` set with orientation-conditional classes, never two navs.)*
- [ ] Verify the three header variants (storefront, account, checkout) each collapse sensibly rather than only the default one. *(Finding from the 12.7 audit, recorded not fixed: on `/account` at `sm`+ there is no nav and no search — that is the handoff verbatim ("Account screens replace nav+search with the customer name"), so it is not a bug. The genuine oddity is that the `sm:hidden` hamburger gives mobile account users a catalogue nav that desktop account users do not get. Decide that here. The checkout variant's context line also wraps to three lines at 360px with no `truncate` or `min-w-0`.)*

  **Measured in the 13.1 browser pass (2026-09-09), recorded not fixed — this task owns the header, 13.1 does not, and both defects predate 13.1's diff:**

  - **The storefront header overflows at exactly 640px, on every public route.** `documentElement.scrollWidth` is **708px against a 640px viewport** on `/`, `/products`, `/categories`, `/categories/[slug]`, `/products/[slug]` and `/contact` — a 68px overflow. At `sm` the header reveals the nav (`New In` + Categories menu), the 230px `SearchField` and the Sign in / Sign up pair all at once, while `components/shared/header/index.tsx:15` is a single `flex … gap-4` row with no wrap, no `min-w-0` and no width budget. It is clean at 414px and below (the `sm:hidden` hamburger path) and clean again from 768px. This is exactly what this bullet's first two items are for: collapsing the nav into `Sidenav` and turning search into an expanding icon removes the 640px pile-up rather than patching it.
  - **The checkout header variant overflowed at 360px — FIXED in the 13.1 pass**, at the project owner's request, because it broke a conversion-critical screen and the fix is independent of the nav/search rework above. `/checkout/guest` and `/checkout` reported **391px against 360px**: `header-nav-area.tsx` rendered the context line as a bare `<span class="text-eyebrow">` with `0.14em` tracking, no `min-w-0` and no `truncate`, inside the same nowrap row. 12.7 recorded it as wrapping to three lines; by this pass it was real horizontal page scroll.

    **`min-w-0 truncate` alone was measured and rejected.** The row's other children — a 143px wordmark, a 119px control cluster and two 18.4px gaps — leave the context line only **9.4px at 360px, 63px at 414px and 112px at 640px**, against the **131px** the words "Secure checkout" need on their own and **335px** for the full string. Truncating therefore yields an unreadable stub at every narrow width, not a graceful ellipsis. The line is now `hidden … md:inline`: absent below 768px, truncated at 768px where 240px is available, and full from `lg`. Verified at all seven widths on both checkout routes — no horizontal scroll, header height constant at 65px.

    **Consequence this task must resolve:** the header link is the *only* sign-in affordance on guest checkout — `features/checkout-guest/` contains no sign-in link of its own — so below `md` a returning customer now has no way to sign in from the checkout screen. It was already unusable there (a 9px stub, or an off-screen overflow before that), so this is a disclosure of an existing gap rather than a new regression, but it needs a real answer: either an in-body "Have an account? Sign in" row in the guest flow, or a narrow-width home for the context line. That is a composition decision, not a breakpoint one.

### 13.5 Filters and overlays

- [ ] The listing filter panel is already a `Sheet` ✅, so this is a breakpoint concern rather than a rebuild: give it a bottom-sheet presentation below `sm` where a 340px side panel is most of the viewport, and keep the applied-filter tag row horizontally scrollable rather than wrapping into three lines.
- [ ] Verify the cart drawer, `ConfirmDialog` and `RequireAuth` dialogs at 360px — base-ui panels take `w-3/4` and `sm:max-w-sm` by default, which needs checking against the Classical padding.

### 13.6 Type, tables and touch

- [ ] Give the display sizes a ladder. The design uses 52/42/38/36/34/31px at 1280px, all of which are too large below `sm` — use responsive steps or `clamp()`, and keep the weight-400 rule at every size.
- [x] **Unjustify below roughly 640px.** *(done in 12.7.)* Landed in the `.measure` utility itself (`app/globals.css`) rather than as `text-left sm:text-justify` at seven call sites: `text-align: justify` is gated behind `@media (width >= 40rem)`, and `hyphens: auto` plus `max-width: 52ch` still apply at every width. Amended in `docs/phase-7-classical-foundation.md` §7.5. This also lands for the home hero, contact atelier-info and cart summary, which 12.7 does not otherwise touch — verify those three here.
- [ ] Convert the tables — the confirmation's order lines and the overview's earlier-orders table — into stacked definition rows below `md`, keeping tabular figures on every numeral. *(account done in 12.7: the overview's earlier-orders table only. The checkout confirmation's order lines are untouched.)* *Assigned here by 13.1: `features/checkout/components/order-confirmation.tsx`'s `grid-cols-3` meta band is unprefixed and belongs with this task's confirmation work, not with 13.1's card grids.*
- [ ] **Raise touch targets on coarse pointers.** The design's 36px controls sit below the 44px guidance; bump interactive heights under `@media (pointer: coarse)` or at `max-lg`. This feeds directly into Phase 15's accessibility task, so do it here rather than discovering it there.
- [ ] Scope `sticky-add-to-cart-bar.tsx` to mobile, where it earns its place, and confirm it still clears the `.plate` stacking-context issue at every width.

### 13.7 Verification and hand-back

- [ ] Walk every screen at **360 / 414 / 768 / 1024 / 1280 / 1440**, plus 200% browser zoom for reflow.
- [ ] Write the derived decisions into this doc as a short table — screen, breakpoint, what changes — and hand it to the designer. These are **our** decisions, not the designer's, and they should be reviewed as such rather than discovered later in production.
- [ ] Flag any screen where the derivation felt genuinely ambiguous, so real mobile designs can be commissioned for those first.


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

#### Designer-review ambiguities from 13.1

- The home product bands render `3 + 1` at `lg` (1024–1279px). Phase 9 §9.2 set both bands to `limit: 4` to produce the designed single row, while the shared public ladder's three-column rung breaks that row only in this width band.
- The collections strip would orphan its third card as `2 + 1` at 640–1023px, so its class string deliberately stays one column below `sm` and three columns from `sm` rather than adopting a two-column step.

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
