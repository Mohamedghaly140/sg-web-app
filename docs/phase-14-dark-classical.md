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

- [ ] Derive the ground and ink: `--background: #1c1a19` (a shade below `neutral-900`'s `#2d2b2b`, per the readme's colophon direction); `--foreground: #eae7e7` (`neutral-200`, **warm rather than pure white**); `--muted` and `--popover` at `#2d2b2b`; `--card` equal to the background so cards stay unfilled; `--border` and `--input` as `#eae7e7` at 16%, mirroring the light divider's construction.
- [ ] Set `--accent` and `--primary` to `#c28d41` (`accent-500`) for strokes, and **`--accent-strong` to `#e1ad66` (`accent-400`)**. This is the structural payoff of Phase 7: on light, "strong" means *darker*; on dark it means *lighter*. Because `--accent-strong` is a token rather than a hardcoded `accent-700` scattered through components, the entire small-text accent story inverts by changing one line. For reference, the base gold `#b68235` computes to roughly 5:1 on this ground and is legal — moving to accent-500/400 is a presence and legibility choice, not a rescue.
- [ ] **Invert the ramp indices rather than authoring new hex values.** In `.dark`, `--accent-100` takes the light `--accent-900` value, `--accent-800` takes `--accent-200`, and so on through both ramps. Then `bg-accent-100 text-accent-800` — the tag treatment used on every badge in the app — keeps working with **zero class changes**. This is the cleanest mechanism available in this phase, and it exists only because Phase 7 exposed the ramps as tokens instead of inlining them.
- [ ] Set `--muted-foreground` to `#9b9797` (`neutral-500`), which lands near 6:1 on the dark ground. Re-derive rather than reuse the light value; the light choice was itself a documented contrast deviation.
- [ ] Retune the shadows. The readme describes dark elevation as "a hairline edge plus ambient darkness" — push the three shadows toward near-black at higher alpha and lean on `border` to do the separating work.
- [ ] Invert the `--overlay` token introduced in Phase 8. It was made a token specifically so this line is all that is needed.
- [ ] Re-derive the four semantic roles. `--warning` still aliases `--accent-strong` and `--info` still aliases a neutral step, but `--destructive` and `--success` need lighter, still-desaturated values to stay legible as text on a dark tint.

### 14.3 The `.plate` override

- [ ] Give `.plate` its own dark treatment. A sepia-warmed photograph inside a dark mat reads wrong — the grade was tuned against a near-white ground. Move the mat to `--muted` (now `#2d2b2b`) and soften the filter to roughly `sepia(.14) saturate(.9) contrast(1.02) brightness(.94)`.
- [ ] Verify the softened grade against real product photography at both large hero and 46px thumbnail sizes before settling the numbers.

### 14.4 The audit

- [ ] **Review, do not inherit, the residual `dark:` classes in `components/ui/`.** The remaining `dark:aria-invalid:*` and `dark:hover:bg-muted/50` declarations are shadcn defaults authored for a different palette. Each one either becomes an authored decision or is deleted.
- [ ] Walk every screen in both themes and check specifically: the two overlays; the Clerk sign-in and sign-up modals; sonner toasts; every skeleton; `.plate` on all its sizes; the semantic badge tints on the orders and order-detail screens; the wordmark's accent middle dot; and the focus ring against the dark ground.
- [ ] Re-run contrast checks across the board. The light palette's `≥3:1` accent caveat does not carry over unchanged, and both documented light-mode deviations (`--muted-foreground`, `--accent-strong`) need re-derivation rather than translation.
- [ ] Confirm the wordmark still recolours. This is why Phase 8 required live Cormorant type rather than the PNG lockup — verify no raster brand asset has crept back in.

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
