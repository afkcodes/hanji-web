'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

/*
 * No context anywhere: every part is a plain element styled by CSS, so a virtualised list of
 * thousands of rows pays nothing per row beyond its own elements.
 */

export const Content: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'List.Content',
  'hj-list-content',
);
export const Title: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'List.Title',
  'hj-list-title',
);
export const Description: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'List.Description',
  'hj-list-description',
);
export const Trailing: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'List.Trailing',
  'hj-list-trailing',
);
/** A number in the trailing slot: tabular mono, right-aligned. */
export const Value: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'List.Value',
  'hj-list-value',
);

export interface RootOwnProps {
  /** Hairlines between rows, inset to the text column. @default true */
  divided?: boolean;
}
export type RootProps = RootOwnProps & ElementPartProps<'ul'>;

/** A list of rows. Renders `<ul>`; use `render={<ol />}` for an ordered list. */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const { divided = true, render, className, ...rest } = withDefaults(config, 'List.Root', props);
  return useRender({
    render,
    defaultTagName: 'ul',
    props: {
      ...rest,
      'data-divided': flag(divided),
      className: cls(config, 'List.Root', 'hj-list', className) as string | undefined,
    },
  });
}

export interface ItemOwnProps {
  /** The row the user is on or has chosen: title in accent, aria-current set. */
  selected?: boolean;
  disabled?: boolean;
}
export type ItemProps = ItemOwnProps &
  Omit<React.ComponentProps<'li'>, 'className'> & {
    className?: string;
    /**
     * Replace the row element inside the `<li>` — e.g. `render={<a href="/album/42" />}` or
     * `render={<button type="button" />}` — to make the whole row interactive. The `<li>`
     * stays, so the list keeps valid structure.
     */
    render?: useRender.RenderProp;
  };

/** One 56px row: Leading · Content (Title, Description) · Trailing. */
export function Item(props: ItemProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    selected = false,
    disabled = false,
    render,
    className,
    children,
    ...rest
  } = withDefaults(config, 'List.Item', props);
  const interactive = render !== undefined;
  const row = useRender({
    render,
    defaultTagName: 'div',
    props: {
      className: config.unstyled ? undefined : 'hj-list-row',
      'aria-current': interactive && selected ? true : undefined,
      'aria-disabled': interactive && disabled ? true : undefined,
      tabIndex: interactive && disabled ? -1 : undefined,
      children,
    },
  });
  return (
    <li
      {...rest}
      data-interactive={flag(interactive)}
      data-selected={flag(selected)}
      data-disabled={flag(disabled)}
      className={cls(config, 'List.Item', 'hj-list-item', className) as string | undefined}
    >
      {row}
    </li>
  );
}

export interface LeadingOwnProps {
  /** art = 40px rounded image · icon = glyph in a tinted square · avatar = 40px circle · plain. */
  variant?: 'plain' | 'art' | 'icon' | 'avatar';
  /** Tint for `icon`. */
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}
export type LeadingProps = LeadingOwnProps & ElementPartProps<'div'>;

/** The left slot: artwork, an icon in a tint, an avatar. */
export function Leading(props: LeadingProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    variant = 'plain',
    tone = 'neutral',
    render,
    className,
    ...rest
  } = withDefaults(config, 'List.Leading', props);
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...rest,
      'data-variant': variant,
      'data-tone': variant === 'icon' ? tone : undefined,
      className: cls(config, 'List.Leading', 'hj-list-leading', className) as string | undefined,
    },
  });
}

/** The trailing ›, for rows that open something. Decorative. */
export function Chevron(props: Omit<React.ComponentProps<'span'>, 'children'>): React.ReactElement {
  const config = useHanjiConfig();
  const { className, ...rest } = props;
  return (
    <span
      aria-hidden="true"
      {...rest}
      className={cls(config, 'List.Chevron', 'hj-list-chevron', className) as string | undefined}
    >
      {config.icons.chevronRight}
    </span>
  );
}
