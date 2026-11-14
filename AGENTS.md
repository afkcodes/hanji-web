# hanji-web — rules for agents and contributors

hanji for the web: compound React components on **Base UI** (`@base-ui/react` 1.9), styled by
**plain CSS in cascade layers** driven by `--hj-*` tokens from `@hanji/tokens`. Performance and
agent-readability are features, not extras.

## Layout

```
packages/tokens   @hanji/tokens  colour maths, papers, accents, springs → CSS linear(), createTheme(), JSON Schema
packages/react    @hanji/react   components (src/components/<slug>/), system (src/system/), styles
packages/mcp      @hanji/mcp     MCP server over the generated manifest
packages/icons    @hanji/icons   2,200+ icons (outline · solid · wash) generated from Tabler with hanji's corners
packages/tailwind @hanji/tailwind  optional Tailwind v4 preset mapping tokens
apps/playground   Vite app; auto-discovers every component's meta + examples (http://localhost:4420/#/<slug>)
```

Base UI ships its own docs: `packages/react/node_modules/@base-ui/react/docs/react/components/<name>.md`
and `.../handbook/{styling,animation,composition,forms}.md`. **Read the component's doc before
wrapping it** — it lists every part, prop, data-attribute and CSS variable for the installed version.

## A component folder — `packages/react/src/components/<slug>/`

| File                  | Contents                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `<slug>.tsx`          | `'use client'` + the parts. Named exports only.                                                                                 |
| `<slug>.css`          | `@layer hj.components { … }` — every class starts `hj-<slug>`.                                                                  |
| `<slug>.meta.ts`      | `export const meta: ComponentMeta = defineMeta({…})` — the agent-readable doc.                                                  |
| `<slug>.test.tsx`     | vitest + Testing Library (import parts from `./<slug>.tsx`).                                                                    |
| `examples/<name>.tsx` | `export function Example(): React.JSX.Element`, importing from `'@hanji/react'` like a user would.                              |
| `index.ts`            | Public API. Compound: `export * as Dialog from './dialog.tsx'`; single: `export { Badge } from './badge.tsx'`; plus prop types. |

`src/components/index.ts` is generated (`node packages/react/scripts/gen-index.ts`) — never edit it.
Never edit `src/system/**`, `src/styles/**`, another component's folder, or shared config; if you
need something there, put a local helper in your folder and say so.

### Patterns (copy from `button/`, `dialog/`, `field/`, `switch/`)

