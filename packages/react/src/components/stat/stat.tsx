'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

/** The eyebrow above the number: what is being counted. */
export const Label: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Stat.Label',
  'hj-stat-label',
);
/** The number, in tabular figures. Put a Unit inside it. */
export const Value: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Stat.Value',
  'hj-stat-value',
);
/** The unit, shrunk and muted so the digits carry the weight: `2 h 47<Unit> min</Unit>`. */
export const Unit: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'Stat.Unit',
  'hj-stat-unit',
);
/** A quiet line of context under the number. */
export const Description: (props: ElementPartProps<'p'>) => React.ReactElement = elementPart(
  'p',
  'Stat.Description',
  'hj-stat-description',
);

export interface RootOwnProps {
  /** md = 28px number (a tile) · lg = hero 44px (the one number on a screen). */
  size?: 'md' | 'lg';
}
export type RootProps = RootOwnProps & ElementPartProps<'div'>;

/** A number that matters, with what it is and how it compares. */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const { size = 'md', render, className, ...rest } = withDefaults(config, 'Stat.Root', props);
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...rest,
      'data-size': size,
      className: cls(config, 'Stat.Root', 'hj-stat', className) as string | undefined,
    },
  });
}

export interface DeltaOwnProps {
  /** Which way the number moved. */
  trend?: 'up' | 'down' | 'flat';
  /**
   * Whether that is good. Defaults: up = positive, down = negative, flat = neutral — set it when
   * down is good (spending, errors, load time).
   */
  sentiment?: 'positive' | 'negative' | 'neutral';
}
export type DeltaProps = DeltaOwnProps & ElementPartProps<'span'>;

const DEFAULT_SENTIMENT = { up: 'positive', down: 'negative', flat: 'neutral' } as const;

/**
 * The comparison, in words with a glyph — never colour alone: `+12% vs last week`.
 * The glyph is decorative; the words carry the meaning.
 */
export function Delta(props: DeltaProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    trend = 'flat',
    sentiment,
    render,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Stat.Delta', props);
  const glyph = trend === 'flat' ? config.icons.minus : config.icons.arrowUp;
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      ...rest,
      'data-trend': trend,
      'data-sentiment': sentiment ?? DEFAULT_SENTIMENT[trend],
      className: cls(config, 'Stat.Delta', 'hj-stat-delta', className) as string | undefined,
      children: (
        <>
          <span className={config.unstyled ? undefined : 'hj-stat-delta-glyph'} aria-hidden="true">
            {glyph}
          </span>
          {children}
        </>
      ),
    },
  });
}

export interface SparklineOwnProps {
  /** The series, oldest first. Two or more points. */
  data: readonly number[];
  /** Drawing width in px. @default 96 */
  width?: number;
  /** Drawing height in px. @default 24 */
  height?: number;
  /** Line colour. @default 'accent' */
  tone?: 'accent' | 'fg' | 'success' | 'danger';
  /** Accessible summary ("Rising over 7 days"). Omit to keep it decorative. */
  label?: string;
}
export type SparklineProps = SparklineOwnProps &
  Omit<React.ComponentProps<'svg'>, 'className' | 'width' | 'height'> & { className?: string };

/** A 24px line of the recent past: no axes, the last point marked. */
export function Sparkline(props: SparklineProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    data,
    width = 96,
    height = 24,
    tone = 'accent',
    label,
    className,
    ...rest
  } = withDefaults(config, 'Stat.Sparkline', props);
  // Cheap enough to recompute: a handful of points (and the React Compiler can memoise it).
  const { line, area, last } = sparkPath(data, width, height);
  const styled = !config.unstyled;
  return (
    <svg
      {...rest}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-tone={tone}
      className={
        cls(config, 'Stat.Sparkline', 'hj-stat-sparkline', className) as string | undefined
      }
    >
      <path className={styled ? 'hj-stat-sparkline-area' : undefined} d={area} />
      <path className={styled ? 'hj-stat-sparkline-line' : undefined} d={line} />
      {last ? (
        <circle
          className={styled ? 'hj-stat-sparkline-dot' : undefined}
          cx={last[0]}
          cy={last[1]}
          r={2.25}
        />
      ) : null}
    </svg>
  );
}

/** Normalise a series into the box, with 3px of headroom so the dot and stroke never clip. */
export function sparkPath(
  data: readonly number[],
  width: number,
  height: number,
): { line: string; area: string; last: readonly [number, number] | null } {
  if (data.length < 2) return { line: '', area: '', last: null };
  const pad = 3;
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of data) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  const span = hi - lo || 1;
  const step = (width - pad * 2) / (data.length - 1);
  const pts = data.map(
    (v, i) => [pad + i * step, height - pad - ((v - lo) / span) * (height - pad * 2)] as const,
  );
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  const first = pts[0] as readonly [number, number];
  const lastPt = pts[pts.length - 1] as readonly [number, number];
  const area = `${line} L${lastPt[0].toFixed(2)} ${height} L${first[0].toFixed(2)} ${height} Z`;
  return { line, area, last: lastPt };
}
