import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as DataTable from './data-table.tsx';
import type { Column, RowId, SortState } from './data-table.tsx';

/*
 * happy-dom has no layout, so a stand-in ResizeObserver reports sizes the way a browser would:
 * a 400 px viewport, a 40 px header and 48 px rows. That is all virtua needs to window the rows.
 * virtua only measures rows that are laid out (have an offsetParent), so rows get one too.
 */
const RealRO = globalThis.ResizeObserver;
const realOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
class FakeResizeObserver {
  constructor(private cb: ResizeObserverCallback) {}
  observe(target: Element): void {
    const list = (target as HTMLElement).classList;
    const size = list.contains('hj-data-table-viewport')
      ? 400
      : list.contains('hj-data-table-head')
        ? 40
        : 48;
    queueMicrotask(() =>
      this.cb(
        [
          {
            target,
            contentRect: { width: 800, height: size } as DOMRectReadOnly,
            borderBoxSize: [{ inlineSize: 800, blockSize: size }],
            contentBoxSize: [{ inlineSize: 800, blockSize: size }],
            devicePixelContentBoxSize: [],
          } as unknown as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver,
      ),
    );
  }
  unobserve(): void {}
  disconnect(): void {}
}
beforeEach(() => {
  globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get(this: HTMLElement) {
      return this.parentElement;
    },
  });
});
afterEach(() => {
  globalThis.ResizeObserver = RealRO;
  if (realOffsetParent)
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', realOffsetParent);
  else Reflect.deleteProperty(HTMLElement.prototype, 'offsetParent');
});

/** Let virtua measure: the observer reports, then the rows it measured become visible. */
const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0));
const flush = (): Promise<void> =>
  act(async () => {
    await tick();
    await tick();
    await tick();
  });

type Person = { id: string; name: string; amount: number | null; team: string };
const PEOPLE: Person[] = [
  { id: 'a', name: 'Mira Okafor', amount: 120, team: 'Ops' },
  { id: 'b', name: 'Jun-seo Park', amount: -40, team: 'Design' },
  { id: 'c', name: 'Ilse Brandt', amount: null, team: 'Ops' },
  { id: 'd', name: 'Tomás Reyes', amount: 9, team: 'Finance' },
  { id: 'e', name: 'aiko Sato', amount: 120, team: 'Design' },
];
const COLUMNS: Column<Person>[] = [
  { id: 'name', header: 'Name', rowHeader: true, sortable: true, value: (p) => p.name },
  { id: 'team', header: 'Team', value: (p) => p.team },
  { id: 'amount', header: 'Amount', numeric: true, sortable: true, value: (p) => p.amount },
];
const getId = (p: Person): string => p.id;

/** Row-header text, top to bottom, of the rows rendered. */
function names(): string[] {
  return screen.getAllByRole('rowheader').map((c) => c.textContent ?? '');
}
/** A row's checkbox, by the row's name. */
function box(name: string): HTMLElement {
  return screen.getByRole('checkbox', { name: `Select row ${name}` });
}

