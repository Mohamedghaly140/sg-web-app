# Phase 14 — Dark Classical (derived palette and the theme mechanism)

**Objective:** derive a dark counterpart to the Classical palette and wire the theme mechanism that does not exist yet, so both themes are correct on every screen.

**Prerequisites:** Phase 13 DoD. Sequenced last so the dark palette derives from settled light tokens instead of chasing them.

**API surface:** none.

**This phase goes beyond the handoff.** Classical is authored as a light-only system; there is no dark palette in `tokens/classical-styles.css`. What the design system's readme does give is a direction — its deck section dividers "sit on a deep warm near-black (a shade below `--color-neutral-900`) as a colophon page — paper type with a gold ghost numeral", and it states that pressed states on a dark ground come from `--color-accent-400` rather than `accent-600`. That is the seed for everything below.

## Starting position

Dark mode is currently **unreachable, not merely unstyled**:

- `next-themes@^0.4.6` is a **direct dependency** in `package.json` — nothing to install.
- There is no `ThemeProvider`, no `useTheme` call, and no code path that ever applies the `dark` class. The `.dark` block in `app/globals.css` and the `@custom-variant dark` declaration exist, but nothing activates them. **Correction (14.1, 2026-09-10): `.dark` is not "fully populated".** It is the untouched shadcn `oklch()` registry default, and it is missing four token groups that app code consumes — `--accent-strong`, `--overlay`, `--neutral-100…900` and `--accent-100…900` — so light values leak straight into dark. 14.2 authors all four.
- The remaining `dark:` variants live in **six files, all inside `components/ui/`** — eight declarations across `badge.tsx` (×2), `button.tsx` (×2), `input.tsx`, `select.tsx`, `textarea.tsx` and `toggle.tsx` — and are shadcn registry leftovers rather than authored decisions. **Correction (14.1, 2026-09-10):** the file count is right but the claim that "Phases 7 and 8 already removed the input and textarea ones" is not — `components/ui/input.tsx:12` and `components/ui/textarea.tsx:10` still carry `dark:aria-invalid:*`. The review itself stays 14.4.

So this phase is three jobs, not one: derive the palette, wire the mechanism, and audit every surface.

## Tasks

### 14.1 The mechanism

