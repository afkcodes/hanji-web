'use client';
import { Progress as Base } from '@base-ui/react/progress';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';
import { fraction, withVars } from '../progress/progress-math.ts';

/** Names the task. Usually visually hidden inside a ring; add `className="hj-sr-only"`. */
export const Label: HanjiPart<typeof Base.Label> = part(
  Base.Label,
  'ProgressRing.Label',
  'hj-progress-ring-label',
);

const SIZES = { sm: 24, md: 40, lg: 96 } as const;
const STROKES = { sm: 3, md: 4, lg: 6 } as const;

export interface RootOwnProps {
  /** sm 24 · md 40 (hanji) · lg 96 for a summary with the value inside, or a number in px. */
  size?: 'sm' | 'md' | 'lg' | number;
  /** Stroke in px. Defaults 3 / 4 / 6 by size. */
  thickness?: number;
  tone?: 'accent' | 'fg' | 'danger';
}
export interface RootProps extends RootOwnProps, Base.Root.Props {}

/**
 * Progress drawn as a ring, for tight spaces and summaries. `value={null}` turns a quarter arc.
 * Children sit in the centre; a `lg` ring with no children shows its Value.
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    size = 'md',
    thickness,
    tone = 'accent',
    className,
    style,
    children,
    ...rest
  } = withDefaults(config, 'ProgressRing.Root', props);
  const px = typeof size === 'number' ? size : SIZES[size];
  const stroke =
    thickness ?? (typeof size === 'number' ? Math.max(2, Math.round(px / 10)) : STROKES[size]);
  // viewBox 0–100: stroke and radius in those units, so the drawing scales crisply.
  const sw = (stroke / px) * 100;
  const r = 50 - sw / 2;
  const f = fraction(rest.value, rest.min, rest.max);
  const styled = !config.unstyled;
  const center = children ?? (size === 'lg' ? <Value /> : null);
  return (
    <Base.Root
      {...rest}
      data-tone={tone}
      data-size={typeof size === 'number' ? 'custom' : size}
      data-empty={flag(f === 0)}
      style={withVars(style, {
        '--hj-progress-ring-size': `${px}px`,
        ...(f === null ? {} : { '--hj-progress-ring-fraction': f }),
      })}
      className={cls(config, 'ProgressRing.Root', 'hj-progress-ring', className)}
    >
      <svg
        className={styled ? 'hj-progress-ring-svg' : undefined}
        viewBox="0 0 100 100"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className={styled ? 'hj-progress-ring-track' : undefined}
          cx="50"
          cy="50"
          r={r}
          strokeWidth={sw}
        />
        <circle
          className={styled ? 'hj-progress-ring-arc' : undefined}
          cx="50"
          cy="50"
          r={r}
          strokeWidth={sw}
          pathLength={100}
        />
      </svg>
      {center !== null ? (
        <span className={styled ? 'hj-progress-ring-center' : undefined}>{center}</span>
      ) : null}
    </Base.Root>
  );
}

const splitPercent = (formatted: string | null): React.ReactNode => {
  if (formatted === null) return null;
  const m = /^(.*?)(\s?%)$/.exec(formatted);
  return m ? (
    <>
      {m[1]}
      <small>{m[2]}</small>
    </>
  ) : (
    formatted
  );
};

/** The value in tabular figures with a shrunk unit. Pass a function child for your own words. */
export function Value(props: Base.Value.Props): React.ReactElement {
  const config = useHanjiConfig();
  const { className, children, ...rest } = withDefaults(config, 'ProgressRing.Value', props);
  return (
    <Base.Value
      {...rest}
      className={cls(config, 'ProgressRing.Value', 'hj-progress-ring-value', className)}
    >
      {children ?? splitPercent}
    </Base.Value>
  );
}
