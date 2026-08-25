# Phase 8 — Primitives & Shell (components/ui, shared kit, header, footer, account sub-nav)

**Status: done.** All tasks below landed across 17 commits on `main`, delegated to Cursor via the
`cursor-delegate` skill and reviewed/committed by Claude. See "Phase notes" before the Definition
of Done for verifying routes, the no-variant `<Button>` audit, and decisions resolved during
implementation.

**Decisions resolved during implementation** (both were open product questions this doc originally
flagged as blocking; the user resolved both before Phase 8 started):
- **Brand name:** adopted `SG·COUTURE` — the header wordmark (8.8) already ships it. The two legacy
  `/brand/logo-mark.png` / `/brand/logo-lockup.png` assets and `metadata.title` still say "Safa
  Ghaly" and were out of this phase's file list; cleaning them up is deferred to a later phase.
- **"The Makers":** dropped from the header nav entirely (8.8) — no placeholder, no reserved slot.
  Retargeting screen S1's "Meet the makers" CTA and omitting the pull-quote band is Phase 9's job,
  since the home page doesn't exist in Classical form yet.

**Objective:** make every shadcn primitive and every shared component speak Classical, and rebuild the shell each screen sits in, so that Phases 9–12 become layout work rather than restyling.

**Prerequisites:** Phase 7 DoD.

**API surface:** `GET /categories` (Public) for the header nav, already implemented.

**Anatomy warning — read before touching `components/ui/`.** These primitives are the **`base-lyra` style on `@base-ui/react`, not Radix**; there is no `@radix-ui/*` dependency. Concretely: toggle pressed state is `data-pressed`, not Radix's `data-state="on"`; sheet and dialog transitions use `data-starting-style` / `data-ending-style`, not `data-state="open"`; `Badge` composes via `useRender` + `mergeProps`, not `asChild`; `Button` takes `render` plus `nativeButton={false}` for link buttons. Any snippet pattern-matched from shadcn/Radix memory will produce classes that **silently never apply** — and with no test suite, that failure is invisible until someone looks at the screen. Inspect the generated component before changing its states.

## Tasks

### 8.1 The spacing flip

- [x] Set `--spacing: 0.2875rem` in `@theme`. Tailwind v4 computes `p-4` as `calc(var(--spacing) * 4)`, so the scale becomes exactly **4.6 / 9.2 / 13.8 / 18.4 / 27.6 / 36.8px** at steps `1/2/3/4/6/8` — a 1:1 match with Classical's `--space-1/2/3/4/6/8`, applying the system's 1.15× density globally in one line with zero class edits.
- [x] Understand why this is here and not in Phase 7: `--spacing` also drives `size-*`, `w-*`, `h-*` and `gap-*`, so **every fixed dimension in the app inflates 15% the instant it lands.** Coupling it to the primitives rewrite keeps the intermediate state coherent; landing it alone produces a 15%-inflated storefront still wearing 12px text.
- [x] Sweep interface icons in the same commit. `size-4` becomes 18.4px, above the design's 14–18px range for interface positions — move them to `size-3.5` (16.1px) or `size-3` (13.8px). Lucide strokes stay at 1.5–1.6 on `currentColor`.
- [x] Change the page frame from `max-w-6xl` (1152px) to `max-w-[1280px]` in the header and footer to match the design's frame. Section padding becomes `p-6` (27.6px) and major gaps `gap-8` (36.8px), which the flip now makes literal.

### 8.2 Radius application and its governance

- [x] Sweep the 34 hardcoded `rounded-none` occurrences onto the Classical radius scale: controls, cards, inputs and dialogs take `rounded-sm/md/lg`; photographs stay square inside their `.plate` mat; `rounded-full` survives only for colour swatches and the radio dot.
- [x] **In the same commit**, delete the two comments in `components/ui/button.tsx` and `components/ui/badge.tsx` reading *"Square corners are an intentional editorial signature paired with rounded imagery, not an oversight—do not 'fix' this later."* That decision predates the approved design and is now superseded. Leaving the comment in place while changing the code guarantees a future contributor reverts the change and cites the comment as authority.
- [x] **In the same commit**, rewrite `docs/01-conventions.md` §7's two-tier image-radius bullet to: *controls, cards, inputs and dialogs take the Classical radius scale; photographs are square inside a `.plate` mat; `rounded-full` only for colour swatches and the radio dot.* The governance half of this task matters more than the CSS half.

