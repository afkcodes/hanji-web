import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as Calendar from './calendar.tsx';
import type { DateRange } from './calendar.tsx';
import { addMonths, monthGrid } from './dates.ts';

const today = new Date(2026, 10, 14); // Sat 14 Nov 2026

const day = (d: number): HTMLElement =>
  document.querySelector(`[data-date="2026-11-${String(d).padStart(2, '0')}"]`) as HTMLElement;

describe('Calendar', () => {
  it('shows six weeks starting on the locale week start, with today marked', () => {
    render(<Calendar.Root today={today} locale="en-GB" weekStartsOn={1} />);
    expect(screen.getByRole('heading').textContent).toBe('November 2026');
    expect(document.querySelectorAll('.hj-calendar-day').length).toBe(42);
    expect(day(14).getAttribute('aria-current')).toBe('date');
    expect(document.querySelector('.hj-calendar-weekday')?.getAttribute('abbr')).toBe('Monday');
  });

  it('selects a day and skips disabled ones', async () => {
    const onChange = vi.fn<(d: Date | null) => void>();
    render(
      <Calendar.Root
        today={today}
        onValueChange={onChange}
        isDateDisabled={(d) => d.getDate() === 20}
      />,
    );
    await userEvent.click(day(18));
    expect(onChange.mock.calls[0]?.[0]?.getDate()).toBe(18);
    expect(day(18).hasAttribute('data-selected')).toBe(true);
    await userEvent.click(day(20));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('picks a range in two clicks and draws the band', async () => {
    const onChange = vi.fn<(r: DateRange) => void>();
    render(<Calendar.Root mode="range" today={today} onValueChange={onChange} />);
    await userEvent.click(day(16));
    await userEvent.click(day(12));
    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last?.start?.getDate()).toBe(12);
    expect(last?.end?.getDate()).toBe(16);
    expect(day(14).closest('td')?.hasAttribute('data-in-range')).toBe(true);
  });

  it('moves focus with the keyboard and pages months', async () => {
    render(<Calendar.Root today={today} defaultValue={today} />);
    day(14).focus();
    fireEvent.keyDown(day(14), { key: 'ArrowDown' });
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-11-21');
    fireEvent.keyDown(document.activeElement as Element, { key: 'PageDown' });
    expect(screen.getByRole('heading').textContent).toBe('December 2026');
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-12-21');
  });

  it('stops paging at min', () => {
    render(<Calendar.Root today={today} min={new Date(2026, 10, 3)} />);
    expect((screen.getByRole('button', { name: 'Previous' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('date helpers: grid and month clamping', () => {
    expect(monthGrid(today, 0)[0]?.getDate()).toBe(1); // Nov 2026 starts on a Sunday
    expect(addMonths(new Date(2026, 0, 31), 1).getDate()).toBe(28);
  });
});
