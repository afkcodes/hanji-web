import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type {
  CellOwnProps,
  EmptyOwnProps,
  HeadOwnProps,
  LoadingOwnProps,
  RootOwnProps,
  RowOwnProps,
} from './table.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Table',
  slug: 'table',
  category: 'data',
  status: 'new',
  description:
    'Rows of records compared across columns: hairlines, a sticky header, sortable columns, numbers right-aligned in tabular figures.',
  whenToUse: [
    'Records the user compares or scans by column: invoices, devices, play history, members.',
    'Anything sortable; pass sort and onSort per column.',
  ],
  whenNotToUse: [
    'A collection that is browsed rather than compared — use List.',
    'Two columns of label and value — use a definition list.',
    'Very wide data on a phone — show the two columns that matter as a List.',
  ],
  import: "import { Table } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div > table',
      slot: 'Table.Root',
      className: 'hj-table',
      description:
        'A scroll container with the <table> inside. className, style and render go to the container; every other prop (aria-label, id) goes to the table.',
      props: props<RootOwnProps>({
        size: { type: "'sm' | 'md'", default: "'md'", description: 'Row height 40 / 48.' },
        stickyHeader: {
          type: 'boolean',
          default: 'true',
          description: 'Header stays visible while the body scrolls (set maxHeight on style).',
        },
      }),
      dataAttributes: { 'data-size': 'sm | md', 'data-sticky': 'Sticky header.' },
      cssVars: {
        '--hj-table-row-height': 'Row height. Defaults 48 / 40.',
        '--hj-table-max-height': 'Scroll height for the body.',
        '--hj-table-header-bg': 'Header fill (match the surface the table sits on). Default bg.',
      },
    },
    {
      name: 'Caption',
      element: 'caption',
      slot: 'Table.Caption',
      className: 'hj-table-caption',
      description: 'Names the table; above it, muted. Use hj-sr-only to hide it visually.',
    },
    {
      name: 'Header',
      element: 'thead',
      slot: 'Table.Header',
      className: 'hj-table-header',
      description: 'Header row group.',
    },
    {
      name: 'Body',
      element: 'tbody',
      slot: 'Table.Body',
      className: 'hj-table-body',
      description: 'Body row group; rows tint on hover.',
    },
    {
      name: 'Footer',
      element: 'tfoot',
      slot: 'Table.Footer',
      className: 'hj-table-footer',
      description: 'Totals row group, semibold, no rule.',
    },
    {
      name: 'Row',
      element: 'tr',
      slot: 'Table.Row',
      className: 'hj-table-row',
      description: 'A row.',
      props: props<RowOwnProps>({
        selected: {
          type: 'boolean',
          description: 'Accent tint and aria-selected (set it on every row of a selectable table).',
        },
      }),
      dataAttributes: { 'data-selected': 'Selected.' },
    },
    {
      name: 'Head',
      element: 'th',
      slot: 'Table.Head',
      className: 'hj-table-head',
      description:
        'A column header (scope="col"). With sort or onSort it holds a sort button and sets aria-sort.',
      props: props<HeadOwnProps>({
        align: {
          type: "'start' | 'center' | 'end'",
          default: "'start' ('end' if numeric)",
          description: 'Alignment.',
        },
        numeric: {
          type: 'boolean',
          default: 'false',
          description: 'Number column: right-aligned.',
        },
        sort: {
          type: "'ascending' | 'descending' | 'none'",
          description: 'This column’s sort. Makes the header a button.',
        },
        onSort: { type: '() => void', description: 'Pressed: pick the next direction yourself.' },
      }),
      dataAttributes: {
        'data-sort': 'ascending | descending | none',
        'data-align': 'start | center | end',
      },
    },
    {
      name: 'Cell',
      element: 'td',
      slot: 'Table.Cell',
      className: 'hj-table-cell',
      description: 'A data cell; numeric cells are tabular mono, right-aligned.',
      props: props<CellOwnProps>({
        align: {
          type: "'start' | 'center' | 'end'",
          default: "'start' ('end' if numeric)",
          description: 'Alignment.',
        },
        numeric: {
          type: 'boolean',
          default: 'false',
          description: 'Tabular figures, right-aligned.',
        },
      }),
    },
    {
      name: 'Empty',
      element: 'tr > td',
      slot: 'Table.Empty',
      className: 'hj-table-empty',
      description: 'One spanning row that says why there is nothing.',
      props: props<EmptyOwnProps>({
        colSpan: { type: 'number', description: 'The table’s column count.' },
      }),
    },
    {
      name: 'Loading',
      element: 'tr[]',
      slot: 'Table.Loading',
      className: 'hj-table-loading',
      description:
        'Placeholder rows with still bars that breathe (ambient), shaped like the data. Announces “Loading”.',
      props: props<LoadingOwnProps>({
        columns: { type: 'number', description: 'Columns to fill.' },
        rows: { type: 'number', default: '3', description: 'Placeholder rows.' },
        numeric: {
          type: 'readonly number[]',
          description: 'Indexes of numeric columns (right-aligned bars).',
        },
        label: {
          type: 'string',
          default: 'strings.loading',
          description: 'What is loading, announced once.',
        },
      }),
    },
  ],
  examples: [
    {
      file: 'history',
      title: 'Sortable history',
      description: 'Play history sorted by plays; one pending and one failed sync.',
    },
    {
      file: 'states',
      title: 'Loading and empty',
      description: 'The same table while loading, and with nothing to show.',
    },
  ],
  accessibility: [
    'A real <table>: headers have scope="col"; captions name the table.',
    'Sortable headers are buttons inside the <th>, and the <th> carries aria-sort.',
    'Loading rows announce once; the repeated placeholders are aria-hidden.',
  ],
  motion:
    'Hover tints a row in 180 ms; the sort arrow turns on snappy, clamped; loading bars breathe .55 ↔ .9 and stop when ambient motion is off.',
  tokens: ['line', 'fg-mute', 'accent', 'accent-soft', 'type-mono', 'ambient'],
  related: ['list', 'empty-state', 'pagination'],
});
