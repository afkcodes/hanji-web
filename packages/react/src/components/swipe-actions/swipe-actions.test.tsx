import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as SwipeActions from './swipe-actions.tsx';

type Side = SwipeActions.Side | null;

interface RowProps {
  name?: string;
  open?: Side;
  defaultOpen?: Side;
  onOpenChange?: (open: Side, details: SwipeActions.OpenChangeDetails) => void;
  onRead?: () => void;
  onFlag?: () => void;
  onArchive?: () => void;
  disabled?: boolean;
  archiveDisabled?: boolean;
}

function Row({
  name = 'Quarterly numbers',
  onRead,
  onFlag,
  onArchive,
  archiveDisabled,
  ...rest
}: RowProps): React.JSX.Element {
  return (
    <SwipeActions.Root label={name} {...rest}>
      <SwipeActions.Leading fullSwipe>
        <SwipeActions.Action tone="info" icon="check" onAction={onRead}>
          Read
        </SwipeActions.Action>
      </SwipeActions.Leading>
      <SwipeActions.Content data-testid={`content-${name}`}>{name}</SwipeActions.Content>
      <SwipeActions.Trailing fullSwipe>
        <SwipeActions.Action tone="warning" onAction={onFlag}>
          Flag
        </SwipeActions.Action>
        <SwipeActions.Action tone="danger" removes disabled={archiveDisabled} onAction={onArchive}>
          Delete
        </SwipeActions.Action>
      </SwipeActions.Trailing>
    </SwipeActions.Root>
  );
}

/** A horizontal (or vertical) drag in even steps, all within one frame: no fling. */
function drag(el: HTMLElement, dx: number, dy = 0, steps = 8): void {
  const x = 300;
  const y = 20;
  fireEvent.pointerDown(el, { pointerId: 1, button: 0, isPrimary: true, clientX: x, clientY: y });
  for (let i = 1; i <= steps; i++) {
    fireEvent.pointerMove(window, {
      pointerId: 1,
      clientX: x + (dx * i) / steps,
      clientY: y + (dy * i) / steps,
    });
  }
  fireEvent.pointerUp(window, { pointerId: 1, clientX: x + dx, clientY: y + dy });
}