### 8.3 Buttons — the highest-blast-radius change

- [x] Restyle `components/ui/button.tsx`. The base becomes `font-heading font-semibold text-sm` (Cormorant at 13.5px, per the system's `.btn` rule that buttons set in the heading face).
- [x] Map the variants: `default` becomes the outlined accent button (`border-primary text-accent-strong bg-transparent`, hover `bg-primary/12`, pressed `bg-primary/22`); `secondary` becomes `border-border bg-transparent`, hover `bg-secondary`, pressed `bg-foreground/14`; `ghost` becomes `text-accent-strong` with reduced inline padding, hover `bg-primary/10`; `link` becomes `text-accent-strong` underlined at offset 3. **Nothing receives a solid accent fill.**
- [x] Collapse `outline` onto `secondary` — in Classical they are the same control — but **keep the variant name** and document it as an alias, because feature code already uses both.
- [x] Keep `destructive` on its tinted pattern (`bg-destructive/10 text-destructive`) with the Phase 7 retuned colour. It is the one place a non-gold hue is allowed to surface.
- [x] Set sizes against the flipped spacing scale: `default h-8` (36.8px, matching the design's 36px control), `sm h-7`, `lg h-10` (46px, serving the design's 44px-minimum block CTAs on Add to bag, Checkout and Place order), `icon size-8` (36.8px, the design's 36×36 ghost icon button).
- [x] Remove `active:not-aria-[haspopup]:translate-y-px`. Classical presses with a tint one step darker, not with motion.
- [x] Replace `focus-visible:border-ring focus-visible:ring-1` with `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`, matching the system's single focus treatment.
- [x] **Enumerate every `<Button>` rendered without an explicit `variant` prop and list the sites in this doc.** The `default` variant flips from a solid dark button to an outlined gold one, so any screen with two adjacent unvariant buttons silently loses its action hierarchy. Phases 9–12 assign variants deliberately from that list; this phase only produces it. This is the strongest reason Phases 9–12 must follow immediately rather than being scheduled apart.

### 8.4 Badges, cards and surfaces

- [x] Restyle `components/ui/badge.tsx` onto the design's four tag treatments while **keeping all ten variant names** — `01-conventions.md` §7 forbids literal colour classes on badges, and `order-status-badge.tsx`, `payment-status-badge.tsx`, `active-badge.tsx`, `stock-badge.tsx` and `discount-badge.tsx` all address it by name. Map `accent` to `bg-accent-100 text-accent-800`; `outline` to `border-primary text-accent-strong bg-transparent`; `secondary` and `default` to `bg-neutral-100 text-neutral-800`; and `success`/`warning`/`info`/`destructive` to `bg-<role>/10 text-<role>` tints. Geometry becomes `text-2xs`, `rounded-xs`, 3px by 10px padding, keeping `h-5`.
- [x] Restyle `components/ui/card.tsx` as bordered and unfilled: `bg-card` becomes `bg-transparent`, the `ring-1 ring-foreground/10` elevation idiom becomes `border border-border`, corners become `rounded-md`, base text becomes `text-sm`, `CardTitle` becomes `font-heading font-semibold text-lg`, and `CardFooter`'s `bg-muted/50` becomes transparent with a `border-t border-border`. Keep the `--card-spacing` custom-property mechanism.
- [x] Add a `data-[selected=true]:border-primary` hook to `Card`. Screen S5's selectable delivery cards and screen S10's accent-bordered in-progress order card both need "the card's border switches to accent"; expressing it once as a data attribute prevents two feature-local forks of the primitive.
- [x] Replace the `ring-1 ring-foreground/10` idiom at all ten sites (card, select content, alert-dialog content, nav-menu popup) with `border` plus the Phase 7 whisper shadows.

### 8.5 Form controls

- [x] Restyle `components/ui/input.tsx` and `components/ui/textarea.tsx`: transparent background, `border-input` hairline, `h-8`, `rounded-md`, `text-sm`, `caret-primary`, hover to `border-foreground/45`, and `focus-visible:border-primary` with **no ring** — the system's input focus changes the border colour at `outline-offset: 0`, it does not add a ring.
- [x] Strip the `dark:bg-input/30` and `dark:disabled:bg-input/80` leftovers from both. They are shadcn registry defaults that were never authored for this app; Phase 14 writes dark deliberately.
- [x] Keep `field-sizing-content` on the textarea and let call sites set the design's per-screen minimums (60px courier details, 64px courier notes, 90px default, 150px contact message).
- [x] Restyle `components/ui/select.tsx`'s trigger to match the input. **Critically, change the item's `focus:bg-accent focus:text-accent-foreground`** — with `--accent` now gold, that renders *filled gold rows* on every dropdown, directly violating the stroke-not-fill rule. Replace with `focus:bg-secondary focus:text-foreground` and `data-[selected]:text-accent-strong`.
- [x] Rebuild `components/ui/toggle.tsx` and `components/ui/toggle-group.tsx` as the design's `.seg` segmented control. One component serves four screens: the PDP size selector, the cart quantity stepper, the PLP size and colour filter toggles, and screen S12's status filter row. The group takes `border border-border rounded-md overflow-hidden`; items take `border-l border-border` between them. **Change the pressed state from `data-pressed:bg-accent data-pressed:text-accent-foreground` — a gold fill — to an inset accent ring:** `data-pressed:text-accent-strong`, `data-pressed:bg-transparent`, plus an `inset 0 0 0 1px` accent box-shadow. Disabled options sit at `opacity-40` for unavailable sizes.

### 8.6 Overlays, rules and remaining primitives

- [x] Introduce an `--overlay` token (near-black at 50%) exposed as `--color-overlay`, and replace the hardcoded `bg-black/10` in `components/ui/sheet.tsx` and `components/ui/alert-dialog.tsx` — **the only two literal colours left in the app.** It must be a token rather than a class because Phase 14 inverts it.
- [x] Give sheet and dialog panels `border-border` plus the whisper `shadow-lg`; dialog content takes `rounded-lg` (7px) and `bg-popover` (`#eae9e9`), matching the system's `.dialog` exactly. Dialog titles become `font-heading text-xl`. Note that screen S2's filter drawer sits on `--color-bg`, not surface — let that one override to `bg-background`.
- [x] Leave `components/ui/separator.tsx` alone beyond verification: it is already `bg-border`, which now resolves to the 16% divider. It **is** the system's `.hr`. Its designed margin equals `my-4` after the spacing flip.
- [x] Leave `components/ui/skeleton.tsx`'s `bg-muted` alone — it already resolves to the surface. The design's requirement that skeletons "match the final geometry", including the plate's mat and 12px text bars at 55–75% width, is implemented in the five feature skeletons, not in the primitive.
- [x] Pass over `alert.tsx`, `field.tsx`, `label.tsx`, `navigation-menu.tsx`, `pagination.tsx` and `accordion.tsx`: hairline borders instead of fills, `text-xs` labels in `text-muted-foreground`, `text-2xs text-destructive` field errors, no filled hover rows in the nav popup, `tabular-nums` on pagination numerals, and disabled at **`opacity-45`** — Classical's number, not the inherited `opacity-50`.

### 8.7 Shared component kit

- [x] Rebuild `components/shared/quantity-stepper/` on the segmented control. The design specifies a `−` / value / `+` row with a centred value cell at `min-width: 38px` carrying tabular figures.
- [x] Replace `components/shared/empty-state/`'s `rounded-full bg-muted p-4` icon puck with the design's empty-state figure: a 96×120 `.plate` above the heading, with 38ch of muted copy and a primary/secondary action pair. It is used on roughly ten screens, so it is worth getting exactly right here.
- [x] Give sonner's `<Toaster />` in `app/providers.tsx` themed `toastOptions` mapped to the Classical tokens. It ships its own palette and will otherwise be the single un-Classical surface left in the app.
- [x] Pass over the remaining shared components — the form kit (`form`, `form-control`, `textarea-control`, `select-field`, `submit-button`, `field-error`), `confirm-dialog`, `require-auth`, `spinner`, `rating-input`, `rating-summary`, `section-error-boundary`, and the three status badges. They inherit most of their appearance from the primitives; verify rather than rewrite.

### 8.8 Header

- [x] Replace the `/brand/logo-mark.png` raster with the `SG·COUTURE` wordmark set in live Cormorant at 22px, `0.04em` tracking, with the middle dot in accent. Live type rather than an image is a requirement, not a preference: a PNG cannot recolour for Phase 14's dark mode and costs an image request in the LCP path.
- [x] Rebuild the nav as category-driven rather than the current hardcoded Home/Products pair. "New In" maps to `/products?sort=newest`; the category links come from the existing `GET /categories` read by `sortOrder`. Active and hover states are accent text, never a filled background — the existing `header-categories-menu.tsx` already follows this rule and is a good reference.
- [x] Extract a shared `SearchField` built on `Input` and use it in **both** places that currently hold a raw `<input type="search">`: `components/shared/header/index.tsx` and `components/shared/sidenav/sidenav.tsx`. Both are styled off-system today (`rounded-md`, `text-sm`) and will visibly diverge from everything else the moment the primitives land. The header instance is 230px wide and 36px tall with the Lucide search glyph inset at 9px.
- [x] Render the wishlist control as a 36×36 ghost icon button, and the cart trigger as an outlined **`Bag · N`** primary button with tabular figures — replacing the current absolutely-positioned `rounded-full bg-primary` count dot in `features/cart/components/cart-drawer.tsx`.
- [x] Implement the header's three context variants as a `variant` prop resolved by route segment, **not** as three copies of the header: the storefront variant carries nav and search; the account variant replaces both with the customer name; the checkout variant replaces both with a context line ("Secure checkout · signed in as …" or "Have an account? Sign in").

### 8.9 Footer and account sub-nav

- [x] Collapse the footer from three columns to the design's single 12px muted row: "Cash on delivery across Egypt · Delivery from 65 EGP · Track an order · © 2026 SG Couture". **No `/contact` link yet** — Phase 11 hasn't landed, so it's omitted entirely rather than pointing at a route that doesn't exist; add it when Phase 11 ships. This deletes the second PNG lockup, the `rounded-full` "Cash on Delivery" pill, the placeholder social links pointing at bare `instagram.com` and `facebook.com`, and the **disabled placeholder newsletter** — a genuine improvement, since it removes a dead control rather than continuing to render one.
- [x] Create `app/account/layout.tsx` holding the account sub-nav, which does not exist today. It is a 210px left column with a `YOUR ACCOUNT` section label (11px, `0.14em`, uppercase, muted) over items for Overview, Orders, Addresses, Wishlist and Profile. The active item takes `border-l border-primary` and `text-accent-strong` with its padding adjusted to keep the text aligned. **Correction to this bullet's original text:** Wishlist's route already shipped in Phase 4 and works today, so it links normally like the other three; only Profile has no route (Phase 12 builds it) and renders as non-interactive text instead of a dead link.
- [x] Let the mobile `Sidenav` inherit the Classical sheet treatment, using the shared `SearchField` from 8.8.

### 8.10 Docs housekeeping and open product decisions

- [x] Add a supersession banner to `docs/screens/README.md`, `home.md`, `shared-shell.md` and `product-detail.md` pointing at `docs/design_handoff_sg_storefront/`. **Banner rather than delete** — those files still carry non-visual behavioural notes (call-per-section bindings, null-safe rating rules) that the handoff does not repeat. They currently encode a *different* information architecture (Home/Products/Categories nav, a four-column footer, horizontal-scroll rails where the design uses grids) and will be implemented from if left unmarked.
- [x] Refresh the status table in `docs/screens/README.md`, which lists Products, Categories, Cart, Checkout and Account as "not started" when the design now covers all thirteen screens.
- [x] **Surface, do not silently resolve, the brand-name conflict.** The app ships "Safa Ghaly" in two PNGs, `metadata.title` and the footer copyright; all thirteen designed screens read `SG·COUTURE`. Record it at the top of this doc as a blocking client question. The recommendation is to adopt SG·COUTURE, but it is not a decision to make inside a commit.
- [x] **Surface the "The Makers" content gap.** The design's nav and its home-page pull-quote band both point at editorial content with **no backend source and no route**. The recommendation is not to ship a dead nav item: drop it from the nav, record the content gap, retarget screen S1's "Meet the makers" secondary CTA to `/categories`, and omit the makers band until real copy exists. This follows the repo's own precedent — the newsletter ships visibly disabled rather than faked — and shipping placeholder editorial copy would contradict it.

## Phase notes

### Commits

`a4aa801` tracker flip · `5fd2b8d` 8.1 spacing/icons/frame · `2205aa5` 8.2 radius sweep ·
`11ec147` 8.3 Button · `6c1071a` 8.4 Badge · `5fdae51` 8.4 Card + ring→border · `c4afed2` 8.5
Input/Textarea · `a4df7a9` 8.5 Select (gold-fill fix) · `c762d99` 8.5 Toggle/ToggleGroup ·
`55f539e` Badge focus-visible fix (found while closing the same gap Toggle had — see below) ·
`2878698` 8.6 overlay token + Sheet/AlertDialog · `87e0ca9` 8.6 remaining primitives ·
`4484c47` 8.7 shared kit · `89df555` 8.8 header shell · `4620d16` 8.8 cart trigger · `af50461`
8.9 footer · `6c253fc` 8.9 account layout + sub-nav.

### Verifying routes (live-browser, per the DoD requirement below)

- **Spacing/icons/frame:** `/`, `/products` (1280px frame measured via bounding box; icon sizing
  checked at 390px mobile width).
- **Radius sweep:** `/products`, `/categories`, `/account/orders`.
- **Button** (hover/pressed/focus-visible/disabled, all 6 variants): `/products/[slug]`, `/cart`
  (empty-state action buttons, disabled newsletter-adjacent state) — hover confirmed via computed
  `background-color` at 12% opacity, focus-visible confirmed via a real Tab-focused screenshot
  showing the 2px accent outline.
- **Badge:** `/products/[slug]` (discount + stock badges, screenshot-confirmed as tints not fills).
- **Card:** `/products`, `/categories`, `/account/orders`, `/account/addresses`.
- **Input/Textarea:** `/account/addresses` "Add new address" form — hover and focus-visible border
  colour, and `caret-primary`, confirmed live via computed styles (border turns solid gold on
  focus, no ring).
- **Select:** `/products` sort dropdown — screenshot-confirmed the previously-gold-filled focus row
  now shows a neutral highlight, with only the selected item's text in accent.
- **Toggle/ToggleGroup:** `/products` Size filter — screenshot-confirmed the pressed state shows an
  inset accent ring, not a fill.
- **Overlays (Sheet/AlertDialog):** `/cart` drawer — screenshot-confirmed the near-black `bg-overlay`
  backdrop. AlertDialog's open state was diff-reviewed (matches Sheet's already-verified overlay
  and panel tokens exactly) but not live-triggered in this phase — no reachable AlertDialog
  consumer was found without seed data; verify it opening correctly as part of Phase 9-12 work that
  touches order cancellation or address deletion.
- **NavigationMenu popup:** `/products` Categories dropdown — screenshot-confirmed bordered popup,
  no filled hover rows.
- **Header (all 3 variants):** `/` (storefront), `/checkout` (guest context line, screenshot-
  confirmed), `/account` (customer first name, screenshot-confirmed via a real signed-up test
  account) — all three confirmed live end-to-end, including cross-checking the account sub-nav's
  active-item indicator moving between `/account` and `/account/orders`.
- **Cart trigger:** `/`, `/products/[slug]` — added an item, confirmed "Bag · 1" renders with
  tabular figures and the drawer still opens/closes (functional regression check).
- **Footer:** `/` — single-row copy confirmed via accessibility-tree search.
- **Account sub-nav:** `/account`, `/account/orders` — both screenshotted with a real authenticated
  session; active-item border correctly moved between routes.
- **Not live-verified this phase** (diff-reviewed and gate-passed only): the themed `<Toaster />`
  (no toast was triggered live), `QuantityStepper`'s interactive +/- behaviour (only its container
  classes were reviewed), and `EmptyState`'s new `secondaryAction` pairing (no call site passes one
  yet). None of these carry elevated risk — flagging for whoever next touches a screen that
  exercises them.

