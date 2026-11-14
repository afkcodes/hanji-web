'use client';
import { Autocomplete as Base } from '@base-ui/react/autocomplete';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';

/** State owner: items, value (the input text), onValueChange, filter, mode. */
export const Root: typeof Base.Root = Base.Root;
export const Value: typeof Base.Value = Base.Value;
/** The field box holding a leading icon, the input, clear and trigger. */
export const InputGroup: HanjiPart<typeof Base.InputGroup> = part(
  Base.InputGroup,
  'Autocomplete.InputGroup',
  'hj-autocomplete-group',
);
export const List: HanjiPart<typeof Base.List> = part(
  Base.List,
  'Autocomplete.List',
  'hj-autocomplete-list',
);
export const Item: HanjiPart<typeof Base.Item> = part(
  Base.Item,
  'Autocomplete.Item',
  'hj-autocomplete-item',
);
export const Status: HanjiPart<typeof Base.Status> = part(
  Base.Status,
  'Autocomplete.Status',
  'hj-autocomplete-status',
);
export const Empty: HanjiPart<typeof Base.Empty> = part(
  Base.Empty,
  'Autocomplete.Empty',
  'hj-autocomplete-empty',
);
export const Backdrop: HanjiPart<typeof Base.Backdrop> = part(
  Base.Backdrop,
  'Autocomplete.Backdrop',
  'hj-autocomplete-backdrop',
);
export const Popup: HanjiPart<typeof Base.Popup> = part(
  Base.Popup,
  'Autocomplete.Popup',
  'hj-autocomplete-popup',
);
export const Arrow: HanjiPart<typeof Base.Arrow> = part(
  Base.Arrow,
  'Autocomplete.Arrow',
  'hj-autocomplete-arrow',
);
export const Group: HanjiPart<typeof Base.Group> = part(
  Base.Group,
  'Autocomplete.Group',
  'hj-autocomplete-group-items',
);
export const GroupLabel: HanjiPart<typeof Base.GroupLabel> = part(
  Base.GroupLabel,
  'Autocomplete.GroupLabel',
  'hj-autocomplete-group-label',
);
export const Separator: HanjiPart<typeof Base.Separator> = part(
  Base.Separator,
  'Autocomplete.Separator',
  'hj-autocomplete-separator',
);
export const Row: HanjiPart<typeof Base.Row> = part(
  Base.Row,
  'Autocomplete.Row',
  'hj-autocomplete-row',
);
export const Collection: typeof Base.Collection = Base.Collection;
export const useFilter: typeof Base.useFilter = Base.useFilter;
export const useFilteredItems: typeof Base.useFilteredItems = Base.useFilteredItems;
/** A trailing action inside a suggestion (e.g. remove a recent search). */
export const ItemAction: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'Autocomplete.ItemAction',
  'hj-autocomplete-item-action',
);

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

/** The search input. Alone it draws a field box; inside InputGroup it is bare text. */
export function Input(props: InputProps): React.ReactElement {
  const config = useHanjiConfig();
  const { size = 'md', className, ...rest } = withDefaults(config, 'Autocomplete.Input', props);
  return (
    <Base.Input
      {...rest}
      data-size={size}
      className={cls(config, 'Autocomplete.Input', 'hj-autocomplete-input', className)}
    />
  );
}

/** Leading glyph inside the InputGroup. Defaults to the adapter's search icon. */
export function Icon({ children, className, ...props }: Base.Icon.Props): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <Base.Icon
      {...props}
      className={cls(config, 'Autocomplete.Icon', 'hj-autocomplete-icon', className)}
    >
      {children ?? config.icons.search}
    </Base.Icon>
  );
}

/** Clears the input. Defaults to ✕ with the localised “Clear” label. */
export function Clear({ children, className, ...props }: Base.Clear.Props): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <Base.Clear
      aria-label={config.strings.clear}
      {...props}
      className={cls(config, 'Autocomplete.Clear', 'hj-autocomplete-clear', className)}
    >
      {children ?? config.icons.x}
    </Base.Clear>
  );
}

/** Opens the suggestions. Defaults to the adapter's chevron. */
export function Trigger({ children, className, ...props }: Base.Trigger.Props): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <Base.Trigger
      {...props}
      className={cls(config, 'Autocomplete.Trigger', 'hj-autocomplete-trigger', className)}
    >
      {children ?? config.icons.chevronDown}
    </Base.Trigger>
  );
}

/** Places the popup under the field, gap 6. */
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
      className={cls(config, 'Autocomplete.Positioner', 'hj-autocomplete-positioner', className)}
    />
  );
}

export interface HighlightOwnProps {
  /** The suggestion text. */
  text: string;
  /** What the user typed. Every case-insensitive match is set in bold. */
  query: string;
}
export interface HighlightProps
  extends HighlightOwnProps, Omit<React.ComponentProps<'span'>, 'children'> {}

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Sets the typed part of a suggestion in bold, the rest quieter — the eye finds the difference. */
export function Highlight({
  text,
  query,
  className,
  ...props
}: HighlightProps): React.ReactElement {
  const config = useHanjiConfig();
  const q = query.trim();
  const parts = q ? text.split(new RegExp(`(${escape(q)})`, 'gi')) : [text];
  const lower = q.toLowerCase();
  return (
    <span
      {...props}
      className={
        cls(config, 'Autocomplete.Highlight', 'hj-autocomplete-highlight', className) as string
      }
    >
      {parts.map((p, i) =>
        q && p.toLowerCase() === lower ? (
          // oxlint-disable-next-line react/no-array-index-key -- split segments have no identity
          <mark key={i}>{p}</mark>
        ) : (
          // oxlint-disable-next-line react/no-array-index-key
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </span>
  );
}

export interface ContentOwnProps {
  /** Shown when nothing matches: say what was searched and what to try. */
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
