'use client';
import { Progress as Base } from '@base-ui/react/progress';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';
import { fraction, withVars } from './progress-math.ts';

export const Label: HanjiPart<typeof Base.Label> = part(
  Base.Label,
  'Progress.Label',
  'hj-progress-label',
);
export const Value: HanjiPart<typeof Base.Value> = part(
  Base.Value,
  'Progress.Value',
  'hj-progress-value',
);
export const Track: HanjiPart<typeof Base.Track> = part(
  Base.Track,
  'Progress.Track',
  'hj-progress-track',
);
/** Label on the left, value on the right, above the track. */
export const Header: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Progress.Header',
  'hj-progress-header',
);

export interface RootOwnProps {
  /** accent = the task in hand · fg = neutral totals · danger = something is running out. */
  tone?: 'accent' | 'fg' | 'danger';
}
export interface RootProps extends RootOwnProps, Base.Root.Props {}

/**
 * A task's completion. `value={null}` is indeterminate. With no children it renders a bare
 * track and indicator, so `<Progress.Root value={40} aria-label="Upload" />` is complete.
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    tone = 'accent',
    className,
    style,
    children,
    ...rest
  } = withDefaults(config, 'Progress.Root', props);
  const f = fraction(rest.value, rest.min, rest.max);
  return (
    <Base.Root
      {...rest}
      data-tone={tone}
      style={withVars(style, f === null ? undefined : { '--hj-progress-fraction': f })}
      className={cls(config, 'Progress.Root', 'hj-progress', className)}
    >
      {children ?? (
        <Track>
          <Indicator />
        </Track>
      )}
    </Base.Root>
  );
}

/**
 * The fill. Drawn at full width and scaled from the left (transform only — a width
 * animation drops frames), so it rides the clamped snappy spring between values.
 */
export function Indicator(props: Base.Indicator.Props): React.ReactElement {
  const config = useHanjiConfig();
  const { className, style, ...rest } = withDefaults(config, 'Progress.Indicator', props);
  return (
    <Base.Indicator
      {...rest}
      style={withVars(style, FULL_WIDTH)}
      className={cls(config, 'Progress.Indicator', 'hj-progress-indicator', className)}
    />
  );
}

/** Overrides Base UI's inline width: the fill is a full-width element scaled by --hj-progress-fraction. */
const FULL_WIDTH: React.CSSProperties = { width: '100%' };