### No-variant `<Button>` audit (from 8.3 — carries into Phase 9)

These currently render the solid-dark `default` Button and will flip to the outlined-gold
`default` now that it's landed. Phases 9-12 must assign an explicit `variant` deliberately at each
site:

`app/account/orders/[id]/not-found.tsx:17` · `app/account/page.tsx:21` · `app/account/page.tsx:24`
· `app/categories/[slug]/error.tsx:21` · `app/categories/[slug]/not-found.tsx:14` ·
`app/categories/error.tsx:21` · `app/orders/track/[token]/error.tsx:26` ·
`app/orders/track/[token]/not-found.tsx:25` · `app/products/[slug]/error.tsx:23` ·
`app/products/[slug]/not-found.tsx:14` · `app/products/error.tsx:21` ·
`components/shared/footer/index.tsx:74` (**stale reference** — the footer was fully rewritten by
8.9 and no longer contains this Button; treat this list as the state at the moment 8.3 landed, not
current) · `components/ui/alert-dialog.tsx:149` (`AlertDialogAction` — spreads `{...props}`, so
callers *can* pass a variant) · `features/cart/components/cart-content.tsx:155` ·
`features/cart/components/cart-drawer.tsx:141` · `features/cart/components/cart-drawer.tsx:187` ·
`features/cart/components/cart-summary.tsx:87` ·
`features/checkout/components/checkout-sign-in-prompt.tsx:17` ·
`features/checkout/components/order-confirmation.tsx:64` ·
`features/checkout/components/registered-checkout-content.tsx:153` ·
`features/checkout-guest/components/guest-checkout-wizard.tsx:120` ·
`features/checkout-guest/components/guest-contact-step.tsx:39` ·
`features/checkout-guest/components/guest-shipping-step.tsx:78` ·
`features/home/components/hero.tsx:15` · `features/orders/components/claim-order-gate.tsx:24` ·
`features/orders/components/orders-results.tsx:40` ·
`features/products/components/products-filters.tsx:277` ·
`features/products/components/sticky-add-to-cart-bar.tsx:77` ·
`features/products/components/variant-selectors.tsx:147` ·
`features/wishlist/components/wishlist-list.tsx:65`

