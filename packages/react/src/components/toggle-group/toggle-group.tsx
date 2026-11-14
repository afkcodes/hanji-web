'use client';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, withDefaults } from '../../system/slot.ts';
import { ToggleGroupContext } from '../toggle/toggle.tsx';

export interface ToggleGroupOwnProps {
  /** md = 40, sm = 32. The toggles inside take this size. */
  size?: 'sm' | 'md';
}
export interface ToggleGroupProps extends ToggleGroupOwnProps, BaseToggleGroup.Props {}

/**
 * A row of Toggles in one frame — formatting bars, player toolbars. `multiple` lets several be
 * pressed at once (Bold + Italic); without it, pressing one releases the others and pressing
 * the pressed one releases it (use SegmentedControl when one must always be chosen).
 */
export function ToggleGroup(props: ToggleGroupProps): React.ReactElement {
  const config = useHanjiConfig();
  const { size = 'md', className, ...rest } = withDefaults(config, 'ToggleGroup', props);
  return (
    <ToggleGroupContext.Provider value={size}>
      <BaseToggleGroup
        {...rest}
        data-size={size}
        className={cls(config, 'ToggleGroup', 'hj-toggle-group', className)}
      />
    </ToggleGroupContext.Provider>
  );
}
