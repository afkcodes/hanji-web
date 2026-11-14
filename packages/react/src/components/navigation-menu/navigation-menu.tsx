'use client';
import { NavigationMenu as Base } from '@base-ui/react/navigation-menu';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';

export const Root: HanjiPart<typeof Base.Root> = part(
  Base.Root,
  'NavigationMenu.Root',
  'hj-navigation-menu-root',
);
export const List: HanjiPart<typeof Base.List> = part(
  Base.List,
  'NavigationMenu.List',
  'hj-navigation-menu-list',
);
export const Item: HanjiPart<typeof Base.Item> = part(
  Base.Item,
  'NavigationMenu.Item',
  'hj-navigation-menu-item',
);
export const Icon: HanjiPart<typeof Base.Icon> = part(
  Base.Icon,
  'NavigationMenu.Icon',
  'hj-navigation-menu-icon',
);
export const Content: HanjiPart<typeof Base.Content> = part(
  Base.Content,
  'NavigationMenu.Content',
  'hj-navigation-menu-content',
);
export const Popup: HanjiPart<typeof Base.Popup> = part(
  Base.Popup,
  'NavigationMenu.Popup',
  'hj-navigation-menu-popup',
);
export const Viewport: HanjiPart<typeof Base.Viewport> = part(
  Base.Viewport,
  'NavigationMenu.Viewport',
  'hj-navigation-menu-viewport',
);
export const Arrow: HanjiPart<typeof Base.Arrow> = part(
  Base.Arrow,
  'NavigationMenu.Arrow',
  'hj-navigation-menu-arrow',
);
export const Backdrop: HanjiPart<typeof Base.Backdrop> = part(
  Base.Backdrop,
  'NavigationMenu.Backdrop',
  'hj-navigation-menu-backdrop',
);
/** Title line inside a card Link. */
export const LinkTitle: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'NavigationMenu.LinkTitle',
  'hj-navigation-menu-link-title',
);
/** One-line description under a LinkTitle. */
export const LinkDescription: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'NavigationMenu.LinkDescription',
  'hj-navigation-menu-link-description',
);

/** Portals to `<body>` but keeps the nearest `<Theme>`. */
export function Portal({ children, ...props }: Base.Portal.Props): React.ReactElement {
  return (
    <Base.Portal {...props}>
      <ThemeScope>{children}</ThemeScope>
    </Base.Portal>
  );
}

/** Places the popup under the active trigger and glides between triggers. */
export function Positioner(props: Base.Positioner.Props): React.ReactElement {
  const config = useHanjiConfig();
  const {
    className,
    sideOffset = 8,
    collisionPadding = 12,
    ...rest
  } = withDefaults(config, 'NavigationMenu.Positioner', props);
  return (
    <Base.Positioner
      {...rest}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cls(
        config,
        'NavigationMenu.Positioner',
        'hj-navigation-menu-positioner',
        className,
      )}
    />
  );
}

export interface TriggerOwnProps {
  /** Append the chevron that turns 180° while the menu is open. @default true */
  chevron?: boolean;
}
export interface TriggerProps extends TriggerOwnProps, Base.Trigger.Props {}

/** A top-level item that opens its Content. */
export function Trigger(props: TriggerProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    chevron = true,
    className,
    children,
    ...rest
  } = withDefaults(config, 'NavigationMenu.Trigger', props);
  return (
    <Base.Trigger
      {...rest}
      className={cls(config, 'NavigationMenu.Trigger', 'hj-navigation-menu-trigger', className)}
    >
      {children}
      {chevron ? <Icon>{config.icons.chevronDown}</Icon> : null}
    </Base.Trigger>
  );
}

export interface LinkOwnProps {
  /** item = a top-level link in the List · card = a block link inside Content (title + description). */
  variant?: 'item' | 'card';
}
export interface LinkProps extends LinkOwnProps, Base.Link.Props {}

/** A link. Use render for your router's Link; `active` marks the current page. */
export function Link(props: LinkProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    variant = 'card',
    className,
    ...rest
  } = withDefaults(config, 'NavigationMenu.Link', props);
  return (
    <Base.Link
      {...rest}
      data-variant={variant}
      className={cls(config, 'NavigationMenu.Link', 'hj-navigation-menu-link', className)}
    />
  );
}

export interface SurfaceOwnProps {
  /** Draw the small arrow pointing at the trigger. @default false */
  arrow?: boolean;
  /** Gap between trigger and popup. @default 8 */
  sideOffset?: number;
}
export interface SurfaceProps extends SurfaceOwnProps, Base.Popup.Props {}

/**
 * Shorthand for Portal + Positioner + Popup + Viewport: the floating surface that shows the
 * active item's Content and morphs its size between items. Place it once, after the List.
 */
export function Surface({ arrow = false, sideOffset, ...popup }: SurfaceProps): React.ReactElement {
  return (
    <Portal>
      <Positioner sideOffset={sideOffset}>
        <Popup {...popup} data-arrow={flag(arrow)}>
          {arrow ? <Arrow /> : null}
          <Viewport />
        </Popup>
      </Positioner>
    </Portal>
  );
}
