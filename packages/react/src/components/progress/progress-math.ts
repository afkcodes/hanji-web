import type * as React from 'react';

/** Fraction of the way from min to max, clamped to 0–1. `null` (indeterminate) stays null. */
export function fraction(value: number | null | undefined, min = 0, max = 100): number | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const span = max - min;
  if (span <= 0) return 1;
  const f = (value - min) / span;
  return f < 0 ? 0 : f > 1 ? 1 : f;
}

/** Base UI's style prop: an object or a function of state. */
export type StyleProp<State> =
  | React.CSSProperties
  | ((state: State) => React.CSSProperties | undefined)
  | undefined;

/**
 * Merge declarations (CSS custom properties or overrides) under a Base UI style prop, keeping
 * its function form. The caller's own declarations win.
 */
export function withVars<State>(
  style: StyleProp<State>,
  vars: React.CSSProperties | Record<`--${string}`, string | number> | undefined,
): StyleProp<State> {
  if (!vars) return style;
  if (typeof style === 'function') {
    return (state: State): React.CSSProperties => ({
      ...(vars as React.CSSProperties),
      ...style(state),
    });
  }
  return { ...(vars as React.CSSProperties), ...style };
}
