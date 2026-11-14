'use client';
import { Menu as Base } from '@base-ui/react/menu';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';

export const Root: typeof Base.Root = Base.Root;
export const SubmenuRoot: typeof Base.SubmenuRoot = Base.SubmenuRoot;
export const RadioGroup: typeof Base.RadioGroup = Base.RadioGroup;
export const createHandle: typeof Base.createHandle = Base.createHandle;

export const Trigger: HanjiPart<typeof Base.Trigger> = part(
  Base.Trigger,
  'Menu.Trigger',
  'hj-menu-trigger',
);
export const Positioner: HanjiPart<typeof Base.Positioner> = part(
  Base.Positioner,
  'Menu.Positioner',
  'hj-menu-positioner',
);
export const Popup: HanjiPart<typeof Base.Popup> = part(Base.Popup, 'Menu.Popup', 'hj-menu-popup');
export const Arrow: HanjiPart<typeof Base.Arrow> = part(Base.Arrow, 'Menu.Arrow', 'hj-menu-arrow');
export const Backdrop: HanjiPart<typeof Base.Backdrop> = part(
  Base.Backdrop,
  'Menu.Backdrop',
  'hj-menu-backdrop',
);
export const Group: HanjiPart<typeof Base.Group> = part(Base.Group, 'Menu.Group', 'hj-menu-group');
export const GroupLabel: HanjiPart<typeof Base.GroupLabel> = part(
  Base.GroupLabel,
  'Menu.GroupLabel',
  'hj-menu-group-label',
);
export const Separator: HanjiPart<typeof Base.Separator> = part(
  Base.Separator,
  'Menu.Separator',
  'hj-menu-separator',
);
export const LinkItem: HanjiPart<typeof Base.LinkItem> = part(
  Base.LinkItem,
  'Menu.LinkItem',
  'hj-menu-item',
);
/** A keyboard shortcut at the end of an item, set in mono. */
export const Shortcut: (props: ElementPartProps<'kbd'>) => React.ReactElement = elementPart(
  'kbd',
  'Menu.Shortcut',
  'hj-menu-shortcut',
);

/** Portals to `<body>` but keeps the nearest `<Theme>`. */
export function Portal({ children, ...props }: Base.Portal.Props): React.ReactElement {
  return (
    <Base.Portal {...props}>
      <ThemeScope>{children}</ThemeScope>
    </Base.Portal>
  );
}

export interface ItemOwnProps {
  /** danger = a destructive verb: danger ink, a danger-tint highlight. Put it last. */
  tone?: 'default' | 'danger';
}
export interface ItemProps extends ItemOwnProps, Base.Item.Props {}

/** One command. Children: an optional `<Icon>`, the label, an optional `<Menu.Shortcut>`. */
export function Item(props: ItemProps): React.ReactElement {
  const config = useHanjiConfig();
  const { tone = 'default', className, ...rest } = withDefaults(config, 'Menu.Item', props);
  return (
    <Base.Item
      {...rest}
      data-tone={tone === 'default' ? undefined : tone}
      className={cls(config, 'Menu.Item', 'hj-menu-item', className)}
    />
  );
}

export interface CheckboxItemOwnProps {
  /** Draw the check column. Turn off if you render your own CheckboxItemIndicator. @default true */
  indicator?: boolean;
}
export interface CheckboxItemProps extends CheckboxItemOwnProps, Base.CheckboxItem.Props {}

/** A toggled option. The check scales in on a settled spring; the menu stays open. */
export function CheckboxItem(props: CheckboxItemProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    indicator = true,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Menu.CheckboxItem', props);
  return (
    <Base.CheckboxItem
      {...rest}
      className={cls(config, 'Menu.CheckboxItem', 'hj-menu-item', className)}
    >
      {indicator ? (
        <Base.CheckboxItemIndicator
          keepMounted
          className={config.unstyled ? undefined : 'hj-menu-indicator'}
        >
          {config.icons.check}
        </Base.CheckboxItemIndicator>
      ) : null}
      {children}
    </Base.CheckboxItem>
  );
}

export interface RadioItemOwnProps {
  /** Draw the dot column. @default true */
  indicator?: boolean;
}
export interface RadioItemProps extends RadioItemOwnProps, Base.RadioItem.Props {}

/** One choice inside a Menu.RadioGroup. */
export function RadioItem(props: RadioItemProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    indicator = true,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Menu.RadioItem', props);
  const styled = !config.unstyled;
  return (
    <Base.RadioItem {...rest} className={cls(config, 'Menu.RadioItem', 'hj-menu-item', className)}>
      {indicator ? (
        <Base.RadioItemIndicator keepMounted className={styled ? 'hj-menu-indicator' : undefined}>
          <span className={styled ? 'hj-menu-dot' : undefined} />
        </Base.RadioItemIndicator>
      ) : null}
      {children}
    </Base.RadioItem>
  );
}

export const CheckboxItemIndicator: HanjiPart<typeof Base.CheckboxItemIndicator> = part(
  Base.CheckboxItemIndicator,
  'Menu.CheckboxItemIndicator',
  'hj-menu-indicator',
);
export const RadioItemIndicator: HanjiPart<typeof Base.RadioItemIndicator> = part(
  Base.RadioItemIndicator,
  'Menu.RadioItemIndicator',
  'hj-menu-indicator',
);

export interface SubmenuTriggerOwnProps {
  /** Draw the trailing chevron. @default true */
  chevron?: boolean;
}
export interface SubmenuTriggerProps extends SubmenuTriggerOwnProps, Base.SubmenuTrigger.Props {}

/** Opens a nested menu on hover, click or →. */
export function SubmenuTrigger(props: SubmenuTriggerProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    chevron = true,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Menu.SubmenuTrigger', props);
  return (
    <Base.SubmenuTrigger
      {...rest}
      data-submenu=""
      className={cls(config, 'Menu.SubmenuTrigger', 'hj-menu-item', className)}
    >
      {children}
      {chevron ? (
        <span className={config.unstyled ? undefined : 'hj-menu-chevron'} aria-hidden="true">
          {config.icons.chevronRight}
        </span>
      ) : null}
    </Base.SubmenuTrigger>
  );
}

export interface ContentOwnProps {
  side?: Base.Positioner.Props['side'];
  align?: Base.Positioner.Props['align'];
  /** Gap from the trigger in px. @default 6 (hanji menu gap) */
  sideOffset?: Base.Positioner.Props['sideOffset'];
  alignOffset?: Base.Positioner.Props['alignOffset'];
  /** Keep this far from the viewport edge in px. @default 8 (hanji menu margin) */
  collisionPadding?: Base.Positioner.Props['collisionPadding'];
  container?: Base.Portal.Props['container'];
  keepMounted?: boolean;
}
export interface ContentProps extends ContentOwnProps, Base.Popup.Props {}

/** Shorthand for Portal + Positioner + Popup. Works for submenus too. */
export function Content(props: ContentProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    side,
    align,
    sideOffset = 6,
    alignOffset,
    collisionPadding = 8,
    container,
    keepMounted,
    ...popup
  } = withDefaults(config, 'Menu.Content', props);
  return (
    <Portal container={container} keepMounted={keepMounted}>
      <Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
      >
        <Popup {...popup} />
      </Positioner>
    </Portal>
  );
}
