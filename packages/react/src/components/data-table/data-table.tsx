'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';
import { Virtualizer } from 'virtua';
import type {
  CustomContainerComponentProps,
  CustomItemComponentProps,
  VirtualizerHandle,
} from 'virtua';

import type { HanjiStrings } from '../../system/config.tsx';
import { prefersReducedMotion } from '../../system/motion.ts';
import { cls, flag } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';
import * as Checkbox from '../checkbox/checkbox.tsx';
import * as Skeleton from '../skeleton/skeleton.tsx';

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- virtual rows can't live in a <table>; see below */
/*
 * Semantics: an ARIA grid on divs, not a <table>. virtua positions every row absolutely, which
 * takes rows out of table layout, so each row is role="row" laid out on one CSS grid template
 * that all rows share (--_cols), and assistive tech learns the whole shape from aria-rowcount,
 * aria-rowindex, aria-colcount and aria-colindex — “row 4,203 of 10,001”. One cell is the tab
 * stop (roving tabindex); arrows move it, as in the APG data grid.
 *
 * Virtualisation is virtua's (github.com/inokawa/virtua, MIT). The sticky header sits above the
 * rows inside the same scroller, so virtua is told its height (startMargin).
 */

/** A row's stable identity: what `selected` holds. */
export type RowId = string | number;
export type SortDirection = 'ascending' | 'descending';
/** Which column the rows are sorted by, and which way. */
export interface SortState {
  column: string;
  direction: SortDirection;
}
/** What a column sorts by. Empty values (null, undefined, NaN) sort last in both directions. */
export type SortValue = string | number | bigint | boolean | Date | null | undefined;

/** One column, as data. */
export interface Column<Row> {
  /** Stable id: names the column in `sort`. */
  id: string;
  /** The header's content. */
  header: React.ReactNode;
  /** Plain-text name, for announcements, when `header` isn't a string. */
  label?: string;
  /** Draws the cell. Without it the cell shows `value(row)` as text. */
  cell?: (row: Row) => React.ReactNode;
  /** The value the column sorts by (and shows, when there is no `cell`). */
  value?: (row: Row) => SortValue;
  /** Lets people sort by this column; needs `value` or `compare`. */
  sortable?: boolean;
  /** Replace the built-in order: compare two rows, ascending. Direction is applied for you. */
  compare?: (a: Row, b: Row) => number;
  /** Fixed width in px. */
  width?: number;
  /** Narrowest the column gets before the table scrolls sideways, px. @default 120 */
  minWidth?: number;
  /** Share of the spare width, like flex-grow. @default 1 */
  flex?: number;
  /** start for text, end for numbers. Numeric implies end. */
  align?: 'start' | 'center' | 'end';
  /** Tabular figures, right-aligned: amounts, counts, dates in figures. */
  numeric?: boolean;
  /** This column names the row (a person, a payee): its cells are row headers. */
  rowHeader?: boolean;
}

export interface ScrollToIndexOptions {
  /** start · center · end, or auto: the least scroll that shows the row. @default 'auto' */
  align?: 'start' | 'center' | 'end' | 'auto';
  behavior?: ScrollBehavior;
}
/** Imperative actions, through `actionsRef`. */
export interface DataTableActions {
  /** Scroll row `index` (in the order shown) into view, clear of the sticky header. */
  scrollToIndex: (index: number, options?: ScrollToIndexOptions) => void;
}

