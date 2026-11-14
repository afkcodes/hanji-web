'use client';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

/** Provided by ToggleGroup: its size. Toggles inside take it and sit flush (null = not grouped). */
export type ToggleGroupContextValue = 'sm' | 'md' | null;
export const ToggleGroupContext: React.Context<ToggleGroupContextValue> =
  React.createContext<ToggleGroupContextValue>(null);

export interface ToggleOwnProps {
  /** md = 40, sm = 32. Inside a ToggleGroup it takes the group's size. */
  size?: 'sm' | 'md';
  /** quiet = no fill until pressed; outline = surface with a hairline. Ignored inside a group. */
  variant?: 'quiet' | 'outline';
  /** Square, for a lone icon. Give it an aria-label. */
  iconOnly?: boolean;
}
export interface ToggleProps extends ToggleOwnProps, BaseToggle.Props {}

/**
 * A button that stays pressed: Bold, Shuffle, Mute. Pressed is accent-soft with an accent glyph.
 * Not for settings (use Switch) or for one-of-many (use SegmentedControl).
 */
export function Toggle(props: ToggleProps): React.ReactElement {
  const config = useHanjiConfig();
  const group = React.useContext(ToggleGroupContext);
  const {
    size,
    variant = 'quiet',
    iconOnly = false,
    className,
    ...rest
  } = withDefaults(config, 'Toggle', props);
  return (
    <BaseToggle
      {...rest}
      data-size={size ?? group ?? 'md'}
      data-variant={group ? 'grouped' : variant}
      data-icon-only={flag(iconOnly)}
      className={cls(config, 'Toggle', 'hj-toggle', className)}
    />
  );
}
