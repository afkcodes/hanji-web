'use client';
import { Slider as Base } from '@base-ui/react/slider';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

export const Label: HanjiPart<typeof Base.Label> = part(
  Base.Label,
  'Slider.Label',
  'hj-slider-label',
);
export const Value: HanjiPart<typeof Base.Value> = part(
  Base.Value,
  'Slider.Value',
  'hj-slider-value',
);
export const Control: HanjiPart<typeof Base.Control> = part(
  Base.Control,
  'Slider.Control',
  'hj-slider-control',
);
export const Track: HanjiPart<typeof Base.Track> = part(
  Base.Track,
  'Slider.Track',
  'hj-slider-track',
);
export const Indicator: HanjiPart<typeof Base.Indicator> = part(
  Base.Indicator,
  'Slider.Indicator',
  'hj-slider-indicator',
);

/** Base UI's render-function form for the thumb. */
type ThumbRender = Extract<NonNullable<Base.Thumb.Props['render']>, (...args: never[]) => unknown>;

export interface ThumbOwnProps {
  /** Show the value above the thumb while it is dragged or keyboard-focused. @default true */
  bubble?: boolean;
  /** Text for the bubble. Defaults to the number in the runtime locale. */
  formatValue?: (value: number) => string;
}
export interface ThumbProps extends ThumbOwnProps, Base.Thumb.Props {}

/**
 * The 12px thumb, grown to ×1.6 while it is the one being dragged. Its 24px box is the hit
 * area; the value bubble rides above it. (Pass `render` yourself and the bubble is skipped.)
 */
export function Thumb(props: ThumbProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    bubble = true,
    formatValue,
    className,
    render,
    index,
    ...rest
  } = withDefaults(config, 'Slider.Thumb', props);
  const styled = !config.unstyled;
  const renderBubble: ThumbRender = (p, state) => {
    const v = state.values[index ?? 0] ?? state.values[0] ?? 0;
    return (
      <div {...p}>
        {p.children}
        <span className={styled ? 'hj-slider-bubble' : undefined} aria-hidden="true">
          {formatValue ? formatValue(v) : v.toLocaleString()}
        </span>
      </div>
    );
  };
  return (
    <Base.Thumb
      {...rest}
      index={index}
      render={render ?? (bubble ? renderBubble : undefined)}
      className={cls(config, 'Slider.Thumb', 'hj-slider-thumb', className)}
    />
  );
}

export interface MarksOwnProps {
  /** Positions to tick, in the slider's units. */
  values: readonly number[];
  /** Same min/max as the Root. @default 0 / 100 */
  min?: number;
  max?: number;
  /** Optional labels under the ticks (same length as values). */
  labels?: readonly React.ReactNode[];
}
export interface MarksProps extends MarksOwnProps, Omit<React.ComponentProps<'div'>, 'children'> {}

/** Static ticks (and labels) along the track — snap points, defaults, a "recommended" value. */
export function Marks(props: MarksProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    values,
    min = 0,
    max = 100,
    labels,
    className,
    ...rest
  } = withDefaults(config, 'Slider.Marks', props);
  const styled = !config.unstyled;
  const span = max - min || 1;
  // SVG takes percentages as attributes: no per-render style objects.
  return (
    <div
      {...rest}
      aria-hidden="true"
      className={cls(config, 'Slider.Marks', 'hj-slider-marks', className) as string | undefined}
    >
      <svg
        width="100%"
        height="100%"
        className={styled ? 'hj-slider-marks-svg' : undefined}
        focusable="false"
      >
        {values.map((v, i) => {
          const x = `${((v - min) / span) * 100}%`;
          return (
            <g key={v}>
              <line x1={x} x2={x} y1="0" y2="6" className={styled ? 'hj-slider-mark' : undefined} />
              {labels?.[i] !== undefined ? (
                <text
                  x={x}
                  y="20"
                  textAnchor="middle"
                  className={styled ? 'hj-slider-mark-label' : undefined}
                >
                  {labels[i]}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export interface RootOwnProps {
  /** md: 44px hit row, 4px track (hanji). */
  size?: 'md';
  /**
   * The value lives elsewhere (a speaker, a server) and hasn't agreed yet: the thumb draws hollow
   * and the fill dims until you clear it. hanji's pending-hold.
   */
  pending?: boolean;
}
export interface RootProps extends RootOwnProps, Base.Root.Props {}

/**
 * A value on a continuous scale where the feel matters more than the exact number. Tap to jump,
 * drag to fine-tune, arrows to nudge. Childless, it renders Control › Track › Indicator + Thumb(s)
 * for each value in `value`/`defaultValue`.
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    size = 'md',
    pending = false,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Slider.Root', props);
  const initial = rest.value ?? rest.defaultValue;
  const count = Array.isArray(initial) ? initial.length : 1;
  return (
    <Base.Root
      {...rest}
      data-size={size}
      data-pending={flag(pending)}
      aria-busy={pending || undefined}
      className={cls(config, 'Slider.Root', 'hj-slider', className)}
    >
      {children ?? (
        <Control>
          <Track>
            <Indicator />
            {Array.from({ length: count }, (_, i) => (
              <Thumb key={i} index={count > 1 ? i : undefined} />
            ))}
          </Track>
        </Control>
      )}
    </Base.Root>
  );
}