- [x] Add `ThemeProvider` from `next-themes` inside `app/providers.tsx` with `attribute="class"`, **`defaultTheme="system"`**, `enableSystem` and `disableTransitionOnChange`. Place it outside the query and Clerk providers so both can read the resolved theme. **Deviation:** this bullet originally said `defaultTheme="light"`, which contradicts this phase's own DoD line "follows the system preference when the customer has not chosen". In `next-themes` the two are mutually exclusive — `defaultTheme="light"` merely adds `"system"` to the list of selectable themes and never follows the OS for a visitor who has not chosen. The DoD wins. Light-first authoring is about which palette is the *source*, not which one a visitor *gets*. Imported directly; `next-themes` ships its own `"use client"` directive, so no local wrapper component is needed.
- [x] Add `suppressHydrationWarning` to `<html>` in `app/layout.tsx`. **This is mandatory, not optional** — `next-themes` writes the class before hydration, and without it React warns on every page load. It writes an inline `style="color-scheme:…"` there too, for the same reason.
- [x] Add a theme toggle. The design has no control for one, so keep it quiet: a ghost icon button in the header's right cluster or in the footer row, respecting the system's icon sizing and the accent focus ring. Shipped as `components/shared/header/header-theme-toggle.tsx` in the header's right cluster, between the auth controls and `Sidenav`; the footer has no interactive controls at all, so the header was the only placement that matches an existing pattern. Two decisions worth keeping: **the sun/moon swap is done in CSS** (`dark:hidden` / `hidden dark:block`) rather than with a `mounted` state guard, because `next-themes` sets the class before hydration — so the right icon is painted on the first frame with no mismatch to suppress, and `resolvedTheme` is only read inside the click handler, which cannot fire before hydration. And **it is not gated on `useHeaderVariant`**: `Sidenav` and `HeaderSearch` return `null` on `"checkout"` because they are navigation-*away* chrome, and a preference control is not. It inherits `size="icon"`'s `pointer-coarse:min-h-10` floor and the primitive's accent focus ring for free.
- [x] Set `color-scheme` on the root for each theme and emit a matching `<meta name="theme-color">`, so native scrollbars, form controls and the mobile browser chrome follow rather than staying light. `color-scheme: light` / `dark` are declared on `:root` and `.dark` in `app/globals.css`; `next-themes` writes the same value inline (its `enableColorScheme` defaults on), but the declarative pair is the source of truth and belongs with the palette. `theme-color` is `components/shared/theme/theme-color-bridge.tsx`. **A `viewport.themeColor` export was deliberately rejected:** a `prefers-color-scheme` media pair follows the OS rather than an explicit choice, and it would have to restate the palette's hex in code, against `01-conventions.md` §7. The bridge reads the *painted* value instead — `getComputedStyle(document.body).backgroundColor`, where `body` is `bg-background` — so 14.2's palette flows through with no edit. Two mechanics that are easy to get wrong: it must trigger on a **`MutationObserver` on `<html>`'s class, not on `resolvedTheme`**, because `next-themes` applies the class in the *provider's* effect and React flushes child effects before parent effects, so a descendant keyed on the context reads the previous background and lands one toggle behind; and the tag is **rendered as JSX** (`<meta name="theme-color" content={…} />`) rather than created imperatively, because React 19 hoists it into `<head>` on its own.
- [x] **Tell sonner separately — but not Clerk.** **Deviation, verified in the browser:** Clerk needs no appearance wrapper. `@clerk/ui/dist/themes/shadcn.js` resolves entirely to our own custom properties (`colorBackground: "var(--card)"`, `colorForeground: "var(--card-foreground)"`, `colorPrimary`, `colorMuted`, `colorInput`, `colorRing`, …), its one `dark:` utility compiles through *our* `@custom-variant dark`, and Clerk mounts in the light DOM under `<body>` — so the sign-in modal follows the `.dark` class for free, confirmed by screenshot. Composing `theme: [shadcn, dark]` would actively *break* Classical, because `@clerk/ui`'s `dark` theme hardcodes `#212126` / `#ffffff` over the palette. Clerk stays a 14.4 verification item. sonner does need wiring: its `theme` prop defaults to `"light"` and drives its internal `[data-sonner-toaster][data-theme]` stylesheet, and its own `"system"` value reads `prefers-color-scheme`, so it cannot honour an explicit choice. The `<Toaster>` therefore moved out of `app/providers.tsx` into `components/shared/toaster/index.tsx`, which reads `useTheme()` — it has to be a *descendant* of `ThemeProvider` to see the context.
- [x] **Pre-existing bug found while verifying, fixed here:** the Phase 8 `toastOptions.classNames` never actually landed. sonner injects its stylesheet at runtime *unlayered*, and unlayered CSS beats anything in `@layer utilities` regardless of specificity — the same trap already documented for Clerk's `headerTitle` in `app/providers.tsx`. Toasts were rendering sonner's own white-on-black in **both** themes (measured `rgb(255,255,255)` on light, where `--popover` is `#eae9e9`). Adding the trailing `!` to each class lands the Classical surface; re-measured as an exact `--popover` match in both themes.

### 14.2 The palette

