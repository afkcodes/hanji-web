'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

export const Caption: (props: ElementPartProps<'caption'>) => React.ReactElement = elementPart(
  'caption',
  'Table.Caption',
  'hj-table-caption',
);
export const Header: (props: ElementPartProps<'thead'>) => React.ReactElement = elementPart(
  'thead',
  'Table.Header',
  'hj-table-header',
);
export const Body: (props: ElementPartProps<'tbody'>) => React.ReactElement = elementPart(
  'tbody',
  'Table.Body',
  'hj-table-body',
);
export const Footer: (props: ElementPartProps<'tfoot'>) => React.ReactElement = elementPart(
  'tfoot',
  'Table.Footer',
  'hj-table-footer',
);

export interface RootOwnProps {
  /** Row height: md 48 · sm 40. */
  size?: 'sm' | 'md';
  /** Keep the header row visible while the body scrolls. @default true */
  stickyHeader?: boolean;
}
export type RootProps = RootOwnProps &
  Omit<React.ComponentProps<'table'>, 'className' | 'style'> & {
    /** Class for the scroll container (the visible box). */
    className?: string;
    /** Style for the scroll container — set `maxHeight` to scroll the body under a sticky header. */
    style?: React.CSSProperties;
    /** Replace the scroll container element. */
    render?: useRender.RenderProp;
  };

/**
 * A data table. Renders a scroll container with a `<table>` inside: className, style and render
 * go to the container; every other prop (aria-label, id…) goes to the table.
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    size = 'md',
    stickyHeader = true,
    className,
    style,
    render,
    children,
    ...tableProps
  } = withDefaults(config, 'Table.Root', props);
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      style,
      'data-size': size,
      'data-sticky': flag(stickyHeader),
      className: cls(config, 'Table.Root', 'hj-table', className) as string | undefined,
      children: (
        <table {...tableProps} className={config.unstyled ? undefined : 'hj-table-element'}>
          {children}
        </table>
      ),
    },
  });
}

export interface RowOwnProps {
  /** Highlight the row the user picked (accent tint) and set aria-selected. */
  selected?: boolean;
}
export type RowProps = RowOwnProps & ElementPartProps<'tr'>;

export function Row(props: RowProps): React.ReactElement {
  const config = useHanjiConfig();
  const { selected, render, className, ...rest } = withDefaults(config, 'Table.Row', props);
  return useRender({
    render,
    defaultTagName: 'tr',
    props: {
      ...rest,
      'aria-selected': selected === undefined ? undefined : selected,
      'data-selected': flag(selected),
      className: cls(config, 'Table.Row', 'hj-table-row', className) as string | undefined,
    },
  });
}

export type SortDirection = 'ascending' | 'descending' | 'none';

export interface HeadOwnProps {
  /** start for text, end for numbers. Numeric implies end. */
  align?: 'start' | 'center' | 'end';
  /** Right-aligned tabular figures. */
  numeric?: boolean;
  /** Current sort of this column. Setting it (or onSort) makes the header a button. */
  sort?: SortDirection;
  /** Called when the header is pressed; decide the next direction yourself. */
  onSort?: () => void;
}
export type HeadProps = HeadOwnProps & ElementPartProps<'th'>;

const svg = (d: string): React.ReactElement => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d={d} />
  </svg>
);
const UNSORTED = svg('m8 9 4-4 4 4M8 15l4 4 4-4');

