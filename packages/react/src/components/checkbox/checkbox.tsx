'use client';
import { Checkbox as Base } from '@base-ui/react/checkbox';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

/** The tick and the dash, drawn on a 22-grid so they can draw themselves (pathLength = 1). */
function Marks(): React.ReactElement {
  return (
    <svg
      viewBox="0 0 22 22"
      width="100%"
      height="100%"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path data-mark="check" d="M6 11.4 9.4 14.8 16 8" pathLength={1} />
      <path data-mark="dash" d="M6.5 11h9" pathLength={1} />
    </svg>
  );
}

export interface IndicatorProps extends Base.Indicator.Props {}

/**
 * The tick. Kept mounted so it can draw itself in and out; renders hanji's tick and dash when
 * given no children (pass your own icon to replace them).
 */
export function Indicator(props: IndicatorProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    className,
    children,
    keepMounted = true,
    ...rest
  } = withDefaults(config, 'Checkbox.Indicator', props);
  return (
    <Base.Indicator
      {...rest}
      keepMounted={keepMounted}
      className={cls(config, 'Checkbox.Indicator', 'hj-checkbox-indicator', className)}
    >
      {children ?? <Marks />}
    </Base.Indicator>
  );
}

export interface RootOwnProps {
  /** md = 22 (hanji), sm = 18. */
  size?: 'sm' | 'md';
}
export interface RootProps extends RootOwnProps, Base.Root.Props {}

/**
 * A box you tick for a choice that waits for a Save. Renders its Indicator when given no
 * children, so `<Checkbox.Root />` is complete. Label it by wrapping in a `<label>` or a Field.
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    size = 'md',
    className,
    children,
    ...rest
  } = withDefaults(config, 'Checkbox.Root', props);
  return (
    <Base.Root
      {...rest}
      data-size={size}
      className={cls(config, 'Checkbox.Root', 'hj-checkbox', className)}
    >
      {children ?? <Indicator />}
    </Base.Root>
  );
}
