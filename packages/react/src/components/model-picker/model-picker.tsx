'use client';
import { Select as Base } from '@base-ui/react/select';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';

/** Base UI Select.Root: value, onValueChange, items (value → label for the trigger), disabled. */
export const Root: typeof Base.Root = Base.Root;
export const Value: HanjiPart<typeof Base.Value> = part(
  Base.Value,
  'ModelPicker.Value',
  'hj-model-picker-value',
);
export const Positioner: HanjiPart<typeof Base.Positioner> = part(
  Base.Positioner,
  'ModelPicker.Positioner',
  'hj-model-picker-positioner',
);
export const Popup: HanjiPart<typeof Base.Popup> = part(
  Base.Popup,
  'ModelPicker.Popup',
  'hj-model-picker-popup',
);
export const List: HanjiPart<typeof Base.List> = part(
  Base.List,
  'ModelPicker.List',
  'hj-model-picker-list',
);
export const Group: HanjiPart<typeof Base.Group> = part(
  Base.Group,
  'ModelPicker.Group',
  'hj-model-picker-group',
);
export const GroupLabel: HanjiPart<typeof Base.GroupLabel> = part(
  Base.GroupLabel,
  'ModelPicker.GroupLabel',
  'hj-model-picker-group-label',
);
export const Separator: HanjiPart<typeof Base.Separator> = part(
  Base.Separator,
  'ModelPicker.Separator',
  'hj-model-picker-separator',
);

/** Portals to `<body>` and keeps the nearest `<Theme>`. */
export function Portal({ children, ...props }: Base.Portal.Props): React.ReactElement {
  return (
    <Base.Portal {...props}>
      <ThemeScope>{children}</ThemeScope>
    </Base.Portal>
  );
}

/** The current model as a quiet pill with a chevron. Children replace the default `<Value />`. */
export function Trigger(props: Base.Trigger.Props): React.ReactElement {
  const config = useHanjiConfig();
  const { className, children, ...rest } = withDefaults(config, 'ModelPicker.Trigger', props);
  return (
    <Base.Trigger
      {...rest}
      className={cls(config, 'ModelPicker.Trigger', 'hj-model-picker-trigger', className)}
    >
      {children ?? <Value />}
      <Base.Icon className={config.unstyled ? undefined : 'hj-model-picker-chevron'}>
        {config.icons.chevronDown}
      </Base.Icon>
    </Base.Trigger>
  );
}

export interface ContentOwnProps {
  /** @default 6 */
  sideOffset?: number;
  /** @default 'start' */
  align?: 'start' | 'center' | 'end';
  /** @default 'top' — the composer usually sits at the bottom of the screen. */
  side?: 'top' | 'bottom';
}
export interface ContentProps extends ContentOwnProps, Base.Popup.Props {}

/** Shorthand: Portal + Positioner + Popup + List. Opens above the trigger by default. */
export function Content({
  sideOffset = 6,
  align = 'start',
  side = 'top',
  children,
  ...popup
}: ContentProps): React.ReactElement {
  return (
    <Portal>
      <Positioner sideOffset={sideOffset} align={align} side={side} alignItemWithTrigger={false}>
        <Popup {...popup}>
          <List>{children}</List>
        </Popup>
      </Positioner>
    </Portal>
  );
}

export interface ItemOwnProps {
  /** The model's display name — also its text for typeahead. */
  name: string;
  /** Who makes or serves it. */
  provider?: string;
  /** One line on what it's good at, with a number if you have one. */
  description?: string;
  /** Short capability tags: `fast`, `reasoning`, `vision`, `beta`… */
  badges?: readonly string[];
}
export interface ItemProps extends ItemOwnProps, Omit<Base.Item.Props, 'children'> {}

/** One model: name, provider, badges on the first line; the capability line under it. */
export function Item(props: ItemProps): React.ReactElement {
  const config = useHanjiConfig();
  const { name, provider, description, badges, className, ...rest } = withDefaults(
    config,
    'ModelPicker.Item',
    props,
  );
  const s = !config.unstyled;
  return (
    <Base.Item
      {...rest}
      className={cls(config, 'ModelPicker.Item', 'hj-model-picker-item', className)}
    >
      <span className={s ? 'hj-model-picker-item-head' : undefined}>
        <Base.ItemText className={s ? 'hj-model-picker-item-name' : undefined}>
          {name}
        </Base.ItemText>
        {provider ? (
          <span className={s ? 'hj-model-picker-item-provider' : undefined}>{provider}</span>
        ) : null}
        {badges?.map((b) => (
          <span key={b} className={s ? 'hj-model-picker-badge' : undefined} data-badge={b}>
            {b}
          </span>
        ))}
      </span>
      {description ? (
        <span className={s ? 'hj-model-picker-item-description' : undefined}>{description}</span>
      ) : null}
      <Base.ItemIndicator className={s ? 'hj-model-picker-item-indicator' : undefined}>
        {config.icons.check}
      </Base.ItemIndicator>
    </Base.Item>
  );
}
