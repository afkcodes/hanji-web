import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import * as DragList from './drag-list.tsx';

function List({ onReorder }: { onReorder: (from: number, to: number) => void }): React.JSX.Element {
  return (
    <DragList.Root aria-label="Up next" onReorder={onReorder}>
      {['Low Tide', 'Glasshouse', 'Salt & Cedar'].map((t) => (
        <DragList.Item key={t} label={t}>
          {t}
          <DragList.Handle />
        </DragList.Item>
      ))}
    </DragList.Root>
  );
}

describe('DragList', () => {
  it('moves an array item', () => {
    expect(DragList.reorder(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(DragList.reorder(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('puts one row in the tab order and describes the keys', () => {
    render(<List onReorder={() => {}} />);
    const items = screen.getAllByRole('listitem');
    expect(items.map((i) => i.tabIndex)).toEqual([0, -1, -1]);
    expect(items[0]?.getAttribute('aria-roledescription')).toBe('reorderable item');
    expect(screen.getByRole('list').getAttribute('aria-describedby')).toBeTruthy();
  });

  it('reorders with the keyboard twin', () => {
    vi.useFakeTimers();
    const onReorder = vi.fn<(from: number, to: number) => void>();
    render(<List onReorder={onReorder} />);
    const first = screen.getAllByRole('listitem')[0] as HTMLElement;
    first.focus();
    fireEvent.keyDown(first, { key: ' ' });
    expect(first.hasAttribute('data-held')).toBe(true);
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    fireEvent.keyDown(first, { key: ' ' });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onReorder).toHaveBeenCalledWith(0, 2);
    vi.useRealTimers();
  });

  it('cancels with Escape', () => {
    vi.useFakeTimers();
    const onReorder = vi.fn<(from: number, to: number) => void>();
    render(<List onReorder={onReorder} />);
    const first = screen.getAllByRole('listitem')[0] as HTMLElement;
    first.focus();
    fireEvent.keyDown(first, { key: 'Enter' });
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    fireEvent.keyDown(first, { key: 'Escape' });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onReorder).not.toHaveBeenCalled();
    expect(first.hasAttribute('data-held')).toBe(false);
    vi.useRealTimers();
  });

  it('moves focus between rows with the arrows', () => {
    render(<List onReorder={() => {}} />);
    const items = screen.getAllByRole('listitem');
    (items[0] as HTMLElement).focus();
    fireEvent.keyDown(items[0] as HTMLElement, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[1]);
    expect(items.map((i) => i.tabIndex)).toEqual([-1, 0, -1]);
  });
});
