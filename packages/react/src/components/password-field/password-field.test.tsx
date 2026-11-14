import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import * as PasswordField from './password-field.tsx';
import { estimateStrength } from './password-field.tsx';

function Create(): React.JSX.Element {
  return (
    <PasswordField.Root>
      <PasswordField.Label>New password</PasswordField.Label>
      <PasswordField.Input />
      <PasswordField.Strength />
    </PasswordField.Root>
  );
}

describe('PasswordField', () => {
  it('reveals and hides the password with a labelled toggle', async () => {
    render(<Create />);
    const input = screen.getByLabelText('New password') as HTMLInputElement;
    expect(input.type).toBe('password');
    const toggle = screen.getByRole('button', { name: 'Show password' });
    await userEvent.click(toggle);
    expect(input.type).toBe('text');
    expect(screen.getByRole('button', { name: 'Hide password' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  it('builds strength as you type', async () => {
    render(<Create />);
    const input = screen.getByLabelText('New password');
    const strength = document.querySelector('.hj-password-field-strength') as HTMLElement;
    expect(strength.getAttribute('data-score')).toBe('0');
    await userEvent.type(input, 'Night-Bus-To-Bilbao');
    expect(strength.getAttribute('data-score')).toBe('4');
    expect(strength.textContent).toContain('Strong · 19 characters');
  });

  it('estimateStrength: length first, then variety', () => {
    expect(estimateStrength('').score).toBe(0);
    expect(estimateStrength('abc').label).toBe('Too short');
    expect(estimateStrength('abcdefgh').score).toBe(1);
    expect(estimateStrength('abcdefghijkl').score).toBe(2);
    expect(estimateStrength('Abcdefghijkl9').score).toBe(4);
  });
});
