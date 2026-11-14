'use client';
import { Accordion as Base } from '@base-ui/react/accordion';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

export const Item: HanjiPart<typeof Base.Item> = part(
  Base.Item,
  'Accordion.Item',
  'hj-accordion-item',
);
export const Header: HanjiPart<typeof Base.Header> = part(
  Base.Header,
  'Accordion.Header',
  'hj-accordion-header',
);
export const Panel: HanjiPart<typeof Base.Panel> = part(
  Base.Panel,
  'Accordion.Panel',
  'hj-accordion-panel',
);

export interface RootOwnProps {
  /** lined = hairlines between items (hanji) · plain = no rules, for nesting inside a surface. */
  variant?: 'lined' | 'plain';
}
export interface RootProps extends RootOwnProps, Base.Root.Props {}

/** Owns which items are open (value / defaultValue / onValueChange, multiple). */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const { variant = 'lined', className, ...rest } = withDefaults(config, 'Accordion.Root', props);
  return (
    <Base.Root
      {...rest}
      data-variant={variant}
      className={cls(config, 'Accordion.Root', 'hj-accordion-root', className)}
    />
  );
}

export interface TriggerOwnProps {
  /** Draw the chevron that turns 180° when open. @default true */
  chevron?: boolean;
}
export interface TriggerProps extends TriggerOwnProps, Base.Trigger.Props {}

/** The row that opens and closes its item. Put it inside `Accordion.Header`. */
export function Trigger(props: TriggerProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    chevron = true,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Accordion.Trigger', props);
  const styled = !config.unstyled;
  return (
    <Base.Trigger
      {...rest}
      data-chevron={flag(chevron)}
      className={cls(config, 'Accordion.Trigger', 'hj-accordion-trigger', className)}
    >
      <span className={styled ? 'hj-accordion-label' : undefined}>{children}</span>
      {chevron ? (
        <span className={styled ? 'hj-accordion-chevron' : undefined} aria-hidden="true">
          {config.icons.chevronDown}
        </span>
      ) : null}
    </Base.Trigger>
  );
}
