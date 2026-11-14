'use client';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseGroup } from '@base-ui/react/radio-group';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

const STAR = 'm12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z';

function Star({ className }: { className: string | undefined }): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d={STAR} />
    </svg>
  );
}

const defaultLabel = (n: number): string => `${n} star${n === 1 ? '' : 's'}`;

/** Stagger index per star, built once (the count stops at ten, like every hanji stagger). */
const STAGGER: readonly React.CSSProperties[] = Array.from({ length: 10 }, (_, i) => ({
  ['--hj-i' as string]: i,
}));
const staggerFor = (i: number): React.CSSProperties | undefined =>
  STAGGER[Math.min(i, STAGGER.length - 1)];

export interface RootOwnProps {
  /** Number of stars. @default 5 */
  max?: number;
  /** Star size: sm 20, md 28, lg 36. */
  size?: 'sm' | 'md' | 'lg';
  /** Accessible name for each star. Default “1 star”, “2 stars”… */
  getLabel?: (value: number) => string;
}
export interface RootProps
  extends
    RootOwnProps,
    Omit<
      React.ComponentProps<typeof BaseGroup>,
      'value' | 'defaultValue' | 'onValueChange' | 'children'
    > {
  /** The chosen rating, 1…max, or null for none. */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number) => void;
}

/**
 * Choose 1 to 5 stars. A radio group underneath: arrows move, the chosen star pops on bouncy and
 * the stars up to it fill one after another. Hovering previews without committing.
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    max = 5,
    size = 'md',
    getLabel = defaultLabel,
    value,
    defaultValue = null,
    onValueChange,
    className,
    ...rest
  } = withDefaults(config, 'Rating.Root', props);
  const [inner, setInner] = React.useState<number | null>(defaultValue);
  const [hover, setHover] = React.useState<number | null>(null);
  const current = value === undefined ? inner : value;
  const shown = hover ?? current ?? 0;
  const styled = !config.unstyled;

  const handleChange = (v: unknown): void => {
    const n = Number(v);
    setInner(n);
    onValueChange?.(n);
  };

  return (
    <BaseGroup
      {...rest}
      value={current}
      onValueChange={handleChange}
      data-size={size}
      data-preview={flag(hover !== null)}
      onPointerLeave={() => setHover(null)}
      className={cls(config, 'Rating.Root', 'hj-rating', className)}
    >
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        return (
          <BaseRadio.Root
            key={n}
            value={n}
            aria-label={getLabel(n)}
            data-lit={flag(n <= shown)}
            style={staggerFor(i)}
            onPointerEnter={() => setHover(n)}
            className={styled ? 'hj-rating-star' : undefined}
          >
            <Star className={styled ? 'hj-rating-glyph' : undefined} />
          </BaseRadio.Root>
        );
      })}
    </BaseGroup>
  );
}

export interface DisplayOwnProps {
  /** The average, e.g. 4.6. Partial stars fill to the fraction. */
  value: number;
  /** @default 5 */
  max?: number;
  /** How many ratings it averages; shown as “2,184 ratings”. */
  count?: number;
  /** Star size: sm 14, md 18. */
  size?: 'sm' | 'md';
  /** Print the number and count after the stars. @default true */
  showValue?: boolean;
  locale?: Intl.LocalesArgument;
}
export interface DisplayProps
  extends DisplayOwnProps, Omit<React.ComponentProps<'span'>, 'children'> {}

/** Geometry of the Display strip: 24-unit stars, 2 apart. */
const UNIT = 24;
const GAP = 2;

/** A read-only average: partial stars plus “4.6 · 2,184 ratings”, read as one sentence. */
export function Display(props: DisplayProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    value,
    max = 5,
    count,
    size = 'sm',
    showValue = true,
    locale,
    className,
    ...rest
  } = withDefaults(config, 'Rating.Display', props);
  const id = React.useId();
  const styled = !config.unstyled;
  const fixed = value.toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const counted = count === undefined ? '' : count.toLocaleString(locale);
  const sentence = config.strings.ratedOutOf(fixed, max, count === undefined ? undefined : counted);
  // A hard stop at the exact average, mapped through the gaps between stars.
  const clamped = Math.max(0, Math.min(max, value));
  const whole = Math.floor(clamped);
  const width = max * UNIT + (max - 1) * GAP;
  const stop = `${(((whole * (UNIT + GAP) + (clamped - whole) * UNIT) / width) * 100).toFixed(2)}%`;
  return (
    <span
      {...rest}
      data-size={size}
      className={
        cls(config, 'Rating.Display', 'hj-rating-display', className) as string | undefined
      }
    >
      <span className="hj-sr-only">{sentence}</span>
      <svg
        viewBox={`0 0 ${width} ${UNIT}`}
        className={styled ? 'hj-rating-display-stars' : undefined}
        data-max={max}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
            <stop offset={stop} className={styled ? 'hj-rating-display-on' : undefined} />
            <stop offset={stop} className={styled ? 'hj-rating-display-off' : undefined} />
          </linearGradient>
        </defs>
        <g fill={`url(#${id})`} stroke={`url(#${id})`} strokeWidth="1" strokeLinejoin="round">
          {Array.from({ length: max }, (_, i) => (
            <path key={i} d={STAR} transform={`translate(${i * (UNIT + GAP)} 0)`} />
          ))}
        </g>
      </svg>
      {showValue ? (
        <span className={styled ? 'hj-rating-display-text' : undefined} aria-hidden="true">
          <b>{fixed}</b>
          {count === undefined ? null : ` · ${counted} ratings`}
        </span>
      ) : null}
    </span>
  );
}
