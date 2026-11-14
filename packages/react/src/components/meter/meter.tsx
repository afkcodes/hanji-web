'use client';
import { Meter as Base } from '@base-ui/react/meter';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';
import { fraction, withVars } from '../progress/progress-math.ts';

export const Label: HanjiPart<typeof Base.Label> = part(
  Base.Label,
  'Meter.Label',
  'hj-meter-label',
);
export const Value: HanjiPart<typeof Base.Value> = part(
  Base.Value,
  'Meter.Value',
  'hj-meter-value',
);
export const Track: HanjiPart<typeof Base.Track> = part(
  Base.Track,
  'Meter.Track',
  'hj-meter-track',
);
/** Label on the left, value on the right. */
export const Header: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Meter.Header',
  'hj-meter-header',
);

/** How good the value is, by the rules of HTML's <meter>. */
export type MeterZone = 'optimum' | 'suboptimum' | 'critical';

/**
 * HTML <meter> semantics: `low` and `high` split the range into three regions and `optimum`
 * says which region is best. Values in the best region are optimum, the neighbouring region
 * suboptimum, the far region critical.
 */
export function meterZone(
  value: number,
  {
    min = 0,
    max = 100,
    low,
    high,
    optimum,
  }: { min?: number; max?: number; low?: number; high?: number; optimum?: number },
): MeterZone {
  const lo = Math.max(min, Math.min(low ?? min, max));
  const hi = Math.min(max, Math.max(high ?? max, lo));
  const opt = optimum ?? (min + max) / 2;
  const region = (v: number): 0 | 1 | 2 => (v < lo ? 0 : v > hi ? 2 : 1);
  const best = region(opt);
  const at = region(value);
  if (at === best) return 'optimum';
  if (best === 1) return 'suboptimum';
  return Math.abs(at - best) === 1 ? 'suboptimum' : 'critical';
}

export interface RootOwnProps {
  /** Upper bound of the low region (HTML meter). */
  low?: number;
  /** Lower bound of the high region (HTML meter). */
  high?: number;
  /** The best value; decides which region is good. */
  optimum?: number;
  /** Draw the track as N segments with 3px gaps. */
  segments?: number;
  /**
   * auto = success / warning / danger by zone when low, high or optimum is set, else accent ·
   * accent · fg.
   */
  tone?: 'auto' | 'accent' | 'fg';
}
export interface RootProps extends RootOwnProps, Base.Root.Props {}

/**
 * A measurement within a known range — storage, battery, signal, a password's strength. Not a
 * task (that is Progress). With no children it renders a bare track.
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    low,
    high,
    optimum,
    segments,
    tone = 'auto',
    className,
    style,
    children,
    ...rest
  } = withDefaults(config, 'Meter.Root', props);
  const f = fraction(rest.value, rest.min, rest.max) ?? 0;
  const graded =
    tone === 'auto' && (low !== undefined || high !== undefined || optimum !== undefined);
  const zone = graded
    ? meterZone(rest.value, { min: rest.min, max: rest.max, low, high, optimum })
    : undefined;
  const vars: Record<`--${string}`, string | number> = { '--hj-meter-fraction': f };
  if (segments && segments > 1) vars['--hj-meter-segments'] = segments;
  return (
    <Base.Root
      {...rest}
      data-tone={graded ? 'zone' : tone === 'auto' ? 'accent' : tone}
      data-zone={zone}
      data-segmented={segments && segments > 1 ? '' : undefined}
      style={withVars(style, vars)}
      className={cls(config, 'Meter.Root', 'hj-meter', className)}
    >
      {children ?? (
        <Track>
          <Indicator />
        </Track>
      )}
    </Base.Root>
  );
}

const FULL_WIDTH: React.CSSProperties = { width: '100%' };

/** The fill: full width, scaled by --hj-meter-fraction (transform only). */
export function Indicator(props: Base.Indicator.Props): React.ReactElement {
  const config = useHanjiConfig();
  const { className, style, ...rest } = withDefaults(config, 'Meter.Indicator', props);
  return (
    <Base.Indicator
      {...rest}
      style={withVars(style, FULL_WIDTH)}
      className={cls(config, 'Meter.Indicator', 'hj-meter-indicator', className)}
    />
  );
}