describe('SwipeActions', () => {
  beforeEach(() => {
    // happy-dom has no layout: a 400px row with 76px actions
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.hasAttribute('data-hj-swipe-action')) return 76;
      if (this.hasAttribute('data-hj-swipe-root')) return 400;
      return 0;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it('renders actions as real buttons, out of the tab order while closed', () => {
    render(<Row />);
    const flag = screen.getByRole('button', { name: 'Flag' });
    expect(flag.tabIndex).toBe(-1);
    expect(flag.getAttribute('data-tone')).toBe('warning');
    expect(screen.getByRole('button', { name: 'Delete' }).hasAttribute('data-removes')).toBe(true);
    expect(screen.getByRole('button', { name: 'More actions for Quarterly numbers' })).toBeTruthy();
  });

  it('puts the open side in the tab order (controlled)', () => {
    const { rerender } = render(<Row open="trailing" />);
    expect(screen.getByRole('button', { name: 'Flag' }).tabIndex).toBe(0);
    expect(screen.getByRole('button', { name: 'Read' }).tabIndex).toBe(-1);
    const root = screen.getByTestId('content-Quarterly numbers').parentElement as HTMLElement;
    expect(root.getAttribute('data-open')).toBe('trailing');
    rerender(<Row open={null} />);
    expect(screen.getByRole('button', { name: 'Flag' }).tabIndex).toBe(-1);
  });

  it('a tap on an action runs it and closes the row', () => {
    const onFlag = vi.fn<() => void>();
    const onOpenChange = vi.fn<(open: Side, d: SwipeActions.OpenChangeDetails) => void>();
    render(<Row defaultOpen="trailing" onFlag={onFlag} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Flag' }));
    expect(onFlag).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenLastCalledWith(null, { reason: 'action' });
  });

  it('the More menu lists every action (danger last) and runs them', async () => {
    const onRead = vi.fn<() => void>();
    render(<Row onRead={onRead} archiveDisabled />);
    await userEvent.click(
      screen.getByRole('button', { name: 'More actions for Quarterly numbers' }),
    );
    await screen.findByRole('menu');
    const items = screen.getAllByRole('menuitem');
    expect(items.map((i) => i.textContent)).toEqual(['Read', 'Flag', 'Delete']);
    expect(items[2]?.getAttribute('data-tone')).toBe('danger');
    expect(items[2]?.hasAttribute('data-disabled')).toBe(true);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Read' }));
    expect(onRead).toHaveBeenCalledOnce();
  });

  it('a sideways swipe opens the side it reveals; a vertical one scrolls', () => {
    const onOpenChange = vi.fn<(open: Side, d: SwipeActions.OpenChangeDetails) => void>();
    render(<Row onOpenChange={onOpenChange} />);
    const content = screen.getByTestId('content-Quarterly numbers');
    drag(content, 4, 120);
    expect(onOpenChange).not.toHaveBeenCalled();
    drag(content, -130);
    expect(onOpenChange).toHaveBeenLastCalledWith('trailing', { reason: 'swipe' });
  });

  it('a two-finger trackpad swipe opens a side; a scroll and a pinch do not', () => {
    vi.useFakeTimers();
    try {
      const onOpenChange = vi.fn<(open: Side, d: SwipeActions.OpenChangeDetails) => void>();
      render(<Row onOpenChange={onOpenChange} />);
      const content = screen.getByTestId('content-Quarterly numbers');
      // happy-dom's WheelEvent drops some init fields, so set them on the event itself
      const wheel = (deltaX: number, deltaY = 0, ctrlKey = false): boolean => {
        const ev = new WheelEvent('wheel', { bubbles: true, cancelable: true });
        for (const [k, v] of Object.entries({ deltaX, deltaY, deltaMode: 0, ctrlKey })) {
          Object.defineProperty(ev, k, { value: v });
        }
        return content.dispatchEvent(ev);
      };
      // a scroll with a little sideways drift stays the page's
      for (let i = 0; i < 6; i++) expect(wheel(2, 24)).toBe(true);
      act(() => vi.advanceTimersByTime(200));
      // a pinch-zoom is the browser's
      for (let i = 0; i < 6; i++) wheel(30, 0, true);
      act(() => vi.advanceTimersByTime(200));
      expect(onOpenChange).not.toHaveBeenCalled();
      // fingers left → content left: the sideways travel is taken from the page
      let reached = true;
      for (let i = 0; i < 12; i++) reached = wheel(14) && reached;
      expect(reached).toBe(false);
      act(() => vi.advanceTimersByTime(200));
      expect(onOpenChange).toHaveBeenLastCalledWith('trailing', { reason: 'swipe' });
      // and back the other way closes it
      for (let i = 0; i < 12; i++) wheel(-14);
      act(() => vi.advanceTimersByTime(200));
      expect(onOpenChange).toHaveBeenLastCalledWith(null, { reason: 'swipe' });
    } finally {
      vi.useRealTimers();
    }
  });

  it('a short swipe snaps back closed', () => {
    const onOpenChange = vi.fn<(open: Side, d: SwipeActions.OpenChangeDetails) => void>();
    render(<Row onOpenChange={onOpenChange} />);
    drag(screen.getByTestId('content-Quarterly numbers'), -40);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('a tap on an open row closes it instead of activating it', () => {
    const onClick = vi.fn<() => void>();
    const onOpenChange = vi.fn<(open: Side, d: SwipeActions.OpenChangeDetails) => void>();
    render(
      <SwipeActions.Root defaultOpen="trailing" onOpenChange={onOpenChange}>
        <SwipeActions.Content data-testid="row" onClick={onClick}>
          Row
        </SwipeActions.Content>
        <SwipeActions.Trailing>
          <SwipeActions.Action>Flag</SwipeActions.Action>
        </SwipeActions.Trailing>
      </SwipeActions.Root>,
    );
    const row = screen.getByTestId('row');
    fireEvent.pointerDown(row, { pointerId: 1, button: 0, isPrimary: true, clientX: 10 });
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 10 });
    fireEvent.click(row, { detail: 1 });
    expect(onClick).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenLastCalledWith(null, { reason: 'tap' });
  });

  it('a full swipe commits the outermost action: the row leaves, then onAction fires', async () => {
    const onArchive = vi.fn<() => void>();
    render(
      <SwipeActions.Group>
        <Row onArchive={onArchive} />
      </SwipeActions.Group>,
    );
    const content = screen.getByTestId('content-Quarterly numbers');
    drag(content, -320, 0, 16);
    expect(onArchive).not.toHaveBeenCalled();
    await waitFor(() => expect(onArchive).toHaveBeenCalledOnce(), { timeout: 3000 });
    await waitFor(
      () =>
        expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe(
          'Delete: Quarterly numbers. Done.',
        ),
      { timeout: 1000 },
    );
  });

  it('opening a row in a group closes the open one', () => {
    const a = vi.fn<(open: Side, d: SwipeActions.OpenChangeDetails) => void>();
    render(
      <SwipeActions.Group>
        <Row name="A" defaultOpen="trailing" onOpenChange={a} />
        <Row name="B" />
      </SwipeActions.Group>,
    );
    act(() => screen.getAllByRole('button', { name: 'Read' })[1]?.focus());
    expect(a).toHaveBeenLastCalledWith(null, { reason: 'group' });
  });

  it('a tap on another row of the group only closes the open one', () => {
    const a = vi.fn<(open: Side, d: SwipeActions.OpenChangeDetails) => void>();
    const onClickB = vi.fn<() => void>();
    render(
      <SwipeActions.Group>
        <Row name="A" defaultOpen="trailing" onOpenChange={a} />
        <SwipeActions.Root>
          <SwipeActions.Content data-testid="B" onClick={onClickB}>
            B
          </SwipeActions.Content>
        </SwipeActions.Root>
      </SwipeActions.Group>,
    );
    const b = screen.getByTestId('B');
    fireEvent.pointerDown(b, { pointerId: 2, button: 0, isPrimary: true, clientX: 10 });
    fireEvent.pointerUp(window, { pointerId: 2, clientX: 10 });
    fireEvent.click(b, { detail: 1 });
    expect(a).toHaveBeenLastCalledWith(null, { reason: 'outside' });
    expect(onClickB).not.toHaveBeenCalled();
    fireEvent.click(b, { detail: 1 });
    expect(onClickB).toHaveBeenCalledOnce();
  });

  it('a press outside closes; Escape closes', () => {
    const onOpenChange = vi.fn<(open: Side, d: SwipeActions.OpenChangeDetails) => void>();
    render(
      <>
        <Row defaultOpen="leading" onOpenChange={onOpenChange} />
        <button type="button">Elsewhere</button>
      </>,
    );
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(null, { reason: 'outside' });
  });

  it('Escape closes the open row', () => {
    const onOpenChange = vi.fn<(open: Side, d: SwipeActions.OpenChangeDetails) => void>();
    render(<Row defaultOpen="trailing" onOpenChange={onOpenChange} />);
    const flag = screen.getByRole('button', { name: 'Flag' });
    act(() => flag.focus());
    fireEvent.keyDown(flag, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenLastCalledWith(null, { reason: 'escape' });
  });

  it('focusing an action opens its side', () => {
    const onOpenChange = vi.fn<(open: Side, d: SwipeActions.OpenChangeDetails) => void>();
    render(<Row onOpenChange={onOpenChange} />);
    act(() => screen.getByRole('button', { name: 'Read' }).focus());
    expect(onOpenChange).toHaveBeenLastCalledWith('leading', { reason: 'focus' });
  });

  it('a locked row neither swipes nor offers its actions', () => {
    const onOpenChange = vi.fn<(open: Side, d: SwipeActions.OpenChangeDetails) => void>();
    render(<Row disabled onOpenChange={onOpenChange} />);
    drag(screen.getByTestId('content-Quarterly numbers'), -200);
    expect(onOpenChange).not.toHaveBeenCalled();
    const more = screen.getByRole('button', { name: 'More actions for Quarterly numbers' });
    expect(more.hasAttribute('disabled') || more.hasAttribute('data-disabled')).toBe(true);
    expect((screen.getByRole('button', { name: 'Flag' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('a controlled parent that refuses keeps the row where it was', () => {
    const onOpenChange = vi.fn<(open: Side, d: SwipeActions.OpenChangeDetails) => void>();
    render(<Row open={null} onOpenChange={onOpenChange} />);
    drag(screen.getByTestId('content-Quarterly numbers'), -130);
    expect(onOpenChange).toHaveBeenLastCalledWith('trailing', { reason: 'swipe' });
    expect(screen.getByRole('button', { name: 'Flag' }).tabIndex).toBe(-1);
  });
});
