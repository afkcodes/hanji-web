'use client';
import { ContextMenu as Base } from '@base-ui/react/context-menu';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { withDefaults } from '../../system/slot.ts';
import { Popup, Portal } from '../menu/menu.tsx';
import type { ContentProps as MenuContentProps } from '../menu/menu.tsx';

/*
 * A context menu is a Menu opened by right-click or long-press. Every row part is Menu's own,
 * re-exported here, so a context menu looks and behaves exactly like the menus beside it.
 */
export {
  Arrow,
  Backdrop,
  CheckboxItem,
  CheckboxItemIndicator,
  Group,
  GroupLabel,
  Item,
  LinkItem,
  Popup,
  Portal,
  RadioGroup,
  RadioItem,
  RadioItemIndicator,
  Separator,
  Shortcut,
  SubmenuRoot,
  SubmenuTrigger,
} from '../menu/menu.tsx';

export const Root: typeof Base.Root = Base.Root;
/** The area that opens the menu on right-click or long-press. */
export const Trigger: HanjiPart<typeof Base.Trigger> = part(
  Base.Trigger,
  'ContextMenu.Trigger',
  'hj-context-menu-trigger',
);
export const Positioner: HanjiPart<typeof Base.Positioner> = part(
  Base.Positioner,
  'ContextMenu.Positioner',
  'hj-context-menu-positioner',
);

export type ContentOwnProps = Pick<MenuContentProps, 'container' | 'keepMounted'>;
export interface ContentProps
  extends
    ContentOwnProps,
    Omit<
      MenuContentProps,
      | 'container'
      | 'keepMounted'
      | 'side'
      | 'align'
      | 'sideOffset'
      | 'alignOffset'
      | 'collisionPadding'
    > {}

/** Shorthand for Portal + Positioner (at the pointer) + Popup. */
export function Content(props: ContentProps): React.ReactElement {
  const config = useHanjiConfig();
  const { container, keepMounted, ...popup } = withDefaults(config, 'ContextMenu.Content', props);
  return (
    <Portal container={container} keepMounted={keepMounted}>
      <Positioner collisionPadding={8}>
        <Popup {...popup} />
      </Positioner>
    </Portal>
  );
}
