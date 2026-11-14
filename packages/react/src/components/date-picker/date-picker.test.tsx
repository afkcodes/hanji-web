import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { DateRange } from '../calendar/calendar.tsx';
import * as DatePicker from './date-picker.tsx';

const today = new Date(2026, 10, 14);
const cell = (iso: string): HTMLElement =>
  document.querySelector(`[data-date="${iso}"]`) as HTMLElement;

describe('DatePicker', () => {
  it('opens a calendar, picks a day, closes and writes it out', async () => {
    const onChange = vi.fn<(v: Date | null) => void>();
    render(
      <form data-testid="f">
        <DatePicker.Root today={today} locale="en-GB" name="due" onValueChange={onChange}>
          <DatePicker.Label>Due</DatePicker.Label>
          <DatePicker.Trigger placeholder="Pick a day" />
          <DatePicker.Content />
        </DatePicker.Root>
      </form>,
    );
    const trigger = document.querySelector('.hj-date-picker-trigger') as HTMLElement;
    expect(trigger.textContent).toContain('Pick a day');
    await userEvent.click(trigger);
    await waitFor(() => expect(cell('2026-11-20')).not.toBeNull());
    await userEvent.click(cell('2026-11-20'));
    expect(onChange.mock.calls[0]?.[0]?.getDate()).toBe(20);
    await waitFor(() => expect(trigger.textContent).toContain('20 Nov 2026'));
    await waitFor(() => expect(document.querySelector('.hj-calendar')).toBeNull());
    expect((document.querySelector('input[name="due"]') as HTMLInputElement).value).toBe(
      '2026-11-20',
    );
  });

  it('range: stays open after the start, closes after the end', async () => {
    const onChange = vi.fn<(v: DateRange) => void>();
    render(
      <DatePicker.Root mode="range" today={today} locale="en-GB" onValueChange={onChange}>
        <DatePicker.Label>Dates</DatePicker.Label>
        <DatePicker.Trigger />
        <DatePicker.Content />
      </DatePicker.Root>,
    );
    await userEvent.click(document.querySelector('.hj-date-picker-trigger') as HTMLElement);
    await waitFor(() => expect(cell('2026-11-18')).not.toBeNull());
    await userEvent.click(cell('2026-11-18'));
    expect(document.querySelector('.hj-calendar')).not.toBeNull();
    await userEvent.click(cell('2026-11-21'));
    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last?.end?.getDate()).toBe(21);
    await waitFor(() => expect(document.querySelector('.hj-calendar')).toBeNull());
    expect(screen.getByText(/18.*21 Nov 2026/)).toBeTruthy();
  });
});