- [x] Derive the ground and ink: `--background: #1c1a19` (a shade below `neutral-900`'s `#2d2b2b`, per the readme's colophon direction); `--foreground: #eae7e7` (`neutral-200`, **warm rather than pure white**, 14.10:1); `--muted` and `--popover` at `#2d2b2b`; `--card` equal to the background so cards stay unfilled; `--border` and `--input` as `#eae7e7` at 16%, mirroring the light divider's construction. `--secondary` follows the same construction at 7%, and `--secondary-foreground` is the ink.
- [x] Set `--accent`, `--primary` and `--ring` to `#c28d41` (`accent-500`, 5.93:1) for strokes, and **`--accent-strong` to `#e1ad66` (`accent-400`, 8.56:1)**. This is the structural payoff of Phase 7: on light, "strong" means *darker*; on dark it means *lighter*. Because `--accent-strong` is a token rather than a hardcoded `accent-700` scattered through components, the entire small-text accent story inverts by changing one line. `--primary-foreground` becomes the dark ground `#1c1a19` — dark ink on a gold fill (5.93:1); the light value would fail. This is the pair Clerk's primary button reads.
- [x] **Invert the ramp indices rather than authoring new hex values.** In `.dark`, `--accent-100` takes the light `--accent-900` value, `--accent-800` takes `--accent-200`, and so on through both ramps. Then `bg-accent-100 text-accent-800` — the tag treatment used on every badge in the app — keeps working with **zero class changes** (measured 11.51:1; the neutral pairing 11.45:1). They have to be literals: `--neutral-100: var(--neutral-900)` inside the same block would be a cycle.
- [x] Set `--muted-foreground` to `#9b9797` (`neutral-500`): 6.00:1 on the ground, 4.87:1 on `--muted`.
- [x] Retune the shadows. **Mechanism (deviation, advisor-reviewed):** the three shadows were literal `color-mix()` values inside `@theme inline`, which cannot vary by theme. Tokenising the *whole* value (`--shadow-md: var(--elevation-md)`) was rejected after compiling it with Tailwind 4.3.3: it drops the `var(--tw-shadow-color, …)` wrapper, so `shadow-<color>` modifiers would silently stop working. Instead the geometry stays literal and only the colour is a token — `--shadow-md: 0 3px 10px var(--elevation-md)` — and the built CSS confirms `--tw-shadow: 0 3px 10px var(--tw-shadow-color, var(--elevation-md))`. Light values are byte-identical to Phase 7's; dark uses black at 40/50/60%, with `--border` doing the separating.
- [x] Invert the `--overlay` token introduced in Phase 8: near-black `#0c0b0b` at 70%, heavier than light's 50%, so a backdrop still visibly dims a ground that is already dark.
- [x] Re-derive the four semantic roles. `--warning` still aliases `--accent-strong`. **`--info` moves one ramp step, to `--neutral-600` (`#bab6b6`) — deviation found in the 14.4 walk:** keeping light's `--neutral-700` alias would resolve through the inverted ramp to `#d7d3d3`, only 1.21:1 from the Pending badge's `#eae7e7` text, and Shipped and Pending rendered as the same chip. `#bab6b6` restores light's separation (1.63:1 vs light's 1.55:1) and holds 7.11:1 on its own `/10` tint. The aliases resolve against the dark ramp because next-themes puts `.dark` on `<html>`, the same element as `:root`. `--destructive` is `#d9917f` (oxide) and `--success` `#a5b38f` (moss): as text on their own `/10` tint over the ground, 5.84:1 and 6.55:1; the destructive button's hover `/20` tint holds 4.81:1. The four `*-foreground` values pair with the dark ground, since every fill is now light.
- [x] **Dead tokens removed (deviation):** `--chart-1…5` and `--sidebar-*` were deleted from `:root`, `.dark` and `@theme inline`. They had zero consumers in the app, in `@clerk/ui`'s shadcn theme and in `shadcn/tailwind.css`, and were the last stale `oklch()` lines in the block being rewritten. This does not change the light palette. Running `bunx shadcn add sidebar|chart` would re-inject them, which is acceptable.
- [x] **Completeness check:** every custom property in `:root` now has a `.dark` counterpart; only `--radius` is missing, by design. `docs/01-conventions.md` §7 was updated to give the accent-contrast values for both themes, and to state that `:root`/`.dark` declare theme-varying values and `@theme inline` only maps them.