/** Props hanji adds to the Root. */
export interface RootOwnProps<Row> {
  /** The data. Only the rows on screen (plus a few either side) exist in the DOM. */
  rows: readonly Row[];
  /** The columns, as data. Define them once (module scope or useMemo): a new array re-sorts. */
  columns: readonly Column<Row>[];
  /** A stable id per row. Defaults to the row's index in `rows` — pass one if rows change. */
  getRowId?: (row: Row, index: number) => RowId;
  /** Row height: md 48 · sm 40. */
  size?: 'sm' | 'md';
  /** A fixed row height in px, or auto: rows grow to fit wrapped text and are measured. */
  rowHeight?: number | 'auto';
  /** The sort (controlled). null = the order of `rows`. */
  sort?: SortState | null;
  /** The sort to start with (uncontrolled). */
  defaultSort?: SortState | null;
  /** A header was pressed: ascending → descending → none. */
  onSortChange?: (sort: SortState | null) => void;
  /** Rows arrive already sorted (by a server): show them as given and only report the sort. */
  manualSort?: boolean;
  /** A checkbox column, with select-all, Shift-click ranges and Space to toggle. */
  selectable?: boolean;
  /** Selected row ids (controlled). */
  selected?: ReadonlySet<RowId>;
  /** Selected row ids to start with (uncontrolled). */
  defaultSelected?: Iterable<RowId>;
  /** Selection changed; receives a new Set. */
  onSelectedChange?: (selected: Set<RowId>) => void;
  /** A row was opened: clicked, or Enter on one of its cells. */
  onRowAction?: (row: Row, id: RowId) => void;
  /** Skeleton rows in place of the body. */
  loading?: boolean;
  /** How many skeleton rows. @default 6 */
  loadingRows?: number;
  /** Shown when there are no rows — usually an EmptyState. */
  empty?: React.ReactNode;
  /** Receives scrollToIndex. */
  actionsRef?: React.Ref<DataTableActions>;
  render?: useRender.RenderProp;
}
export interface RootProps<Row>
  extends RootOwnProps<Row>, Omit<React.ComponentProps<'div'>, 'className' | 'children'> {
  /** Class for the outer element. */
  className?: string;
}

/* ———————————————————————————— sorting ———————————————————————————— */

type Key = string | number | bigint | null;
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function key(v: SortValue): Key {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.getTime();
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number' && Number.isNaN(v)) return null;
  return v;
}
/** Numbers and dates by size, text by the reader's collation (2 before 10); empties last. */
function compareKeys(a: Key, b: Key, dir: number): number {
  if (a === null) return b === null ? 0 : 1;
  if (b === null) return -1;
  const r =
    typeof a === 'string' || typeof b === 'string'
      ? collator.compare(String(a), String(b))
      : a < b
        ? -1
        : a > b
          ? 1
          : 0;
  return r * dir;
}

/** Indexes into `rows` in sorted order — a stable sort — or null for the given order. */
function sortOrder<Row>(
  rows: readonly Row[],
  columns: readonly Column<Row>[],
  sort: SortState | null,
): number[] | null {
  if (!sort) return null;
  const col = columns.find((c) => c.id === sort.column);
  if (!col) return null;
  const dir = sort.direction === 'descending' ? -1 : 1;
  const idx = Array.from({ length: rows.length }, (_, i) => i);
  const { compare, value } = col;
  if (compare) {
    return idx.toSorted((a, b) => dir * compare(rows[a] as Row, rows[b] as Row) || a - b);
  }
  if (!value) return null;
  const keys = rows.map((r) => key(value(r)));
  return idx.toSorted((a, b) => compareKeys(keys[a] ?? null, keys[b] ?? null, dir) || a - b);
}

function show(v: SortValue): React.ReactNode {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v.toLocaleDateString();
  return String(v);
}

const labelOf = (col: Column<never>): string =>
  col.label ?? (typeof col.header === 'string' ? col.header : col.id);

/* ———————————————————————————— layout ———————————————————————————— */

const SELECT_WIDTH = 44;
const DEFAULT_MIN = 120;

function template(columns: readonly Column<never>[], selectable: boolean): [string, number] {
  const tracks: string[] = selectable ? [`${SELECT_WIDTH}px`] : [];
  let min = selectable ? SELECT_WIDTH : 0;
  for (const c of columns) {
    if (c.width !== undefined) {
      tracks.push(`${c.width}px`);
      min += c.width;
    } else {
      const m = c.minWidth ?? DEFAULT_MIN;
      tracks.push(`minmax(${m}px, ${c.flex ?? 1}fr)`);
      min += m;
    }
  }
  return [tracks.join(' '), min];
}