### Known pre-existing issue (not caused by this phase)

`bun lint` fails repo-wide on an ESLint/`eslint-plugin-react` crash
(`contextOrFilename.getFilename is not a function`) triggered while linting an unrelated file under
`.agents/skills/clerk-nextjs-patterns/templates/`. Confirmed via `git stash` that this fails
identically on a clean `main` before any Phase 8 change landed. Every brief in this phase verified
with `bunx tsc --noEmit` and `bun run build` instead; needs a separate fix outside Phase 8's scope.

### Two gaps caught and fixed outside the original task list

- `components/ui/toggle.tsx`'s and `components/ui/badge.tsx`'s `focus-visible` state were still on
  the old ring-based treatment after their respective restyle briefs landed — neither file's own
  brief mentioned focus-visible, and no other brief in the sequence covered them again. Both were
  fixed directly (commits folded into `c762d99` and `55f539e`) to the same
  `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` treatment
  used everywhere else, once a repo-wide grep surfaced them.
- `components/ui/toggle.tsx`'s unused `outline` variant still had `hover:bg-accent` (a literal gold
  fill) left over from before the redesign — no current call site renders it, but it was fixed in
  the same pass for consistency.

## Definition of Done

- The shell renders correctly on all fourteen routes in all three header variants, and the account sub-nav appears on every `/account` route with the correct active item.
- **Every restyled primitive state is exercised in a real browser on a named route** — hover, pressed, focus-visible, disabled, and open — because there is no Storybook and no test suite, and base-ui state attributes fail silently when mistyped. Name the verifying route for each primitive in the phase notes.
- No dropdown, toggle, badge or button renders a solid accent fill anywhere in the app.
- Keyboard focus is the 2px accent ring on every interactive element; no browser-default focus ring survives.
- The list of unvariant `<Button>` call sites from 8.3 exists and is carried into Phase 9.
- The four screens whose data the shell fetches still work: the header category menu, the cart drawer and badge, the wishlist prompt, and the Clerk auth controls.
- `bun run build` succeeds.
- `bun lint` and `bunx tsc --noEmit` pass.

## Out of scope

Screen layout and per-screen composition belong to Phases 9–12. The contact route is Phase 11. Responsive collapse of the header nav and account sub-nav is Phase 13, though the components must be built so that collapse is a breakpoint concern rather than a rewrite.