### 14.3 The `.plate` override

- [x] Give `.plate` its own dark treatment. A sepia-warmed photograph inside a dark mat reads wrong — the grade was tuned against a near-white ground. Move the mat to `--muted` (now `#2d2b2b`) and soften the filter to roughly `sepia(.14) saturate(.9) contrast(1.02) brightness(.94)`.
- [x] Verify the softened grade against real product photography at both large hero and 46px thumbnail sizes before settling the numbers.

**Landed (2026-10-08):** the override lives *inside* `@utility plate` as `@variant dark { filter: … }`, not as a separate `.dark .plate` rule. It reuses the project's single `@custom-variant dark` definition and stays in `@layer utilities`; a standalone rule would be unlayered and beat every utility — the same trap documented for sonner and Clerk. The mat needs no rule, because `--color-muted` already resolves to `#2d2b2b` under `.dark`. Computed values measured in the browser: dark `sepia(0.14) saturate(0.9) contrast(1.02) brightness(0.94)` on a `rgb(45,43,43)` mat; light unchanged. **Photography check (2026-10-08, after the backend recovered):** the starting values hold, and the numbers are settled as written. Checked: the home hero in the `#2d2b2b` mat, collection plates on `/categories`, listing cards, the PDP main image and its `plate-sm` thumbnail, and the 46px cart line thumbnail. Skin tones and whites stay neutral rather than going muddy; no retune was needed.

### 14.4 The audit

- [x] **Review, do not inherit, the residual `dark:` classes in `components/ui/`.** The remaining `dark:aria-invalid:*` and `dark:hover:bg-muted/50` declarations are shadcn defaults authored for a different palette. Each one either becomes an authored decision or is deleted.
- [x] Walk every screen in both themes and check specifically: the two overlays; the Clerk sign-in and sign-up modals; sonner toasts; every skeleton; `.plate` on all its sizes; the semantic badge tints on the orders and order-detail screens; the wordmark's accent middle dot; and the focus ring against the dark ground.
- [x] Re-run contrast checks across the board. The light palette's `≥3:1` accent caveat does not carry over unchanged, and both documented light-mode deviations (`--muted-foreground`, `--accent-strong`) need re-derivation rather than translation.
- [x] Confirm the wordmark still recolours. This is why Phase 8 required live Cormorant type rather than the PNG lockup — verify no raster brand asset has crept back in.

**14.4 progress (2026-10-08).**

*Residual `dark:` review — all eight deleted, one reason each.* The tokens now carry the theme, so a per-theme override inside a primitive would be a second source of truth.
- `badge.tsx` `dark:aria-invalid:ring-destructive/40`: the `/20` ring is drawn from the lighter dark-theme `--destructive` and needs no boost.
- `badge.tsx` ghost `dark:hover:bg-muted/50`: on dark `--muted` is `#2d2b2b`, a quiet lift off the ground at full strength; halving it made the hover almost invisible.
- `button.tsx` base `dark:aria-invalid:border-destructive/50` / `ring-destructive/40`: same reasoning as the badge ring — a full-strength oxide border is the authored invalid state in both themes.
- `button.tsx` destructive `dark:bg-destructive/20` / `dark:hover:bg-destructive/30`: the shared `/10` → `/20` tints keep the text at 5.84:1 at rest and 4.81:1 on hover, and match the badge `bg-<role>/10` pattern.
- `input.tsx`, `select.tsx`, `textarea.tsx` `dark:aria-invalid:*`: as for the button. Measured: an invalid input's border computes to `rgb(217,145,127)`, the dark `--destructive`.
- `toggle.tsx` `dark:aria-invalid:ring-destructive/40`: as for the badge.