/** The cell at (row, col); row -1 is the header. */
function cellAt(grid: HTMLElement | null, row: number, col: number): HTMLElement | null {
  return (
    grid?.querySelector<HTMLElement>(
      `[aria-rowindex="${row + 2}"] > [aria-colindex="${col + 1}"]`,
    ) ?? null
  );
}
/** What takes focus in a cell: the cell, or its one control (a checkbox, a sort button). */
function focusTarget(cell: HTMLElement): HTMLElement {
  return cell.hasAttribute('tabindex')
    ? cell
    : (cell.querySelector<HTMLElement>('[tabindex]') ?? cell);
}
/** Scroll the least that shows `cell`, clear of the sticky header. */
function reveal(viewport: HTMLElement, cell: HTMLElement, head: number, inHeader: boolean): void {
  const v = viewport.getBoundingClientRect();
  const c = cell.getBoundingClientRect();
  if (!inHeader) {
    const top = v.top + viewport.clientTop + head;
    const bottom = v.top + viewport.clientTop + viewport.clientHeight;
    if (c.top < top) viewport.scrollTop += c.top - top;
    else if (c.bottom > bottom) viewport.scrollTop += c.bottom - bottom;
  }
  const left = v.left + viewport.clientLeft;
  const right = left + viewport.clientWidth;
  if (c.left < left) viewport.scrollLeft += c.left - left;
  else if (c.right > right) viewport.scrollLeft += c.right - right;
}

const INTERACTIVE =
  'a[href], button, input, select, textarea, label, [role="checkbox"], [role="button"], [role="link"], [contenteditable="true"]';

/* ———————————————————————————— rows ———————————————————————————— */

interface StaticContext {
  columns: readonly Column<unknown>[];
  selectable: boolean;
  styled: boolean;
  size: 'sm' | 'md';
  baseId: string;
  /** The column whose cell names the row (labels its checkbox). */
  nameCol: number;
  strings: HanjiStrings;
  toggle: (index: number) => void;
  /** Record whether Shift was held as a checkbox is pressed: Shift selects a range. */
  setShift: (held: boolean) => void;
}
const Static = React.createContext<StaticContext | null>(null);

interface DynamicContext {
  ids: readonly RowId[];
  selected: ReadonlySet<RowId>;
  activeRow: number;
}
const Dynamic = React.createContext<DynamicContext>({
  ids: [],
  selected: new Set(),
  activeRow: -1,
});

/** virtua's container: the body row group. */
function Body({ style, children, ref }: CustomContainerComponentProps): React.ReactElement {
  const s = React.useContext(Static);
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      style={style}
      role="rowgroup"
      className={s?.styled ? 'hj-data-table-body' : undefined}
    >
      {children}
    </div>
  );
}

/** virtua's item: a row that knows its place in the whole and whether it is selected. */
function RowItem({ style, index, children, ref }: CustomItemComponentProps): React.ReactElement {
  const s = React.useContext(Static);
  const d = React.useContext(Dynamic);
  const id = d.ids[index];
  const selected = !!s?.selectable && id !== undefined && d.selected.has(id);
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      style={style}
      role="row"
      aria-rowindex={index + 2}
      aria-selected={s?.selectable ? selected : undefined}
      data-index={index}
      data-selected={flag(selected)}
      className={s?.styled ? 'hj-data-table-row' : undefined}
    >
      {children}
    </div>
  );
}

interface CellsProps {
  row: unknown;
  index: number;
  selected: boolean;
  /** The column holding the tab stop in this row, or -1. */
  activeCol: number;
}