describe('DataTable', () => {
  it('renders a window of 10,000 rows as a grid that knows its whole shape', async () => {
    const rows = Array.from({ length: 10_000 }, (_, i) => ({ id: i, label: `Row ${i + 1}` }));
    render(
      <DataTable.Root
        aria-label="Ledger"
        rows={rows}
        columns={[{ id: 'label', header: 'Label', value: (r: { label: string }) => r.label }]}
      />,
    );
    await flush();
    const grid = screen.getByRole('grid', { name: 'Ledger' });
    expect(grid.getAttribute('aria-rowcount')).toBe('10001');
    expect(grid.getAttribute('aria-colcount')).toBe('1');
    const body = grid.querySelectorAll('[role="row"][data-index]');
    expect(body.length).toBeGreaterThan(0);
    expect(body.length).toBeLessThan(40);
    expect(body[0]?.getAttribute('aria-rowindex')).toBe('2');
    expect(screen.getByRole('columnheader', { name: 'Label' }).getAttribute('aria-colindex')).toBe(
      '1',
    );
  });

  it('cycles a column ascending → descending → none, empties last, and announces it', async () => {
    const onSortChange = vi.fn<(s: SortState | null) => void>();
    render(
      <DataTable.Root
        aria-label="People"
        rows={PEOPLE}
        columns={COLUMNS}
        getRowId={getId}
        onSortChange={onSortChange}
      />,
    );
    await flush();
    const header = screen.getByRole('columnheader', { name: /Amount/ });
    const button = within(header).getByRole('button');
    expect(header.hasAttribute('aria-sort')).toBe(false);

    fireEvent.click(button);
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    expect(names()).toEqual([
      'Jun-seo Park',
      'Tomás Reyes',
      'Mira Okafor',
      'aiko Sato',
      'Ilse Brandt',
    ]);
    expect(onSortChange).toHaveBeenLastCalledWith({ column: 'amount', direction: 'ascending' });
    expect(screen.getByText('Sorted by Amount, ascending')).toBeTruthy();

    fireEvent.click(button);
    expect(header.getAttribute('aria-sort')).toBe('descending');
    // stable: equal amounts keep their order; the empty one stays last
    expect(names()).toEqual([
      'Mira Okafor',
      'aiko Sato',
      'Tomás Reyes',
      'Jun-seo Park',
      'Ilse Brandt',
    ]);

    fireEvent.click(button);
    expect(header.hasAttribute('aria-sort')).toBe(false);
    expect(names()).toEqual(PEOPLE.map((p) => p.name));
    expect(onSortChange).toHaveBeenLastCalledWith(null);
  });

  it('sorts text by collation, takes a column comparator, and leaves manual sorts alone', async () => {
    const byTeam: Column<Person>[] = [
      COLUMNS[0] as Column<Person>,
      {
        id: 'team',
        header: 'Team',
        sortable: true,
        compare: (a, b) => a.team.length - b.team.length,
      },
    ];
    const { rerender } = render(
      <DataTable.Root
        aria-label="People"
        rows={PEOPLE}
        columns={byTeam}
        getRowId={getId}
        defaultSort={{ column: 'name', direction: 'ascending' }}
      />,
    );
    await flush();
    // “aiko” sorts with the As, not after every capital
    expect(names()).toEqual([
      'aiko Sato',
      'Ilse Brandt',
      'Jun-seo Park',
      'Mira Okafor',
      'Tomás Reyes',
    ]);

    rerender(
      <DataTable.Root
        aria-label="People"
        rows={PEOPLE}
        columns={byTeam}
        getRowId={getId}
        sort={{ column: 'team', direction: 'descending' }}
      />,
    );
    expect(names()).toEqual([
      'Tomás Reyes',
      'Jun-seo Park',
      'aiko Sato',
      'Mira Okafor',
      'Ilse Brandt',
    ]);

    rerender(
      <DataTable.Root
        aria-label="People"
        rows={PEOPLE}
        columns={byTeam}
        getRowId={getId}
        manualSort
        sort={{ column: 'team', direction: 'descending' }}
      />,
    );
    expect(names()).toEqual(PEOPLE.map((p) => p.name));
  });

  it('selects rows, all rows (indeterminate between) and Shift-click ranges', async () => {
    const onSelectedChange = vi.fn<(s: Set<RowId>) => void>();
    render(
      <DataTable.Root
        aria-label="People"
        rows={PEOPLE}
        columns={COLUMNS}
        getRowId={getId}
        selectable
        onSelectedChange={onSelectedChange}
      />,
    );
    await flush();
    const grid = screen.getByRole('grid');
    expect(grid.getAttribute('aria-multiselectable')).toBe('true');
    const all = screen.getByRole('checkbox', { name: 'Select all rows' });
    fireEvent.click(box('Jun-seo Park'));
    expect([...(onSelectedChange.mock.lastCall?.[0] ?? [])]).toEqual(['b']);
    expect(box('Jun-seo Park').closest('[role="row"]')?.getAttribute('aria-selected')).toBe('true');
    expect(all.hasAttribute('data-indeterminate')).toBe(true);

    // Shift-click: every row from the last one ticked
    fireEvent.pointerDown(box('Tomás Reyes'), { shiftKey: true });
    fireEvent.click(box('Tomás Reyes'), { shiftKey: true });
    expect([...(onSelectedChange.mock.lastCall?.[0] ?? [])].toSorted()).toEqual(['b', 'c', 'd']);

    fireEvent.click(all);
    expect(onSelectedChange.mock.lastCall?.[0].size).toBe(5);
    expect(all.hasAttribute('data-checked')).toBe(true);
    fireEvent.click(all);
    expect(onSelectedChange.mock.lastCall?.[0].size).toBe(0);
  });

  it('moves one tab stop with the arrows; Space selects and Enter opens', async () => {
    const onRowAction = vi.fn<(row: Person, id: RowId) => void>();
    const onSelectedChange = vi.fn<(s: Set<RowId>) => void>();
    render(
      <DataTable.Root
        aria-label="People"
        rows={PEOPLE}
        columns={COLUMNS}
        getRowId={getId}
        selectable
        onSelectedChange={onSelectedChange}
        onRowAction={onRowAction}
      />,
    );
    await flush();
    const grid = screen.getByRole('grid');
    // exactly one tab stop: the select-all checkbox, top left
    const stops = grid.querySelectorAll('[tabindex="0"]');
    expect(stops).toHaveLength(1);
    const all = screen.getByRole('checkbox', { name: 'Select all rows' });
    expect(stops[0]).toBe(all);

    act(() => all.focus());
    fireEvent.keyDown(all, { key: 'ArrowRight' });
    const nameHeader = within(screen.getByRole('columnheader', { name: /Name/ })).getByRole(
      'button',
    );
    expect(document.activeElement).toBe(nameHeader);

    fireEvent.keyDown(nameHeader, { key: 'ArrowDown' });
    expect(document.activeElement?.textContent).toBe('Mira Okafor');
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' });
    expect(document.activeElement?.textContent).toBe('Jun-seo Park');
    fireEvent.keyDown(document.activeElement as Element, { key: 'End' });
    expect(document.activeElement?.getAttribute('aria-colindex')).toBe('4');
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' });
    expect(document.activeElement?.getAttribute('role')).toBe('checkbox');
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    expect(grid.querySelectorAll('[tabindex="0"]')).toHaveLength(1);

    fireEvent.keyDown(document.activeElement as Element, { key: ' ' });
    expect([...(onSelectedChange.mock.lastCall?.[0] ?? [])]).toEqual(['b']);
    fireEvent.keyDown(document.activeElement as Element, { key: 'Enter' });
    expect(onRowAction).toHaveBeenLastCalledWith(PEOPLE[1], 'b');

    fireEvent.keyDown(document.activeElement as Element, { key: 'End', ctrlKey: true });
    expect(document.activeElement?.closest('[role="row"]')?.getAttribute('aria-rowindex')).toBe(
      '6',
    );
    fireEvent.keyDown(document.activeElement as Element, { key: 'a', metaKey: true });
    expect(onSelectedChange.mock.lastCall?.[0].size).toBe(5);
  });

  it('opens a row on click, but not from its checkbox', async () => {
    const onRowAction = vi.fn<(row: Person, id: RowId) => void>();
    render(
      <DataTable.Root
        aria-label="People"
        rows={PEOPLE}
        columns={COLUMNS}
        getRowId={getId}
        selectable
        onRowAction={onRowAction}
      />,
    );
    await flush();
    fireEvent.click(screen.getByText('Ilse Brandt'));
    expect(onRowAction).toHaveBeenCalledWith(PEOPLE[2], 'c');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select row Ilse Brandt' }));
    expect(onRowAction).toHaveBeenCalledTimes(1);
  });

  it('shows skeleton rows while loading and the empty slot when there is nothing', () => {
    const { rerender } = render(
      <DataTable.Root aria-label="People" rows={[]} columns={COLUMNS} loading loadingRows={3} />,
    );
    const grid = screen.getByRole('grid', { name: 'People' });
    expect(grid.getAttribute('aria-busy')).toBe('true');
    expect(grid.querySelectorAll('[data-loading]')).toHaveLength(3);
    expect(screen.getByText('Loading')).toBeTruthy();

    rerender(
      <DataTable.Root aria-label="People" rows={[]} columns={COLUMNS} empty="No people match" />,
    );
    const cell = screen.getByText('No people match');
    expect(cell.getAttribute('aria-colspan')).toBe('3');
    // the header and the row that says why
    expect(grid.getAttribute('aria-rowcount')).toBe('2');
  });

  it('lets rows grow to fit their text when rowHeight is auto', async () => {
    const { container } = render(
      <DataTable.Root aria-label="People" rows={PEOPLE} columns={COLUMNS} rowHeight="auto" />,
    );
    await flush();
    expect(container.querySelector('.hj-data-table')?.getAttribute('data-row-height')).toBe('auto');
    expect(screen.getAllByRole('rowheader')).toHaveLength(5);
  });

  it('draws a fixed row height and a column template every row shares', () => {
    const { container } = render(
      <DataTable.Root
        aria-label="People"
        rows={PEOPLE}
        columns={COLUMNS}
        rowHeight={56}
        selectable
      />,
    );
    const root = container.querySelector<HTMLElement>('.hj-data-table');
    expect(root?.style.getPropertyValue('--_row')).toBe('56px');
    expect(root?.style.getPropertyValue('--_cols')).toBe(
      '44px minmax(120px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr)',
    );
    expect(root?.style.getPropertyValue('--_min')).toBe('404px');
  });
});
