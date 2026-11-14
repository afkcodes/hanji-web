/**
 * hanji's icon motion, as one small stylesheet. Icons render it through React 19's
 * `<style href precedence>`, so it is added to <head> once, only when an icon animates, and
 * works with server rendering — nothing to import.
 *
 * Timing reads hanji's motion tokens (springs compiled to `linear()`) and falls back to close
 * cubic-béziers outside a hanji theme. Reduced motion (the OS setting, or hanji's
 * `data-hj-motion="reduced"`) keeps feedback and drops travel: draws and pops become fades, the
 * fill toggle cross-fades, a spinner pulses.
 */
export const MOTION_HREF: string = 'hanji-icon-motion';

const SPRING = 'var(--hj-ease-bouncy, cubic-bezier(.34, 1.56, .64, 1))';
const SPRING_DUR = 'var(--hj-dur-bouncy, 620ms)';
const SETTLE = 'var(--hj-ease-gentle-settle, cubic-bezier(.22, .9, .3, 1))';
const OUT = 'var(--hj-ease-out, cubic-bezier(.2, .7, .2, 1))';
const FAST = 'var(--hj-dur-fast, 160ms)';
const TRAVEL = 'var(--hj-travel, 1)';

const reduced = `
  [data-hj-anim] { animation: hj-icon-fade 200ms ${OUT} both !important; }
  [data-hj-anim='spin'] { animation: hj-icon-pulse 1100ms ease-in-out infinite alternate !important; }
  [data-hj-anim] path { animation: none !important; stroke-dasharray: none !important; }
  [data-hj-fill] > [data-layer] { transform: none !important; }`;

export const motionCss: string = `
@layer hj.icons {
  [data-hj-anim], [data-hj-fill] > [data-layer] {
    transform-box: view-box;
    transform-origin: 12px 12px;
  }

  /* pop: arrives with a spring — a new message, an added item */
  [data-hj-anim='pop'] { animation: hj-icon-pop ${SPRING_DUR} ${SPRING} both; }
  @keyframes hj-icon-pop {
    from { transform: scale(calc(1 - 0.4 * ${TRAVEL})); opacity: 0; }
    30% { opacity: 1; }
  }

  /* draw: the line inks itself in, mark by mark; fills settle in after */
  [data-hj-anim='draw'] path[pathLength] {
    stroke-dasharray: 1 1;
    animation: hj-icon-draw var(--hj-icon-draw, 640ms) ${SETTLE} both;
    animation-delay: calc(var(--hj-icon-i, 0) * 70ms);
  }
  [data-hj-anim='draw'] path[fill='currentColor'] { animation: hj-icon-fade 280ms ${OUT} 320ms both; }
  @keyframes hj-icon-draw {
    from { stroke-dashoffset: 1; opacity: 0; }
    6% { opacity: 1; }
    to { stroke-dashoffset: 0; opacity: 1; }
  }

  /* ring: a bell swings from its hook */
  [data-hj-anim='ring'] { transform-origin: 12px 2.5px; animation: hj-icon-ring 900ms ${OUT} both; }
  @keyframes hj-icon-ring {
    15% { rotate: calc(16deg * ${TRAVEL}); }
    30% { rotate: calc(-13deg * ${TRAVEL}); }
    45% { rotate: calc(9deg * ${TRAVEL}); }
    60% { rotate: calc(-5deg * ${TRAVEL}); }
    75% { rotate: calc(2deg * ${TRAVEL}); }
  }

  /* shake: no — a wrong code, a failed action */
  [data-hj-anim='shake'] { animation: hj-icon-shake 480ms ${OUT} both; }
  @keyframes hj-icon-shake {
    20% { translate: calc(-2.2px * ${TRAVEL}) 0; }
    40% { translate: calc(2px * ${TRAVEL}) 0; }
    60% { translate: calc(-1.2px * ${TRAVEL}) 0; }
    80% { translate: calc(0.6px * ${TRAVEL}) 0; }
  }

  /* spin: working — refresh, sync, load */
  [data-hj-anim='spin'] { animation: hj-icon-spin 900ms linear infinite; }
  @keyframes hj-icon-spin { to { rotate: 1turn; } }

  /* the fill toggle: ink floods the shape on a spring, and drains quickly */
  [data-hj-fill] > [data-layer] {
    transition:
      opacity ${FAST} ${OUT},
      transform ${SPRING_DUR} ${SPRING};
  }
  [data-hj-fill='off'] > [data-layer='solid'] {
    opacity: 0;
    transform: scale(calc(1 - 0.55 * ${TRAVEL}));
    transition-duration: ${FAST}, ${FAST};
  }
  [data-hj-fill='on'] > [data-layer='line'] { opacity: 0; }

  @keyframes hj-icon-fade { from { opacity: 0; } }
  @keyframes hj-icon-pulse { from { opacity: 1; } to { opacity: 0.35; } }

  @media (prefers-reduced-motion: reduce) {
    :root:not([data-hj-motion='full']) { ${reduced} }
  }
  [data-hj-motion='reduced'] { ${reduced} }
}
`;