/** A row's cells. Memoised: moving focus or selecting re-renders only the rows that changed. */
const Cells = React.memo(function Cells({
  row,
  index,
  selected,
  activeCol,
}: CellsProps): React.ReactElement {
  const s = React.useContext(Static);
  if (!s) return <></>;
  const offset = s.selectable ? 1 : 0;
  const cellClass = s.styled ? 'hj-data-table-cell' : undefined;
  const nameId = `${s.baseId}-n${index}`;
  return (
    <>
      {s.selectable ? (
        // the cell's focusable element is its checkbox (APG: a cell with one control focuses it)
        // oxlint-disable-next-line jsx-a11y/interactive-supports-focus
        <div
          role="gridcell"
          aria-colindex={1}
          className={cellClass}
          data-select=""
          onPointerDownCapture={(e) => s.setShift(e.shiftKey)}
          onKeyDownCapture={(e) => s.setShift(e.shiftKey)}
          onMouseDown={(e) => {
            // Shift-click selects rows, not the text between them
            if (e.shiftKey) e.preventDefault();
          }}
        >
          {/* named “Select row” + the row's name cell: “Select row Mira Okafor” */}
          <span id={`${s.baseId}-s${index}`} hidden>
            {s.strings.selectRow}
          </span>
          <Checkbox.Root
            size={s.size}
            checked={selected}
            onCheckedChange={() => s.toggle(index)}
            tabIndex={activeCol === 0 ? 0 : -1}
            aria-labelledby={`${s.baseId}-s${index} ${nameId}`}
          />
        </div>
      ) : null}
      {s.columns.map((col, c) => (
        <div
          key={col.id}
          id={c === s.nameCol ? nameId : undefined}
          role={col.rowHeader ? 'rowheader' : 'gridcell'}
          aria-colindex={c + offset + 1}
          tabIndex={activeCol === c + offset ? 0 : -1}
          data-align={col.align ?? (col.numeric ? 'end' : 'start')}
          data-numeric={flag(col.numeric)}
          className={cellClass}
        >
          {col.cell ? col.cell(row) : show(col.value?.(row))}
        </div>
      ))}
    </>
  );
});

/* ———————————————————————————— loading ———————————————————————————— */

const BARS: readonly string[] = ['72%', '56%', '64%', '48%', '68%'];
const END: React.CSSProperties = { marginInlineStart: 'auto' };
const CENTER: React.CSSProperties = { margin: '0 auto' };