- **Wrap a Base UI part with no own props:** `export const Title: HanjiPart<typeof Base.Title> = part(Base.Title, 'Dialog.Title', 'hj-dialog-title');`
- **A part with own props:** `const [config, { size = 'md', className, ...rest }] = useSlot('<Slot>', props)` (or `useHanjiConfig()` + `withDefaults()`; the hook form is React-Compiler safe to feed `useMemo`), put
  variants on `data-*` attributes, class via `cls(config, '<Slot>', 'hj-…', className)` (keeps
  Base UI's function-className), booleans via `flag()`. Declare `interface XOwnProps` separately
  from `interface XProps extends XOwnProps, Base.X.Props {}` — meta documents the own props.
- **A hanji-only layout part:** `elementPart('div', 'Dialog.Actions', 'hj-dialog-actions')` (supports `render`).
- **Custom non-Base element with state:** use `useRender` from `@base-ui/react/use-render` so `render` works everywhere.
- **Portals:** wrap Base UI `Portal` children in `<ThemeScope>` (see `dialog.tsx` `Portal`) so popups keep the surrounding `<Theme>`.
- **Icons:** `config.icons.<name>` (adapter, overridable; `@hanji/icons/adapter` swaps in the full set). Need a glyph that isn't there? Inline a small 24-grid 1.5-stroke SVG in your component and note it — `@hanji/react` stays free of an icons dependency. Apps and examples use `@hanji/icons` (`IconX`, `variant="outline" | "solid" | "wash"`).
- **Icon set:** `packages/icons/src/icons/**`, `index.ts`, `names.ts`, `loaders.ts` and `catalog.ts` are generated — never edit them. Change `scripts/corners.ts` (hanji's continuous corners) or `scripts/generate.ts` (selection) and run `node packages/icons/scripts/generate.ts`. Brand logos stay out.
- **Strings:** `config.strings.*` for anything a component renders itself — close, clear, remove, skip, done, back, next, previous, pagination, opensInNewTab, and templates `countOf(n,total)`, `stepOf`, `allStepsDone`, `characterOf`, `ratedOutOf`. Add a key to `HanjiStrings` rather than hard-coding English.
- **Convenience parts are welcome** when they remove boilerplate (`Dialog.Content` = Portal + Backdrop + Popup; `Switch.Root` renders its Thumb when childless) — but every underlying part stays exported.
- **Slot names** are `'<Component>.<Part>'` (or `'<Component>'` for single-part) and must match meta.

### Types (TypeScript 7, `isolatedDeclarations`)

Every export needs an explicit type: `export function X(props: XProps): React.ReactElement`,
`export const Y: HanjiPart<typeof Base.Y> = part(...)`, `export const meta: ComponentMeta = …`.
`props<XOwnProps>({...})` in meta is exhaustive — missing or extra keys fail typecheck. No `any`.

## CSS rules (enforced by `pnpm lint:css`)

1. File = `@layer hj.components { … }`; every class `hj-<slug>…`; never style another component's classes.
2. **Tokens only** — no raw colours (`black`/`transparent`/`currentColor` keywords are fine in masks).
   Paint: `--hj-bg --hj-bg-soft --hj-surface --hj-surface-2 --hj-line --hj-fg --hj-fg-dim --hj-fg-mute
   --hj-accent --hj-on-accent --hj-accent-soft --hj-danger(-soft) --hj-success(-soft) --hj-warning(-soft)
   --hj-info(-soft) --hj-scrim --hj-on-scrim --hj-seal --hj-data-1..6 --hj-focus --hj-shadow-lift --hj-shadow-art`.
   Tints: `color-mix(in srgb, var(--hj-fg) 8%, transparent)`.
   Space `--hj-space-{1,2,3,4,5,6,8,10,12}` (density-scaled) · radius `--hj-radius-{xs,sm,md,lg,xl,pill}` ·
   type `font: var(--hj-type-<role>); letter-spacing: var(--hj-tracking-<role>)` (roles: hero display title heading subheading body sub label eyebrow mono) ·
   `--hj-font-sans --hj-font-mono` · z `--hj-z-{sticky,overlay,popover,toast,tooltip}` · `--hj-touch` (44px).
3. **Variants are data-attributes** (`[data-variant='ink']`), state comes from Base UI (`[data-checked]`, `[data-open]`, `[data-highlighted]`, `[data-disabled]`, `[data-starting-style]`, `[data-ending-style]`).
4. **Customisation hooks**: read component variables with a fallback — `height: var(--hj-<slug>-height, 44px)` — never declare them on the element, so consumers can set them on any ancestor. Document each in meta `cssVars`. Private computed vars use `--_name`.
5. **Motion** — tokens only, transform/opacity only (never animate width/height/top/left — draw full size, scale/translate; the declared exceptions: accordion/collapsible height reveal via Base UI's `--accordion-panel-height`/`--collapsible-panel-height`, NavigationMenu's viewport size morph, Banner's space opening and closing (`grid-template-rows` 0fr ↔ 1fr, with any parent row gap animated on the neighbour), Avatar.Group's hover fan (the overlap margin eases 6px so neighbours move aside), and sliding indicator pills (Tabs, SegmentedControl) that animate a `clip-path: inset(… round 999px)` so the highlight stays a true pill at every width — never a scaleX squeeze, which flattens round ends — each declared in its meta):
   - controls & anything the finger released: `var(--hj-dur-snappy) var(--hj-ease-snappy)`; where completion gates state use `-settle` (clamped): `var(--hj-dur-snappy-settle) var(--hj-ease-snappy-settle)`
   - arrivals (sheets, lists, reveals): `gentle` / `gentle-settle`; celebration only: `bouncy`
   - colour/opacity/state: `var(--hj-dur-fast|base|slow) var(--hj-ease-out)`; **exits use `--hj-dur-fast`**
   - press: `transform: scale(var(--hj-press))` on `:active`, `transition-duration: 70ms`; rows use `opacity: var(--hj-press-opacity)`
   - entrances rise `calc(var(--hj-rise) * var(--hj-travel))` (travel is 0 under reduced motion → a fade)
   - popups scale from `transform-origin: var(--transform-origin)` (Base UI) — grow from the source
   - spinners: `animation: var(--hj-anim-spin)` (turns; pulses under reduced motion); ambient loops: `animation-play-state: var(--hj-ambient)`
   - shared keyframes in base: `hj-spin`, `hj-pulse`, `hj-fade-in`; stagger with `.hj-stagger` + `--hj-i`
   - JS-driven gestures: `useSpring` from `src/system/motion.ts` (DOM-direct, interruptible, policy-aware)
6. **Density** — spacing scales: `calc(Npx * var(--hj-density))` (or `--hj-space-*`) for every padding/gap/margin ≥ 3px; control heights scale gently: `--_h: var(--hj-x-height, calc(44px * var(--hj-density-size)))` (compact ≈ .87). Fixed drawings (switch, checkbox, radio, icons) don't scale. Enforced by lint:css.
7. **Squircle** — every non-pill radius also sets `corner-shape: var(--hj-corner-shape, round)` (hanji smoothing .72 → `superellipse(1.72)`; `createTheme({ smoothing })`); `border-radius: inherit` pairs with `corner-shape: inherit`. For art that must be exact everywhere use `<Squircle>`. Enforced by lint:css.
8. Touch targets ≥ 44px (grow the hit area with a `::before` inset if the drawing is smaller).
9. Depth = paper steps + hairline (`box-shadow: inset 0 0 0 1px var(--hj-line)` or a 1px border). Only anchored popovers use `--hj-shadow-lift`; only imagery uses `--hj-shadow-art`.

## hanji paint & geometry (match these)

Button pill 34/44/52 · Switch 46×28 knob 22 · Checkbox/Radio 22 (radio dot .5, ring 2) · Chip 32 tall ·
Badge 18 (dot 8, 99+) · Segmented 40, pad 4, indicator accent-soft, label accent · Slider track 4,
thumb 12 growing ×1.6 while dragged, track accent@24% · Progress track 4, tint 22% · Ring 40/stroke 4 ·
Row 56 · Tab bar 56 · Dialog ≤380 · Sheet edge inset 8, scrim .55 · Menu gap 6 · Toast 3200 ms
(+1800 with action), max 3 · Disabled opacity .4. Chips/segmented off = surface/fg-dim, on =
accent-soft/accent. Danger is a tint + glyph + verb, never solid. Status = word + glyph + tint.

## Quality bar

Premium through restraint: hairlines, tabular numerals, tight tracking on titles, one accent, one
considered motion detail per component. Real copy in examples (varied names: Mira Okafor, Jun-seo
Park, Ilse Brandt, Tomás Reyes, Aiko Sato, Dev Malhotra, Noor Haddad); show non-happy states.
Accessibility is the floor: Base UI gives roles/keyboard — don't break them; label icon-only controls.

## Commands

```
node packages/react/scripts/gen-index.ts                 # after adding a folder
./node_modules/.bin/tsc --noEmit -p packages/react       # typecheck (TS 7, ~1 s)
./node_modules/.bin/vitest run packages/react/src/components/<slug>
./node_modules/.bin/oxlint --deny-warnings packages/react/src/components/<slug>
node scripts/lint-css.ts
./node_modules/.bin/oxfmt packages/react/src/components/<slug>
pnpm check                                               # everything, before shipping
# note: oxlint/oxfmt take one directory per invocation when scoping to folders
```
