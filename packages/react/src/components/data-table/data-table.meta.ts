import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps } from './data-table.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'DataTable',
  slug: 'data-table',
  category: 'data',
  status: 'new',
  description:
    'A data grid for thousands of rows: columns as data, sorting, a checkbox column with select-all and Shift-click ranges, a sticky header, and only the rows on screen in the DOM (virtua). The keyboard works like a spreadsheet.',
  whenToUse: [
    'Hundreds to hundreds of thousands of records compared by column: transactions, members, logs, orders.',
    'Records people select in bulk (archive, export, remove) or sort by any column.',
    'Rows that open a detail view: onRowAction fires on click and on Enter.',
  ],
  whenNotToUse: [
    'Under ~100 rows that need no keyboard grid — Table is a real <table>, prints, and finds with ⌘F.',
    'A collection that is browsed rather than compared — use List or VirtualList.',
    'Cells people edit in place — this grid reads; put editing in a Sheet or Dialog.',
    'A phone-width screen — show the two columns that matter as a List.',
  ],
  import: "import { DataTable } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div > div[role=grid]',
      slot: 'DataTable.Root',
      className: 'hj-data-table',
      description:
        'The whole grid. className, style, ref and render go to the outer element; every other prop (aria-label, aria-labelledby, id, handlers) goes to the scrolling role="grid" inside it. Rows are virtualised; the header stays put above them; columns wider than the box scroll sideways. Column fields: id, header, label, cell(row), value(row), sortable, compare(a, b), width, minWidth (120), flex (1), align, numeric, rowHeader.',
      props: props<RootOwnProps<unknown>>({
        rows: {
          type: 'readonly Row[]',
          description: 'The data. Only the rows on screen (plus a few either side) are rendered.',
        },
        columns: {
          type: 'readonly DataTableColumn<Row>[]',
          description:
            '{ id, header, label?, cell?(row), value?(row), sortable?, compare?(a, b), width?, minWidth?, flex?, align?, numeric?, rowHeader? }. value is what the column sorts by (and shows without cell); numeric is tabular figures, right-aligned; rowHeader marks the column that names the row. Define the array once — a new one re-sorts.',
        },
        getRowId: {
          type: '(row: Row, index: number) => string | number',
          default: 'the index in rows',
          description: 'A stable id per row: what `selected` holds. Pass one whenever rows change.',
        },
        size: {
          type: "'sm' | 'md'",
          default: "'md'",
          description: 'Row height 40 / 48.',
        },
        rowHeight: {
          type: "number | 'auto'",
          description:
            'A fixed row height in px, or auto: rows grow to fit wrapped text and are measured.',
        },
        sort: {
          type: "{ column: string; direction: 'ascending' | 'descending' } | null",
          description: 'The sort (controlled). null keeps the order of rows.',
        },
        defaultSort: {
          type: "{ column: string; direction: 'ascending' | 'descending' } | null",
          default: 'null',
          description: 'The sort to start with (uncontrolled).',
        },
        onSortChange: {
          type: '(sort: SortState | null) => void',
          description: 'A header was pressed. Each press cycles ascending → descending → none.',
        },
        manualSort: {
          type: 'boolean',
          default: 'false',
          description:
            'Rows arrive sorted (by a server): show them as given and only report the sort.',
        },
        selectable: {
          type: 'boolean',
          default: 'false',
          description:
            'A checkbox column with select-all (indeterminate when some), Shift-click ranges, Space to toggle and ⌘A / Ctrl+A for all.',
        },
        selected: {
          type: 'ReadonlySet<string | number>',
          description: 'Selected row ids (controlled).',
        },
        defaultSelected: {
          type: 'Iterable<string | number>',
          description: 'Selected row ids to start with (uncontrolled).',
        },
        onSelectedChange: {
          type: '(selected: Set<string | number>) => void',
          description: 'Selection changed; receives a new Set.',
        },
        onRowAction: {
          type: '(row: Row, id: string | number) => void',
          description:
            'A row was opened: clicked (not on a control, not finishing a text selection), or Enter on one of its cells.',
        },
        loading: {
          type: 'boolean',
          default: 'false',
          description: 'Skeleton rows in place of the body; the grid is aria-busy.',
        },
        loadingRows: { type: 'number', default: '6', description: 'How many skeleton rows.' },
        empty: {
          type: 'ReactNode',
          default: 'strings.noRows',
          description: 'Shown when there are no rows — usually an EmptyState.',
        },
        actionsRef: {
          type: "Ref<{ scrollToIndex(index, { align?: 'start' | 'center' | 'end' | 'auto', behavior? }) }>",
          description:
            'Scroll a row (in the order shown) into view, clear of the sticky header. Smooth jumps under reduced motion.',
        },
        render: { type: 'RenderProp', description: 'Render the outer element as another.' },
      }),
      dataAttributes: {
        'data-size': 'sm | md',
        'data-row-height': 'auto, when rows measure themselves.',
        'data-selectable': 'Has the checkbox column.',
        'data-actionable': 'Rows open (onRowAction).',
        'data-loading': 'Showing skeleton rows.',
      },
      cssVars: {
        '--hj-data-table-height':
          'A fixed height for the box. Default: as tall as the rows, up to the max height.',
        '--hj-data-table-max-height':
          'The cap when no height is set. Default 480px (or the height you set).',
        '--hj-data-table-row-height':
          'Row height when rowHeight isn’t a number. Defaults 48 / 40; prefer the rowHeight prop, which virtua knows before measuring.',
        '--hj-data-table-header-bg':
          'The header’s ground once rows scroll under it (match the surface the grid sits on). Default bg.',
      },
    },
  ],
  examples: [
    {
      file: 'transactions',
      title: 'Ten thousand transactions',
      description:
        'Newest first, sortable by any column; amounts in pounds and euros in tabular figures; today’s payments pending, one failed. Click a row or press Enter to open it. Only the rows on screen exist.',
    },
    {
      file: 'members',
      title: 'Select members in bulk',
      description:
        'A checkbox column with select-all and Shift-click ranges; the bar above counts the selection and acts on it.',
    },
    {
      file: 'states',
      title: 'Loading and empty',
      description:
        'Skeleton rows shaped like the columns, and an EmptyState when a filter finds nothing.',
    },
  ],
  accessibility: [
    'An ARIA grid on divs, not a <table>: virtual rows are positioned absolutely, which takes them out of table layout. aria-rowcount (rows + the header), aria-rowindex on every row and aria-colcount / aria-colindex on every cell give assistive tech the whole shape — “row 4,203 of 10,001”.',
    'One tab stop (roving tabindex). Arrows move a cell; Home / End go to the row’s ends, Ctrl+Home / Ctrl+End to the grid’s; Page Up / Page Down move a screen. In the checkbox column and on sortable headers, focus lands on the checkbox or the sort button itself.',
    'Selectable grids are aria-multiselectable with aria-selected rows. Space toggles the focused row, Shift+Space selects from the last toggled row, Shift+↑/↓ extend, ⌘A / Ctrl+A selects all. Row checkboxes are named “Select row” plus the row-header cell (or the first column).',
    'Sortable headers are buttons inside the columnheader; aria-sort sits on the sorted column only, and each change is announced politely (“Sorted by Amount, descending”).',
    'The focused row stays mounted while it is scrolled out of view, so focus is never lost to the page.',
    'While loading the grid is aria-busy and “Loading” is read once; the placeholder rows are hidden.',
    'Find-in-page cannot see rows that are not rendered — offer search or filters for long data.',
  ],
  motion:
    'The sort arrow turns to point the new way on snappy (clamped, so it never overshoots); selection and hover tints fade in 180 ms; the header’s ground fades in only once rows pass under it. Scrolling is the browser’s; skeletons sweep only while ambient motion is on.',
  tokens: [
    'line',
    'fg',
    'fg-mute',
    'fg-dim',
    'accent',
    'accent-soft',
    'bg',
    'focus',
    'type-mono',
    'radius-xs',
    'density',
    'press-opacity',
  ],
  related: ['table', 'virtual-list', 'checkbox', 'empty-state', 'status', 'skeleton'],
});