function LoadingRows({
  columns,
  count,
  selectable,
  styled,
  label,
}: {
  columns: readonly Column<never>[];
  count: number;
  selectable: boolean;
  styled: boolean;
  label: string;
}): React.ReactElement {
  const offset = selectable ? 1 : 0;
  return (
    <div role="rowgroup" className={styled ? 'hj-data-table-body' : undefined}>
      {Array.from({ length: count }, (_r, r) => (
        <div
          // oxlint-disable-next-line react/no-array-index-key -- placeholders are positional
          key={r}
          role="row"
          aria-rowindex={r + 2}
          aria-hidden={r > 0 ? true : undefined}
          data-loading=""
          className={styled ? 'hj-data-table-row' : undefined}
        >
          {selectable ? (
            <div
              role="gridcell"
              aria-colindex={1}
              data-select=""
              className={styled ? 'hj-data-table-cell' : undefined}
            >
              <Skeleton.Root width={16} height={16} style={CENTER} />
            </div>
          ) : null}
          {columns.map((col, c) => {
            const end = (col.align ?? (col.numeric ? 'end' : 'start')) === 'end';
            return (
              <div
                key={col.id}
                role="gridcell"
                aria-colindex={c + offset + 1}
                data-align={end ? 'end' : 'start'}
                className={styled ? 'hj-data-table-cell' : undefined}
              >
                {r === 0 && c === 0 ? <span className="hj-sr-only">{label}</span> : null}
                <Skeleton.Root
                  shape="text"
                  width={end ? '40%' : BARS[(r + c) % BARS.length]}
                  style={end ? END : undefined}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ———————————————————————————— root ———————————————————————————— */

const SORT_IDLE = (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="m8 9 4-4 4 4M8 15l4 4 4-4" />
  </svg>
);

/**
 * A data grid for thousands of rows: columns as data, sorting, a checkbox column with ranges,
 * a sticky header, and only the rows on screen in the DOM (virtua). Keyboard works like a
 * spreadsheet: arrows move a cell, Space selects, Enter opens.
 *
 * @example
 * <DataTable.Root aria-label="Transactions" rows={txns} columns={columns} getRowId={(t) => t.id} selectable />
 */
export function Root<Row>(props: RootProps<Row>): React.ReactElement {
  const [
    config,
    {
      rows,
      columns,
      getRowId,
      size = 'md',
      rowHeight,
      sort: sortProp,
      defaultSort = null,
      onSortChange,
      manualSort = false,
      selectable = false,
      selected: selectedProp,
      defaultSelected,
      onSelectedChange,
      onRowAction,
      loading = false,
      loadingRows = 6,
      empty,
      actionsRef,
      render,
      className,
      style,
      ref,
      onKeyDown,
      onFocus,
      onClick,
      ...gridProps
    },
  ] = useSlot('DataTable.Root', props);
  const styled = !config.unstyled;
  const strings = config.strings;
  const baseId = React.useId();
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const headRef = React.useRef<HTMLDivElement | null>(null);
  const handle = React.useRef<VirtualizerHandle | null>(null);

  /* ids and order */
  const ids = React.useMemo(
    () => rows.map((r, i) => (getRowId ? getRowId(r, i) : i)),
    [rows, getRowId],
  );
  const [innerSort, setInnerSort] = React.useState<SortState | null>(defaultSort);
  const sort = sortProp === undefined ? innerSort : sortProp;
  const order = React.useMemo(
    () => (manualSort ? null : sortOrder(rows, columns, sort)),
    [rows, columns, sort, manualSort],
  );
  const view = React.useMemo(
    () => (order ? order.map((i) => rows[i] as Row) : rows),
    [order, rows],
  );
  const viewIds = React.useMemo(
    () => (order ? order.map((i) => ids[i] as RowId) : ids),
    [order, ids],
  );
  const count = loading ? 0 : view.length;

  /* selection */
  const [innerSelected, setInnerSelected] = React.useState<ReadonlySet<RowId>>(
    () => new Set(defaultSelected ?? []),
  );
  const selected = selectedProp ?? innerSelected;
  const anchor = React.useRef<RowId | null>(null);
  const shift = React.useRef(false);
  const selectedCount = React.useMemo(() => {
    if (!selectable) return 0;
    let n = 0;
    for (const id of ids) if (selected.has(id)) n++;
    return n;
  }, [selectable, ids, selected]);
  const allSelected = ids.length > 0 && selectedCount === ids.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const commit = (next: Set<RowId>): void => {
    if (selectedProp === undefined) setInnerSelected(next);
    onSelectedChange?.(next);
  };
  /** Toggle row `index`; with `range`, give every row from the anchor to it that new state. */
  const toggleRow = (index: number, range: boolean): void => {
    const id = viewIds[index];
    if (id === undefined) return;
    const on = !selected.has(id);
    const from = range && anchor.current !== null ? viewIds.indexOf(anchor.current) : -1;
    const [a, b] = from < 0 ? [index, index] : [Math.min(from, index), Math.max(from, index)];
    const next = new Set(selected);
    for (let i = a; i <= b; i++) {
      const k = viewIds[i] as RowId;
      if (on) next.add(k);
      else next.delete(k);
    }
    anchor.current = id;
    commit(next);
  };
  /** Add rows a..b (either order) to the selection: Shift+arrow. */
  const extend = (a: number, b: number): void => {
    const next = new Set(selected);
    for (let i = Math.min(a, b); i <= Math.max(a, b); i++) next.add(viewIds[i] as RowId);
    anchor.current ??= viewIds[a] ?? null;
    commit(next);
  };
  const toggleAll = (): void => {
    const next = new Set(selected);
    for (const id of ids) {
      if (allSelected) next.delete(id);
      else next.add(id);
    }
    anchor.current = null;
    commit(next);
  };

  // the checkbox cells call through a stable function, so memoised rows don't re-render for it
  const toggleRef = React.useRef(toggleRow);
  React.useLayoutEffect(() => {
    toggleRef.current = toggleRow;
  });
  const setShift = React.useCallback((held: boolean) => {
    shift.current = held;
  }, []);
  const toggle = React.useCallback((index: number) => {
    const range = shift.current;
    shift.current = false;
    toggleRef.current(index, range);
  }, []);

  /* sorting */
  const [announcement, setAnnouncement] = React.useState('');
  const cycleSort = (col: Column<Row>): void => {
    const now = sort?.column === col.id ? sort.direction : null;
    const next: SortState | null =
      now === null
        ? { column: col.id, direction: 'ascending' }
        : now === 'ascending'
          ? { column: col.id, direction: 'descending' }
          : null;
    if (sortProp === undefined) setInnerSort(next);
    onSortChange?.(next);
    setAnnouncement(strings.sortedBy(labelOf(col), next ? next.direction : 'none'));
  };

  /* the tab stop */
  const colCount = columns.length + (selectable ? 1 : 0);
  const [active, setActive] = React.useState({ row: -1, col: 0 });
  const activeRow = Math.min(active.row, count - 1);
  const activeCol = Math.max(0, Math.min(active.col, colCount - 1));
  const pendingFocus = React.useRef(false);
  const [head, setHead] = React.useState(0);

  const focusRun = React.useRef(0);
  React.useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const vp = viewportRef.current;
    if (!vp) return;
    const run = ++focusRun.current;
    const [row, col] = [activeRow, activeCol];
    let tries = 0;
    /*
     * A far row (Ctrl+End, Page Down) is mounted at once but stays hidden until virtua has
     * measured it, and hidden elements can't take focus: scroll to it, then try again each
     * frame until it can.
     */
    const attempt = (): void => {
      if (run !== focusRun.current) return;
      const cell = cellAt(vp, row, col);
      if (cell) {
        reveal(vp, cell, head, row < 0);
        const target = focusTarget(cell);
        target.focus({ preventScroll: true });
        if (target.ownerDocument.activeElement === target) return;
      }
      if (++tries < 12) requestAnimationFrame(attempt);
    };
    attempt();
  });

  const moveTo = (row: number, col: number): void => {
    pendingFocus.current = true;
    setActive({
      row: Math.max(-1, Math.min(row, count - 1)),
      col: Math.max(0, Math.min(col, colCount - 1)),
    });
  };

  React.useLayoutEffect(() => {
    const el = headRef.current;
    if (!el) return;
    setHead(el.offsetHeight);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.borderBoxSize?.[0];
      setHead(box ? box.blockSize : el.offsetHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pageSize = (): number => {
    const vp = viewportRef.current;
    const h = handle.current;
    const rowPx = (h && activeRow >= 0 ? h.getItemSize(activeRow) : 0) || 48;
    return Math.max(1, Math.floor(((vp?.clientHeight ?? 0) - head) / rowPx));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const t = e.target as HTMLElement;
    if (t.closest('input, textarea, select, [contenteditable="true"]')) return;
    const cell = t.closest<HTMLElement>('[aria-colindex]');
    if (!cell || !viewportRef.current?.contains(cell)) return;
    const onCell = t === cell;
    const mod = e.ctrlKey || e.metaKey;
    const r = activeRow;
    const c = activeCol;
    switch (e.key) {
      case 'ArrowDown':
        if (e.shiftKey && selectable && r >= 0 && r < count - 1) extend(r, r + 1);
        moveTo(r + 1, c);
        break;
      case 'ArrowUp':
        if (e.shiftKey && selectable && r > 0) extend(r, r - 1);
        moveTo(e.shiftKey && r === 0 ? 0 : r - 1, c);
        break;
      case 'ArrowRight':
        moveTo(r, c + 1);
        break;
      case 'ArrowLeft':
        moveTo(r, c - 1);
        break;
      case 'Home':
        moveTo(mod ? -1 : r, 0);
        break;
      case 'End':
        moveTo(mod ? count - 1 : r, colCount - 1);
        break;
      case 'PageDown':
        moveTo(r + pageSize(), c);
        break;
      case 'PageUp':
        moveTo(r < 0 ? r : Math.max(0, r - pageSize()), c);
        break;
      case ' ':
        if (!onCell || !selectable || r < 0) return;
        toggleRow(r, e.shiftKey);
        break;
      case 'Enter': {
        const row = view[r];
        if (!onCell || !onRowAction || row === undefined) return;
        onRowAction(row, viewIds[r] as RowId);
        break;
      }
      case 'a':
      case 'A':
        if (!mod || !selectable) return;
        if (!allSelected) toggleAll();
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>): void => {
    onFocus?.(e);
    const cell = (e.target as HTMLElement).closest<HTMLElement>('[aria-colindex]');
    const row = cell?.parentElement;
    if (!cell || !row?.hasAttribute('aria-rowindex')) return;
    const r = Number(row.getAttribute('aria-rowindex')) - 2;
    const c = Number(cell.getAttribute('aria-colindex')) - 1;
    if (r >= count) return;
    if (r !== active.row || c !== active.col) setActive({ row: r, col: c });
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    onClick?.(e);
    if (e.defaultPrevented || !onRowAction) return;
    const t = e.target as HTMLElement;
    if (t.closest(INTERACTIVE)) return;
    // finishing a text selection isn't a request to open the row
    if (document.getSelection()?.isCollapsed === false) return;
    const el = t.closest<HTMLElement>('[data-index]');
    if (!el) return;
    const i = Number(el.dataset.index);
    const row = view[i];
    if (row !== undefined) onRowAction(row, viewIds[i] as RowId);
  };

  React.useImperativeHandle(
    actionsRef,
    () => ({
      scrollToIndex(index, options = {}) {
        const h = handle.current;
        const vp = viewportRef.current;
        if (!h || !vp || !count) return;
        const i = Math.max(0, Math.min(count - 1, index));
        const smooth = options.behavior === 'smooth' && !prefersReducedMotion(vp);
        let align = options.align ?? 'auto';
        if (align === 'auto') {
          const top = head + h.getItemOffset(i);
          const bottom = top + h.getItemSize(i);
          if (top < vp.scrollTop + head) align = 'start';
          else if (bottom > vp.scrollTop + vp.clientHeight) align = 'end';
          else return;
        }
        h.scrollToIndex(i, {
          align,
          smooth,
          offset: align === 'start' ? -head : align === 'center' ? -head / 2 : 0,
        });
      },
    }),
    [count, head],
  );

  /* contexts */
  const nameCol = Math.max(
    0,
    columns.findIndex((c) => c.rowHeader),
  );
  const staticCtx = React.useMemo<StaticContext>(
    () => ({
      columns: columns as readonly Column<unknown>[],
      selectable,
      styled,
      size,
      baseId,
      nameCol,
      strings,
      toggle,
      setShift,
    }),
    [columns, selectable, styled, size, baseId, nameCol, strings, toggle, setShift],
  );
  const dynamicCtx = React.useMemo<DynamicContext>(
    () => ({ ids: viewIds, selected, activeRow }),
    [viewIds, selected, activeRow],
  );
  const keepMounted = React.useMemo(() => (activeRow >= 0 ? [activeRow] : undefined), [activeRow]);

  /* layout */
  const [tracks, minWidth] = React.useMemo(
    () => template(columns as readonly Column<never>[], selectable),
    [columns, selectable],
  );
  const fixed = typeof rowHeight === 'number' ? rowHeight : undefined;
  const estimate = fixed ?? (size === 'sm' ? 40 : 48);
  const rootStyle = React.useMemo(
    () =>
      ({
        '--_cols': tracks,
        '--_min': `${minWidth}px`,
        ...(fixed === undefined ? null : { '--_row': `${fixed}px` }),
        // a height you set is the height: lift the default cap
        ...(style?.height !== undefined && style.maxHeight === undefined
          ? { maxHeight: 'none' }
          : null),
        ...style,
      }) as React.CSSProperties,
    [tracks, minWidth, fixed, style],
  );

  /* header */
  const cellClass = styled ? 'hj-data-table-column-header' : undefined;
  const offset = selectable ? 1 : 0;
  const header = (
    <div role="row" aria-rowindex={1} className={styled ? 'hj-data-table-head-row' : undefined}>
      {selectable ? (
        <div role="columnheader" aria-colindex={1} data-select="" className={cellClass}>
          <Checkbox.Root
            size={size}
            checked={allSelected}
            indeterminate={someSelected}
            disabled={loading || ids.length === 0}
            onCheckedChange={toggleAll}
            tabIndex={activeRow === -1 && activeCol === 0 ? 0 : -1}
            aria-label={strings.selectAllRows}
          />
        </div>
      ) : null}
      {columns.map((col, c) => {
        const ci = c + offset;
        const tab = activeRow === -1 && activeCol === ci ? 0 : -1;
        const sortable = !!col.sortable && !!(col.value || col.compare);
        const direction = sort?.column === col.id ? sort.direction : 'none';
        const align = col.align ?? (col.numeric ? 'end' : 'start');
        return (
          <div
            key={col.id}
            role="columnheader"
            aria-colindex={ci + 1}
            aria-sort={sortable && direction !== 'none' ? direction : undefined}
            tabIndex={sortable ? undefined : tab}
            data-align={align}
            data-sort={sortable ? direction : undefined}
            className={cellClass}
          >
            {sortable ? (
              <button
                type="button"
                tabIndex={tab}
                className={styled ? 'hj-data-table-sort' : undefined}
                onClick={() => cycleSort(col)}
              >
                <span className={styled ? 'hj-data-table-sort-label' : undefined}>
                  {col.header}
                </span>
                <span
                  className={styled ? 'hj-data-table-sort-glyph' : undefined}
                  aria-hidden="true"
                >
                  {direction === 'none' ? SORT_IDLE : config.icons.arrowUp}
                </span>
              </button>
            ) : (
              col.header
            )}
          </div>
        );
      })}
    </div>
  );

  /* body */
  let body: React.ReactNode;
  if (loading) {
    body = (
      <LoadingRows
        columns={columns as readonly Column<never>[]}
        count={loadingRows}
        selectable={selectable}
        styled={styled}
        label={strings.loading}
      />
    );
  } else if (count === 0) {
    body = (
      <div role="rowgroup" className={styled ? 'hj-data-table-body' : undefined}>
        <div
          role="row"
          aria-rowindex={2}
          className={styled ? 'hj-data-table-empty-row' : undefined}
        >
          <div
            role="gridcell"
            aria-colindex={1}
            aria-colspan={colCount}
            className={styled ? 'hj-data-table-empty' : undefined}
          >
            {empty ?? strings.noRows}
          </div>
        </div>
      </div>
    );
  } else {
    body = (
      <Dynamic.Provider value={dynamicCtx}>
        <Virtualizer
          ref={handle}
          scrollRef={viewportRef}
          data={view}
          itemSize={rowHeight === 'auto' ? undefined : estimate}
          bufferSize={6 * estimate}
          startMargin={head}
          keepMounted={keepMounted}
          as={Body}
          item={RowItem}
        >
          {(row: Row, index: number) => {
            const id = viewIds[index] as RowId;
            return (
              <Cells
                key={id}
                row={row}
                index={index}
                selected={selectable && selected.has(id)}
                activeCol={index === activeRow ? activeCol : -1}
              />
            );
          }}
        </Virtualizer>
      </Dynamic.Provider>
    );
  }

  return useRender({
    render,
    ref,
    defaultTagName: 'div',
    props: {
      style: rootStyle,
      'data-size': size,
      'data-row-height': rowHeight === 'auto' ? 'auto' : undefined,
      'data-selectable': flag(selectable),
      'data-actionable': flag(!!onRowAction),
      'data-loading': flag(loading),
      className: cls(config, 'DataTable.Root', 'hj-data-table', className) as string | undefined,
      children: (
        <Static.Provider value={staticCtx}>
          {/* the grid isn't a tab stop itself: one cell inside it is (roving tabindex) */}
          {/* oxlint-disable-next-line jsx-a11y/interactive-supports-focus */}
          <div
            {...gridProps}
            ref={viewportRef}
            role="grid"
            // the header, then the rows (or the one row that says there are none)
            aria-rowcount={loading ? -1 : Math.max(count, 1) + 1}
            aria-colcount={colCount}
            aria-multiselectable={selectable || undefined}
            aria-busy={loading || undefined}
            className={styled ? 'hj-data-table-viewport' : undefined}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onClick={handleClick}
          >
            <div className={styled ? 'hj-data-table-canvas' : undefined}>
              <div
                role="rowgroup"
                ref={headRef}
                className={styled ? 'hj-data-table-head' : undefined}
              >
                {header}
              </div>
              {body}
            </div>
          </div>
          <span className="hj-sr-only" aria-live="polite">
            {announcement}
          </span>
        </Static.Provider>
      ),
    },
  });
}
