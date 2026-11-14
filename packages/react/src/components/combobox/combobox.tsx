'use client';
import { Combobox as Base } from '@base-ui/react/combobox';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';

/** State owner: items, value, multiple, onValueChange, filter. Generic over the item type. */
export const Root: typeof Base.Root = Base.Root;
export const Label: HanjiPart<typeof Base.Label> = part(
  Base.Label,
  'Combobox.Label',
  'hj-combobox-label',
);
export const Value: typeof Base.Value = Base.Value;
/** The field box that holds chips, the input, the clear and the trigger. */
export const InputGroup: HanjiPart<typeof Base.InputGroup> = part(
  Base.InputGroup,
  'Combobox.InputGroup',
  'hj-combobox-group',
);
export const Chips: HanjiPart<typeof Base.Chips> = part(
  Base.Chips,
  'Combobox.Chips',
  'hj-combobox-chips',
);
export const Chip: HanjiPart<typeof Base.Chip> = part(
  Base.Chip,
  'Combobox.Chip',
  'hj-combobox-chip',
);
export const List: HanjiPart<typeof Base.List> = part(
  Base.List,
  'Combobox.List',
  'hj-combobox-list',
);
export const Status: HanjiPart<typeof Base.Status> = part(
  Base.Status,
  'Combobox.Status',
  'hj-combobox-status',
);
export const Empty: HanjiPart<typeof Base.Empty> = part(
  Base.Empty,
  'Combobox.Empty',
  'hj-combobox-empty',
);
export const Backdrop: HanjiPart<typeof Base.Backdrop> = part(
  Base.Backdrop,
  'Combobox.Backdrop',
  'hj-combobox-backdrop',
);
export const Popup: HanjiPart<typeof Base.Popup> = part(
  Base.Popup,
  'Combobox.Popup',
  'hj-combobox-popup',
);
export const Arrow: HanjiPart<typeof Base.Arrow> = part(
  Base.Arrow,
  'Combobox.Arrow',
  'hj-combobox-arrow',
);
export const Item: HanjiPart<typeof Base.Item> = part(
  Base.Item,
  'Combobox.Item',
  'hj-combobox-item',
);
export const Group: HanjiPart<typeof Base.Group> = part(
  Base.Group,
  'Combobox.Group',
  'hj-combobox-group-items',
);
export const GroupLabel: HanjiPart<typeof Base.GroupLabel> = part(
  Base.GroupLabel,
  'Combobox.GroupLabel',
  'hj-combobox-group-label',
);
export const Separator: HanjiPart<typeof Base.Separator> = part(
  Base.Separator,
  'Combobox.Separator',
  'hj-combobox-separator',
);
export const Row: HanjiPart<typeof Base.Row> = part(Base.Row, 'Combobox.Row', 'hj-combobox-row');
export const Collection: typeof Base.Collection = Base.Collection;
export const useFilter: typeof Base.useFilter = Base.useFilter;
export const useFilteredItems: typeof Base.useFilteredItems = Base.useFilteredItems;

/** Portals to `<body>` but keeps the nearest `<Theme>`. */
export function Portal({ children, ...props }: Base.Portal.Props): React.ReactElement {
  return (
    <Base.Portal {...props}>
      <ThemeScope>{children}</ThemeScope>
    </Base.Portal>
  );
}

export interface InputOwnProps {
  /** Heights 40 / 48 / 56 when the input draws its own box (outside an InputGroup). */
  size?: 'sm' | 'md' | 'lg';
}
export interface InputProps extends InputOwnProps, Omit<Base.Input.Props, 'size'> {}

/** The text input. Alone it draws a field box; inside InputGroup it is bare text. */
export function Input(props: InputProps): React.ReactElement {
  const config = useHanjiConfig();
  const { size = 'md', className, ...rest } = withDefaults(config, 'Combobox.Input', props);
  return (
    <Base.Input
      {...rest}
      data-size={size}
      className={cls(config, 'Combobox.Input', 'hj-combobox-input', className)}
    />
  );
}

/** Opens the list. Defaults to the adapter's chevron. */
export function Trigger({ children, className, ...props }: Base.Trigger.Props): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <Base.Trigger
      aria-label={children ? undefined : config.strings.more}
      {...props}
      className={cls(config, 'Combobox.Trigger', 'hj-combobox-trigger', className)}
    >
      {children ?? config.icons.chevronDown}
    </Base.Trigger>
  );
}

/** Clears the value and the input. Defaults to ✕ with the localised “Clear” label. */
export function Clear({ children, className, ...props }: Base.Clear.Props): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <Base.Clear
      aria-label={config.strings.clear}
      {...props}
      className={cls(config, 'Combobox.Clear', 'hj-combobox-clear', className)}
    >
      {children ?? config.icons.x}
    </Base.Clear>
  );
}

/** Removes its chip. Defaults to ✕; give it an aria-label naming the chip. */
export function ChipRemove({
  children,
  className,
  ...props
}: Base.ChipRemove.Props): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <Base.ChipRemove
      {...props}
      className={cls(config, 'Combobox.ChipRemove', 'hj-combobox-chip-remove', className)}
    >
      {children ?? config.icons.x}
    </Base.ChipRemove>
  );
}

/** The check beside a selected item. */
export function ItemIndicator({
  children,
  className,
  ...props
}: Base.ItemIndicator.Props): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <Base.ItemIndicator
      {...props}
      className={cls(config, 'Combobox.ItemIndicator', 'hj-combobox-item-indicator', className)}
    >
      {children ?? config.icons.check}
    </Base.ItemIndicator>
  );
}

/** Places the popup under the input group, gap 6. */
export function Positioner({
  sideOffset = 6,
  collisionPadding = 8,
  className,
  ...props
}: Base.Positioner.Props): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <Base.Positioner
      {...props}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cls(config, 'Combobox.Positioner', 'hj-combobox-positioner', className)}
    />
  );
}

export interface OptionOwnProps {
  /** A second line under the label. */
  description?: React.ReactNode;
}
export interface OptionProps extends OptionOwnProps, Base.Item.Props {}

/** An Item with its check, label and optional second line — the common case. */
export function Option({ children, description, ...props }: OptionProps): React.ReactElement {
  const config = useHanjiConfig();
  const styled = !config.unstyled;
  return (
    <Item {...props}>
      <ItemIndicator />
      <span className={styled ? 'hj-combobox-item-text' : undefined}>{children}</span>
      {description ? (
        <span className={styled ? 'hj-combobox-item-description' : undefined}>{description}</span>
      ) : null}
    </Item>
  );
}

export interface ContentOwnProps {
  /** Shown when nothing matches, e.g. “No artists match ‘kōy’”. */
  empty?: React.ReactNode;
  side?: Base.Positioner.Props['side'];
  align?: Base.Positioner.Props['align'];
  container?: Base.Portal.Props['container'];
  /** The list's children: nodes, or a render function per filtered item. */
  children?: Base.List.Props['children'];
}
export interface ContentProps extends ContentOwnProps, Omit<Base.Popup.Props, 'children'> {}

/** Shorthand for Portal + Positioner + Popup + Empty + List. */
export function Content({
  empty,
  side,
  align,
  container,
  children,
  ...popup
}: ContentProps): React.ReactElement {
  return (
    <Portal container={container}>
      <Positioner side={side} align={align}>
        <Popup {...popup}>
          {empty ? <Empty>{empty}</Empty> : null}
          <List>{children}</List>
        </Popup>
      </Positioner>
    </Portal>
  );
}
