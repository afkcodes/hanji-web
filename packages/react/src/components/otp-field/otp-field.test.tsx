import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as OTPField from './otp-field.tsx';

describe('OTPField', () => {
  it('renders and labels `length` cells when childless', () => {
    render(<OTPField.Root length={6} aria-label="Code" />);
    const cells = document.querySelectorAll('.hj-otp-field-input');
    expect(cells.length).toBe(6);
    expect(cells[1]?.getAttribute('aria-label')).toBe('Character 2 of 6');
  });

  it('completes on typing and reports the code', async () => {
    const onComplete = vi.fn<(v: string) => void>();
    render(<OTPField.Root length={4} onValueComplete={onComplete} />);
    const first = document.querySelector('.hj-otp-field-input') as HTMLInputElement;
    first.focus();
    await userEvent.keyboard('1234');
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(onComplete.mock.calls[0]?.[0]).toBe('1234');
  });

  it('marks a paste for the cascade, and exposes status', async () => {
    const { container } = render(<OTPField.Root length={4} status="error" />);
    const root = container.querySelector('.hj-otp-field') as HTMLElement;
    expect(root.getAttribute('data-status')).toBe('error');
    const first = container.querySelector('.hj-otp-field-input') as HTMLInputElement;
    fireEvent.paste(first, { clipboardData: { getData: () => '9876' } });
    await waitFor(() => expect(root.hasAttribute('data-pasting')).toBe(true));
    expect(screen.getAllByDisplayValue(/\d/).length).toBeGreaterThan(0);
  });
});
