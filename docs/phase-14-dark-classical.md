# Phase 14 — Dark Classical (derived palette and the theme mechanism)

**Objective:** derive a dark counterpart to the Classical palette and wire the theme mechanism that does not exist yet, so both themes are correct on every screen.

**Prerequisites:** Phase 13 DoD. Sequenced last so the dark palette derives from settled light tokens instead of chasing them.

**API surface:** none.

**This phase goes beyond the handoff.** Classical is authored as a light-only system; there is no dark palette in `tokens/classical-styles.css`. What the design system's readme does give is a direction — its deck section dividers "sit on a deep warm near-black (a shade below `--color-neutral-900`) as a colophon page — paper type with a gold ghost numeral", and it states that pressed states on a dark ground come from `--color-accent-400` rather than `accent-600`. That is the seed for everything below.

## Starting position

Dark mode is currently **unreachable, not merely unstyled**:

- `next-themes@^0.4.6` is a **direct dependency** in `package.json` — nothing to install.
- There is no `ThemeProvider`, no `useTheme` call, and no code path that ever applies the `dark` class. The `.dark` block in `app/globals.css` and the `@custom-variant dark` declaration exist and are fully populated, but nothing activates them.
- The remaining `dark:` variants live in **six files, all inside `components/ui/`**, and are shadcn registry leftovers rather than authored decisions. Phases 7 and 8 already removed the input and textarea ones.

So this phase is three jobs, not one: derive the palette, wire the mechanism, and audit every surface.

## Tasks

### 14.1 The mechanism

- [ ] Add `ThemeProvider` from `next-themes` inside `app/providers.tsx` with `attribute="class"`, `defaultTheme="light"`, `enableSystem` and `disableTransitionOnChange`. Place it outside the query and Clerk providers so both can read the resolved theme.
- [ ] Add `suppressHydrationWarning` to `<html>` in `app/layout.tsx`. **This is mandatory, not optional** — `next-themes` writes the class before hydration, and without it React warns on every page load.
- [ ] Add a theme toggle. The design has no control for one, so keep it quiet: a ghost icon button in the header's right cluster or in the footer row, respecting the system's icon sizing and the accent focus ring.
- [ ] Set `color-scheme` on the root for each theme and emit a matching `<meta name="theme-color">`, so native scrollbars, form controls and the mobile browser chrome follow rather than staying light.
- [ ] **Tell Clerk separately.** `app/providers.tsx` currently passes `appearance={{ theme: shadcn }}` statically, so the modal auth UI will stay light on a dark page. It needs a small client component that reads `useTheme()` and swaps the appearance object. Do the same for sonner's `<Toaster theme={...} />`.

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
