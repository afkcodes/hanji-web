# hanji design-system page — contract for chapter authors

One page, many parts. `build.py` concatenates `parts/*.html` in name order into `hanji.html`.
Shared files — **do not edit**: `parts/00-head.html` (tokens, base CSS, runtime `H`),
`parts/01-shell.html` (icon sprite, top bar, rail mount), `parts/99-tail.html` (rail/indices/cascade
init). If you need something in them, put it in your own part and say so in your report.

## Ownership

| Part file | Chapter | Number |
|---|---|---|
| 10-cover.html, 20-foundations.html, 30-motion.html | Cover, Foundations, Motion | 01, 02 (architect) |
| 40-atoms.html | Atoms | 03 |
| 50-controls.html | Controls | 04 |
| 60-surfaces.html | Surfaces | 05 |
| 70-navigation.html | Navigation | 06 |
| 80-data.html, 90-showcase.html, 95-inuse.html | Data & lists, Showcase, In use | 07, 08, 09 |

## Chapter markup

```html
<section class="chapter" id="controls" data-num="04" data-title="Controls">
  <header class="chapter-head">
    <div class="chapter-line"><h2 class="chapter-title">Controls</h2><span class="chapter-rule"></span><span class="chapter-num">04</span></div>
    <div class="chapter-body">
      <p class="chapter-lede">Two or three sentences. <b>One bolded idea.</b></p>
      <ol class="chapter-index" data-auto></ol>   <!-- filled from the entries -->
    </div>
  </header>
  <article class="entry" id="toggle"> … </article>
</section>
```

## Entry markup

```html
<article class="entry" id="toggle">                 <!-- id = component slug, unique on the page -->
  <div class="entry-meta">
    <div class="entry-num">04.01</div>
    <h3 class="entry-title">Toggle</h3>            <!-- add <span class="tag-new">New</span> if hanji does not ship it -->
    <p class="entry-desc">What it is for, in one or two sentences. <b>When not to use it.</b></p>
    <dl class="spec">
      <div><dt>Track</dt><dd><b>46 × 28</b> · pill</dd></div>
      <div><dt>Spring</dt><dd>snappy · clamped</dd></div>
      <div><dt>States</dt><dd>off · on · disabled</dd></div>
      <div><dt>A11y</dt><dd>role=switch · Space</dd></div>
    </dl>
    <p class="motion-note"><span data-curve="snappy-settle"></span><span>Why this motion, in one line.</span></p>
  </div>
  <div class="plate"> …live specimen(s)… <div class="plate-cap"><span class="live">Live</span><span>Hint</span></div></div>
</article>
```

Variants: `.entry--wide` (meta becomes a row, plate full width below — for sheets, bars, wide demos).
Plate modifiers: `.plate--top`, `.plate--col`, `.plate--stack`. `.plate-tools` (top-right) holds
`.plate-btn` buttons such as "Replay" or state switches. `.phone` is a 360×640 viewport stage
(not a device frame) with an optional `.phone-status` row. Put `data-theme="ink"` (etc.) on any
element to force a theme inside it — all tokens resolve per scope.
`data-curve` values: `snappy`, `gentle`, `bouncy`, and each with `-settle` (clamped).

## Runtime `H` (defined in 00-head)

- Tokens as CSS vars only: `--bg --bg-soft --surface --surface-2 --line --fg --fg-dim --fg-mute
  --accent --on-accent --accent-soft --danger --danger-soft --scrim --on-scrim --seal`, proposed
  `--success(-soft) --warning(-soft) --info(-soft) --data-1..6`; `rgba(var(--fg-rgb),a)`,
  `rgba(var(--accent-rgb),a)`; spacing `--s1..--s12` (density-scaled), radii `--r-xs/sm/md/lg/xl/pill`.
  **Never a raw hex in component CSS** (generated art pigments excepted).
- Motion vars: `--ease-snappy|gentle|bouncy` + `--dur-…`, clamped `--ease-…-settle` + `--dur-…-settle`,
  `--ease-out` with `--dur-fast/base/slow` (180/260/400), `--stagger` (24ms), `--rise` (12px),
  `--press` (.97), `--press-opacity` (.75), `--travel` (1, or 0 under reduced motion — multiply
  every translate distance by it so travel becomes a fade). Reduced motion rewrites all of these.
- `H.spring(value, {spring:'snappy'|'gentle'|'bouncy'|{damping,stiffness,mass}, clamp, onUpdate(v,vel), onRest})`
  → `.to(target,{velocity})`, `.set(v)`, `.stop()`, `.x`, `.v`. Interruptible; obeys the motion policy.
- `H.tween(from,to,{duration,ease,onUpdate,onDone})` ease-out-cubic, policy-capped at 180ms.
- `H.reduced()`, `H.on('theme'|'accent'|'density'|'motion'|'change', fn)`, `H.state`, `H.current()`
  (resolved colours of the current theme), `H.colorsFor(theme, accent)`, `H.color.*`.
- `H.icon(name, 's16'|'s18'|'s24')` → `<svg class="ic">` from the sprite (`i-<name>` in 01-shell:
  play play-f pause pause-f next prev shuffle repeat heart heart-f search x check chev-r chev-l chev-d
  chev-u plus minus more more-v home library user sliders bell download upload share trash pen copy
  info alert check-c x-c clock calendar note mic volume filter grip arrow-u arrow-d arrow-r arrow-l
  eye eye-off lock star star-f sun moon refresh send mail image wifi-off list grid headphones disc
  queue link undo bookmark pin menu layers flag cast moon-z sparkle-off).
