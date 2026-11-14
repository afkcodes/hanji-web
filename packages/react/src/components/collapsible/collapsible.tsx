'use client';
import { Collapsible as Base } from '@base-ui/react/collapsible';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

export const Root: HanjiPart<typeof Base.Root> = part(
  Base.Root,
  'Collapsible.Root',
  'hj-collapsible-root',
);
export const Panel: HanjiPart<typeof Base.Panel> = part(
  Base.Panel,
  'Collapsible.Panel',
  'hj-collapsible-panel',
);

export interface TriggerOwnProps {
  /** Draw a trailing chevron that turns 180° when open. @default true */
  chevron?: boolean;
}
export interface TriggerProps extends TriggerOwnProps, Base.Trigger.Props {}

/** Shows or hides the panel. A quiet text button with a chevron unless you render your own. */
export function Trigger(props: TriggerProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    chevron = true,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Collapsible.Trigger', props);
  return (
    <Base.Trigger
      {...rest}
      data-chevron={flag(chevron)}
      className={cls(config, 'Collapsible.Trigger', 'hj-collapsible-trigger', className)}
    >
      {children}
      {chevron ? (
        <span className={config.unstyled ? undefined : 'hj-collapsible-chevron'} aria-hidden="true">
          {config.icons.chevronDown}
        </span>
      ) : null}
    </Base.Trigger>
  );
}
