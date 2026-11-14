'use client';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Menubar as Base } from '@base-ui/react/menubar';
import type * as React from 'react';

import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';

/*
 * A row of menus (File · Edit · View) that behave as one: hover moves between open menus, ←/→
 * move between triggers. Each menu's popup and rows are Menu's own parts, re-exported here.
 */
export {
  Arrow,
  Backdrop,
  CheckboxItem,
  CheckboxItemIndicator,
  Content,
  Group,
  GroupLabel,
  Item,
  LinkItem,
  Popup,
  Portal,
  Positioner,
  RadioGroup,
  RadioItem,
  RadioItemIndicator,
  Separator,
  Shortcut,
  SubmenuRoot,
  SubmenuTrigger,
} from '../menu/menu.tsx';

/** The bar. Renders a `<div role="menubar">`. */
export const Root: HanjiPart<typeof Base> = part(Base, 'Menubar.Root', 'hj-menubar');
/** One menu in the bar (Base UI Menu.Root). */
export const Menu: typeof BaseMenu.Root = BaseMenu.Root;
/** The bar's quiet text trigger. */
export const Trigger: HanjiPart<typeof BaseMenu.Trigger> = part(
  BaseMenu.Trigger,
  'Menubar.Trigger',
  'hj-menubar-trigger',
);

/** Props of the bar itself. */
export type RootProps = React.ComponentProps<typeof Base>;