- Core kit (already styled): `.hj-seg` + `H.segmented(el, onChange)`; `.hj-toggle` + `H.toggle(el, fn)`;
  `.hj-btn` (`.sm .lg .block .icon` · `.ink .secondary .quiet .danger`); `.hj-surface` + `.hj-pop`
  + `H.popover(trigger, pop)`; `H.counter(el, value)` digit roll; `.hj-press` (press dip);
  `[data-cascade]` + `H.cascade(scope)` / `H.replay(container)` staggered entrance.
- Helpers: `H.$`, `H.$$`, `H.wait(ms)`, `H.fmt(n)`.

## hanji geometry (use these numbers)

Toggle 46×28, knob 22 · Checkbox 22, stroke .13 · Radio 22, dot .5, ring 2 · Chip 32 tall · Badge 18
(dot 8, max 99+) · Button pill · Segmented 40, pad 4 · Slider track 4, thumb 12 growing ×1.6 when
held, track tint .24 · Progress track 4, tint .22 · Ring 40, stroke 4 · Row 56 · Tab bar 56, icon 24
· Dialog max 380, enters from scale .94, ≤2 actions · Sheet edge inset 8, scrim .55, max height 90%,
dismiss at 25% drag, overdrag resistance 3 · Menu gap 6, margin 8 · Toast 3200ms (+1800 with an
action, min 1200), queue cap 3 · Stepper hold: 420ms delay, 220ms interval accelerating ×.82 to 60ms
· Drag lift ×1.03 after 220ms long-press · Marquee dwell 1200ms, gap 40, 45px/s · Counter travel .55
· Morph content rise 28 · Disabled opacity .4 · Touch target 44 (grow with padding/hit area).

## hanji paint (who gets which token)

Primary button accent/on-accent · secondary fg@8% / fg · danger danger@14% / danger (never a solid
danger fill) · toggle off surface-2 + fg-mute knob, on accent + on-accent knob · segmented track
surface, indicator accent-soft, selected label accent · chip off surface/fg-dim, on accent-soft/accent
· checkbox box surface + line border, checked accent + on-accent mark · slider fill + thumb accent,
track accent@.24 · text field shell surface, focus border accent, caret accent, error danger ·
tab bar bg + top hairline, active icon accent, idle fg-dim · sheet/dialog/toast/menu surface-2 +
line border over a black scrim · banner tint fill + glyph + word.

## Motion rules (the system's, not taste)

1. Feedback in one frame: press dip on pointerdown (≤70ms), release on `snappy`.
2. Springs for anything a finger moves or may interrupt (JS `H.spring`, or CSS vars); ease-out
   timings for colour/opacity/state.
3. Short travel: entrances rise `--rise` (12px) × `--travel`; never fly across the screen.
4. Grow from the source: menus/popovers scale from their anchor (`transform-origin`), sheets from
   their edge, toasts from the bottom.
5. Leave faster than you arrive: exits `--dur-fast`, entrances `base`/`gentle`.
6. One clock per surface: stagger 24ms, capped at 10.
7. Settle, don't wobble: use the `-settle` (clamped) curves where completion gates state;
   `bouncy` only for celebration (the seal) and playful, optional flourishes.
8. Decoration dies first: loops/ambient never arm when `H.reduced()`; travel becomes fade.
9. Animate transform and opacity only — never width/height/top/left in a running animation
   (hanji PRINCIPLES §1). Draw at full size and scale/translate instead.

## Content and quality bar

- Real, specific copy (no lorem, no "John Doe"). Domain-neutral components; demo content may be a
  listening/reading/productivity app. Varied names: Mira Okafor, Jun-seo Park, Ilse Brandt,
  Tomás Reyes, Aiko Sato, Dev Malhotra, Noor Haddad.
- Status always word + glyph + tint, never colour alone. Every component shows its non-happy
  states (disabled, error, empty, loading) where they exist.
- One accent. No new hues. No gradients except in generated art. No card stacks: plates are the
  only framed surface; inside them, components sit on the page.
- Accessibility: correct roles/aria, keyboard support (Space/Enter/arrows/Escape), visible focus,
  44px targets.
- Premium = restraint + precision: tight tracking on titles (-.02em), tabular numerals, hairlines,
  exact alignment, and motion that feels physical. Delight = one considered detail per component
  (a knob that stretches, a check that draws itself, digits that roll), not confetti.
- CSS: scope your classes (`.hj-<component>` for components you own; `.pNN-…` for demo layout,
  NN = your part number). JS: wrap each part's script in an IIFE; no globals except documented
  `H.<thing>` additions you register for reuse (say so in the report).

## Verify before reporting

```
python3 build.py --out <scratch>/pNN.html 00 01 NN 99
python3 ~/.claude/skills/design-unslopped/scripts/render.py <scratch>/pNN.html <scratch>/pNN.png --width 1440 --slices
```
Read the slices; fix what is off; also render `?theme=ink` (copy the html and append the query in a
wrapper, or open it in the browser pane) and check every entry in a dark paper. Check the console
for errors. Report: entries built (ids), anything you needed from the shared files, known gaps.
