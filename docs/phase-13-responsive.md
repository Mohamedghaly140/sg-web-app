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

- [ ] Keep the page frame at `max-w-[1280px]` with the Classical section padding, and keep Tailwind's default breakpoints. Do not introduce custom breakpoints for one screen.
- [ ] Apply the product grid ladder as `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, and the category and collections ladder as `1 / 2 / 3`. Use it consistently on home, listing, category detail, related products and wishlist so a customer never sees two different column rhythms at the same width. *(account done in 12.7: wishlist took `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. Reconcile home, listing, category detail and related products against it — 12.7 did not touch them, so the shared rhythm is not yet proven.)*
- [ ] Step the multi-column field grids down: guest checkout's three-column shipping grid becomes two then one; the address form's two-column grid becomes one. *(account done in 12.7: only the `columns === 2` branch of `address-form-fields.tsx`. The `columns === 3` branch is the guest-checkout path via the `columns = 3` default and was deliberately left alone as out of 12.7's scope — it is still non-responsive.)*

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

### 13.5 Filters and overlays

- [ ] The listing filter panel is already a `Sheet` ✅, so this is a breakpoint concern rather than a rebuild: give it a bottom-sheet presentation below `sm` where a 340px side panel is most of the viewport, and keep the applied-filter tag row horizontally scrollable rather than wrapping into three lines.
- [ ] Verify the cart drawer, `ConfirmDialog` and `RequireAuth` dialogs at 360px — base-ui panels take `w-3/4` and `sm:max-w-sm` by default, which needs checking against the Classical padding.

### 13.6 Type, tables and touch

- [ ] Give the display sizes a ladder. The design uses 52/42/38/36/34/31px at 1280px, all of which are too large below `sm` — use responsive steps or `clamp()`, and keep the weight-400 rule at every size.
- [x] **Unjustify below roughly 640px.** *(done in 12.7.)* Landed in the `.measure` utility itself (`app/globals.css`) rather than as `text-left sm:text-justify` at seven call sites: `text-align: justify` is gated behind `@media (width >= 40rem)`, and `hyphens: auto` plus `max-width: 52ch` still apply at every width. Amended in `docs/phase-7-classical-foundation.md` §7.5. This also lands for the home hero, contact atelier-info and cart summary, which 12.7 does not otherwise touch — verify those three here.
- [ ] Convert the tables — the confirmation's order lines and the overview's earlier-orders table — into stacked definition rows below `md`, keeping tabular figures on every numeral. *(account done in 12.7: the overview's earlier-orders table only. The checkout confirmation's order lines are untouched.)*
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