/** A column header. Becomes a sort button when `sort` or `onSort` is set. */
export function Head(props: HeadProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    align,
    numeric = false,
    sort,
    onSort,
    render,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Table.Head', props);
  const sortable = sort !== undefined || onSort !== undefined;
  const direction = sort ?? 'none';
  const styled = !config.unstyled;
  const glyph = direction === 'none' ? UNSORTED : config.icons.arrowUp;
  return useRender({
    render,
    defaultTagName: 'th',
    props: {
      scope: 'col',
      ...rest,
      'aria-sort': sortable ? direction : undefined,
      'data-align': align ?? (numeric ? 'end' : 'start'),
      'data-numeric': flag(numeric),
      'data-sort': sortable ? direction : undefined,
      className: cls(config, 'Table.Head', 'hj-table-head', className) as string | undefined,
      children: sortable ? (
        <button type="button" className={styled ? 'hj-table-sort' : undefined} onClick={onSort}>
          <span>{children}</span>
          <span className={styled ? 'hj-table-sort-glyph' : undefined} aria-hidden="true">
            {glyph}
          </span>
        </button>
      ) : (
        children
      ),
    },
  });
}

export interface CellOwnProps {
  align?: 'start' | 'center' | 'end';
  /** Right-aligned tabular figures. */
  numeric?: boolean;
}
export type CellProps = CellOwnProps & ElementPartProps<'td'>;

export function Cell(props: CellProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    align,
    numeric = false,
    render,
    className,
    ...rest
  } = withDefaults(config, 'Table.Cell', props);
  return useRender({
    render,
    defaultTagName: 'td',
    props: {
      ...rest,
      'data-align': align ?? (numeric ? 'end' : 'start'),
      'data-numeric': flag(numeric),
      className: cls(config, 'Table.Cell', 'hj-table-cell', className) as string | undefined,
    },
  });
}

export interface EmptyOwnProps {
  /** Columns to span — the table's column count. */
  colSpan: number;
}
export type EmptyProps = EmptyOwnProps & Omit<React.ComponentProps<'td'>, 'colSpan'>;

/** A single row that says why there is nothing (put an EmptyState or a sentence inside). */
export function Empty(props: EmptyProps): React.ReactElement {
  const config = useHanjiConfig();
  const { colSpan, className, ...rest } = withDefaults(config, 'Table.Empty', props);
  return (
    <tr className={config.unstyled ? undefined : 'hj-table-empty-row'}>
      <td
        {...rest}
        colSpan={colSpan}
        className={cls(config, 'Table.Empty', 'hj-table-empty', className) as string | undefined}
      />
    </tr>
  );
}

export interface LoadingOwnProps {
  /** Columns to fill. */
  columns: number;
  /** Placeholder rows. @default 3 */
  rows?: number;
  /** Which columns are numeric (right-aligned, shorter bars). */
  numeric?: readonly number[];
  /** What is loading, for screen readers. Defaults to strings.loading. */
  label?: string;
}
export type LoadingProps = LoadingOwnProps & { className?: string };

const TEXT_BARS: readonly React.CSSProperties[] = [
  { width: '72%' },
  { width: '58%' },
  { width: '64%' },
  { width: '50%' },
];
const NUMERIC_BAR: React.CSSProperties = { width: '44%' };

/** Placeholder rows while data loads: still bars that breathe (ambient), shaped like the data. */
export function Loading(props: LoadingProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    columns,
    rows = 3,
    numeric = [],
    className,
    label,
  } = withDefaults(config, 'Table.Loading', props);
  const styled = !config.unstyled;
  return (
    <>
      {Array.from({ length: rows }, (_row, r) => (
        <tr
          key={r}
          aria-hidden={r > 0 ? true : undefined}
          className={
            cls(config, 'Table.Loading', 'hj-table-loading', className) as string | undefined
          }
        >
          {Array.from({ length: columns }, (_col, c) => (
            <td
              key={c}
              data-align={numeric.includes(c) ? 'end' : 'start'}
              className={styled ? 'hj-table-cell' : undefined}
            >
              {r === 0 && c === 0 ? (
                <span className="hj-sr-only">{label ?? config.strings.loading}</span>
              ) : null}
              <span
                className={styled ? 'hj-table-loading-bar' : undefined}
                style={numeric.includes(c) ? NUMERIC_BAR : TEXT_BARS[(r + c) % TEXT_BARS.length]}
                aria-hidden="true"
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
