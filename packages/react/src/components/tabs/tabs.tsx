'use client';
import { Tabs as Base } from '@base-ui/react/tabs';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

export const Root: HanjiPart<typeof Base.Root> = part(Base.Root, 'Tabs.Root', 'hj-tabs-root');
export const Tab: HanjiPart<typeof Base.Tab> = part(Base.Tab, 'Tabs.Tab', 'hj-tabs-tab');
export const Indicator: HanjiPart<typeof Base.Indicator> = part(
  Base.Indicator,
  'Tabs.Indicator',
  'hj-tabs-indicator',
);
export const Panel: HanjiPart<typeof Base.Panel> = part(Base.Panel, 'Tabs.Panel', 'hj-tabs-panel');

export interface ListOwnProps {
  /** underline = a 2px accent rule under the active tab · pill = an accent-soft pill in a track. */
  variant?: 'underline' | 'pill';
  /** Tab height: sm 36 · md 44 (underline) / 40 track (pill). */
  size?: 'sm' | 'md';
  /** Render the moving indicator after the tabs. Turn off to place your own `Tabs.Indicator`. */
  indicator?: boolean;
  /** Stretch tabs to share the list's width equally. */
  fill?: boolean;
}
export interface ListProps extends ListOwnProps, Base.List.Props {}

/**
 * The row of tabs. Draws the indicator, which follows the active tab by clipping (never by
 * animating width or left), and starts moving only after the first measured frame so it
 * doesn't sweep in on page load.
 */
export function List(props: ListProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    variant = 'underline',
    size = 'md',
    indicator = true,
    fill = false,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Tabs.List', props);
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    // The first measured position is assigned, not animated (hanji segmented-track rule).
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <Base.List
      {...rest}
      data-variant={variant}
      data-size={size}
      data-fill={flag(fill)}
      data-ready={flag(ready)}
      className={cls(config, 'Tabs.List', 'hj-tabs-list', className)}
    >
      {children}
      {indicator ? <Indicator /> : null}
    </Base.List>
  );
}
