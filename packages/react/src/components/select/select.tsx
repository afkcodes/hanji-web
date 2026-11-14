'use client';
import { Select as Base } from '@base-ui/react/select';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';

/** State owner: value, onValueChange, items, multiple, open. Generic over the value type. */
export const Root: typeof Base.Root = Base.Root;
export const Label: HanjiPart<typeof Base.Label> = part(
  Base.Label,
  'Select.Label',
  'hj-select-label',
);
export const Value: HanjiPart<typeof Base.Value> = part(
  Base.Value,
  'Select.Value',
  'hj-select-value',
);
export const Backdrop: HanjiPart<typeof Base.Backdrop> = part(
  Base.Backdrop,
  'Select.Backdrop',
  'hj-select-backdrop',
);
export const List: HanjiPart<typeof Base.List> = part(Base.List, 'Select.List', 'hj-select-list');
export const Item: HanjiPart<typeof Base.Item> = part(Base.Item, 'Select.Item', 'hj-select-item');
export const ItemText: HanjiPart<typeof Base.ItemText> = part(
  Base.ItemText,
  'Select.ItemText',
  'hj-select-item-text',
);
export const Group: HanjiPart<typeof Base.Group> = part(
  Base.Group,
  'Select.Group',
  'hj-select-group',
);
export const GroupLabel: HanjiPart<typeof Base.GroupLabel> = part(
  Base.GroupLabel,
  'Select.GroupLabel',
  'hj-select-group-label',
);
export const Separator: HanjiPart<typeof Base.Separator> = part(
  Base.Separator,
  'Select.Separator',
  'hj-select-separator',
);
export const Arrow: HanjiPart<typeof Base.Arrow> = part(
  Base.Arrow,
  'Select.Arrow',
  'hj-select-arrow',
);

/** Portals to `<body>` but keeps the nearest `<Theme>`. */
export function Portal({ children, ...props }: Base.Portal.Props): React.ReactElement {
  return (
    <Base.Portal {...props}>
      <ThemeScope>{children}</ThemeScope>
    </Base.Portal>
  );
}

export interface TriggerOwnProps {
  /** Heights 40 / 48 / 56, matching Field.Control. */
  size?: 'sm' | 'md' | 'lg';
  /** Shown while nothing is selected. Used only when the Trigger has no children. */
  placeholder?: React.ReactNode;
}
export interface TriggerProps extends TriggerOwnProps, Base.Trigger.Props {}

/**
 * The closed select, drawn like a text field. With no children it renders the value (or the
 * placeholder) and a chevron, so `<Select.Trigger placeholder="Choose…" />` is complete.
 */
export function Trigger(props: TriggerProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    size = 'md',
    placeholder,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Select.Trigger', props);
  return (
    <Base.Trigger
      {...rest}
      data-size={size}
      className={cls(config, 'Select.Trigger', 'hj-select-trigger', className)}
    >
      {children ?? (
        <>
          <Value placeholder={placeholder} />
          <Icon />
        </>
      )}
    </Base.Trigger>
  );
}

/** The chevron. Defaults to the adapter's `chevronDown`. */
export function Icon({ children, className, ...props }: Base.Icon.Props): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <Base.Icon {...props} className={cls(config, 'Select.Icon', 'hj-select-icon', className)}>
      {children ?? config.icons.chevronDown}
    </Base.Icon>
  );
}

/** The check beside the chosen item. Defaults to the adapter's `check`. */
export function ItemIndicator({
  children,
  className,
  ...props
}: Base.ItemIndicator.Props): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <Base.ItemIndicator
      {...props}
      className={cls(config, 'Select.ItemIndicator', 'hj-select-item-indicator', className)}
    >
      {children ?? config.icons.check}
    </Base.ItemIndicator>
  );
}

/** Scroll affordance at the top of a long list. */
export function ScrollUpArrow({
  children,
  className,
  ...props
}: Base.ScrollUpArrow.Props): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <Base.ScrollUpArrow
      {...props}
      className={cls(config, 'Select.ScrollUpArrow', 'hj-select-scroll-arrow', className)}
    >
      {children ?? config.icons.chevronUp}
    </Base.ScrollUpArrow>
  );
}

/** Scroll affordance at the bottom of a long list. */
export function ScrollDownArrow({
  children,
  className,
  ...props
}: Base.ScrollDownArrow.Props): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <Base.ScrollDownArrow
      {...props}
      className={cls(config, 'Select.ScrollDownArrow', 'hj-select-scroll-arrow', className)}
    >
      {children ?? config.icons.chevronDown}
    </Base.ScrollDownArrow>
  );
}

/**
 * Places the popup: below the trigger, 6px away (the hanji menu gap), flipping above when there's
 * no room. Base UI's macOS-style overlay — the chosen item laid over the trigger — is opt-in with
 * `alignItemWithTrigger`: over a label or a two-line item it hides what you were reading.
 */
export function Positioner({
  sideOffset = 6,
  collisionPadding = 8,
  alignItemWithTrigger = false,
  className,
  ...props
}: Base.Positioner.Props): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <Base.Positioner
      {...props}
      alignItemWithTrigger={alignItemWithTrigger}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cls(config, 'Select.Positioner', 'hj-select-positioner', className)}
    />
  );
}

export const Popup: HanjiPart<typeof Base.Popup> = part(
  Base.Popup,
  'Select.Popup',
  'hj-select-popup',
);

export interface OptionOwnProps {
  /** A second line under the label, e.g. a consequence: “about 1.4 GB an hour”. */
  description?: React.ReactNode;
}
export interface OptionProps extends OptionOwnProps, Base.Item.Props {}

/** An Item with its check and text laid out — the common case in one part. */
export function Option({ children, description, ...props }: OptionProps): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <Item {...props}>
      <ItemIndicator />
      <ItemText>{children}</ItemText>
      {description ? (
        <span className={config.unstyled ? undefined : 'hj-select-item-description'}>
          {description}
        </span>
      ) : null}
    </Item>
  );
}

export interface ContentOwnProps {
  /** Passed to the Positioner. */
  side?: Base.Positioner.Props['side'];
  align?: Base.Positioner.Props['align'];
  /**
   * Lay the chosen item over the trigger (macOS style) instead of opening below. Base UI still
   * opens below for touch, or when there isn't room to line it up. @default false
   */
  alignItemWithTrigger?: boolean;
  container?: Base.Portal.Props['container'];
}
export interface ContentProps extends ContentOwnProps, Base.Popup.Props {}

/** Shorthand for Portal + Positioner + Popup + scroll arrows + List. Children are the items. */
export function Content({
  side,
  align,
  alignItemWithTrigger,
  container,
  children,
  ...popup
}: ContentProps): React.ReactElement {
  return (
    <Portal container={container}>
      <Positioner side={side} align={align} alignItemWithTrigger={alignItemWithTrigger}>
        <Popup {...popup}>
          <ScrollUpArrow />
          <List>{children}</List>
          <ScrollDownArrow />
        </Popup>
      </Positioner>
    </Portal>
  );
}
