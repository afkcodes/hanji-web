'use client';
import { Switch as Base } from '@base-ui/react/switch';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

export const Thumb: HanjiPart<typeof Base.Thumb> = part(
  Base.Thumb,
  'Switch.Thumb',
  'hj-switch-thumb',
);

export interface RootOwnProps {
  /** md = 46×28 (hanji), sm = 38×24. */
  size?: 'sm' | 'md';
}
export interface RootProps extends RootOwnProps, Base.Root.Props {}

/**
 * An on/off setting that applies immediately. Renders its Thumb when given no children, so
 * `<Switch.Root />` is a complete switch.
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const { size = 'md', className, children, ...rest } = withDefaults(config, 'Switch.Root', props);
  return (
    <Base.Root
      {...rest}
      data-size={size}
      className={cls(config, 'Switch.Root', 'hj-switch', className)}
    >
      {children ?? <Thumb />}
    </Base.Root>
  );
}