*Verified in the browser, dark theme, 2026-10-08:*
- the OS dark preference resolves `.dark`, inline `color-scheme: dark`, and `theme-color` `rgb(28,26,25)`, with zero hydration warnings
- `/contact` at 1280px
- the mobile sheet at 390px: overlay `rgba(12,11,11,.7)`, surface `#2d2b2b`, `shadow-lg` at black 60%, gold focus ring
- Clerk sign-in modal: palette surfaces, primary button `#c28d41` with `#1c1a19` ink
- wordmark: live text, ink `#eae7e7`, middle dot `--accent-strong` `#e1ad66`; `public/brand/*.png` is referenced nowhere

*Data-screen walk, dark theme, after the backend recovered (2026-10-08):*
- `/`: hero and collection plates, gold CTAs.
- `/products`: cards and discount badges. `bg-accent-100 text-accent-800` computes to `#ffe3bf` on `#3a270d` (11.5:1) with zero class changes.
- `/products/[slug]`: colour swatches. Black and charcoal keep their `border-border` edge on the ground, so no change was needed. Also checked: the selected size, the quantity stepper and the thumbnail plate.
- `/cart`: line plate and summary.
  - The coupon error state: text and `aria-invalid` border both `#d9917f`, 6.86:1.
  - The remove-item alert-dialog: overlay `rgba(12,11,11,.7)`, surface `#2d2b2b`. The destructive button's `/10` tint stays legible without the deleted `dark:bg-destructive/20` override.
- `/checkout/guest`: checkout header with the toggle, and the step rail.
- `/categories`.
- Clerk `/sign-up`, as a page and as a modal.
- Light theme: the unset visitor follows a light OS preference, and `/` renders the unchanged light palette. Light shadow values are byte-identical to Phase 7's.

*Order status badges:* rendered with the exact variant classes from `components/shared/order-status-badge.tsx`, and all six are distinguishable after the `--info` move above. Skeletons use `bg-muted` (`#2d2b2b` on `#1c1a19`), which is more separation than light's `#eae9e9` on `#f3f2f2`.

**Contrast summary, dark:**

| Text on ground | Ratio |
|---|---|
| ink | 14.10 |
| `--muted-foreground` | 6.00, 4.87 on `--muted` |
| `--accent` | 5.93 |
| `--accent-strong` | 8.56 |
| `--primary-foreground` on `--primary` | 5.93 |

| Status text on its own `/10` tint | Ratio |
|---|---|
| destructive | 5.84, 4.81 on hover `/20` |
| success | 6.55 |
| warning | 7.08 |
| info | 7.11 |

**Carried forward (unchanged from Phase 13):** the signed-in account screens (`/account/*`) and the registered `/checkout` were not exercised headlessly. Clerk's sign-up now raises a Cloudflare Turnstile human check, which automation must not bypass. They consume the same tokens and primitives verified above. A manual pass in a real browser is recommended before release, and the gap is noted for Phase 15. The sonner toast was not re-triggered on a data path: the add-to-bag and remove-item flows do not toast. It reads `--popover`, which 14.1 measured as an exact match and which is now `#2d2b2b`.

## Definition of Done

- A theme toggle exists, persists across navigation and reload, and follows the system preference when the customer has not chosen.
- No hydration warning appears in the console on any route.
- **Every one of the fifteen screens is verified in both themes**, plus a system-preference flip while the app is open.
- Clerk's modals and sonner's toasts follow the theme rather than staying light.
- No residual shadcn `dark:` class survives unreviewed.
- Contrast checks pass on both themes for body text, controls and status badges.
- Photography reads correctly in both themes at hero and thumbnail sizes.
- `bun run build` succeeds.
- `bun lint` and `bunx tsc --noEmit` pass.

## Out of scope

Any change to the light palette, which is settled by this point. Per-screen dark-specific layouts — dark mode is a token swap, and any screen needing structural change in dark is a signal that its light composition is wrong. Performance and accessibility re-baselining happen in Phase 15, deliberately after this phase so they measure the finished thing.
