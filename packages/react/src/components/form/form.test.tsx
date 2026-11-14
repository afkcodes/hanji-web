import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import * as Field from '../field/field.tsx';
import * as Form from './form.tsx';

describe('Form', () => {
  it('lays out and shows server errors per field', () => {
    const errors = { email: 'That address is already registered.' };
    render(
      <Form.Root layout="grid" errors={errors}>
        <Field.Root name="email">
          <Field.Label>Email</Field.Label>
          <Field.Control defaultValue="mira@example.com" />
          <Field.Error match={!!errors.email}>{errors.email}</Field.Error>
        </Field.Root>
      </Form.Root>,
    );
    const form = document.querySelector('form') as HTMLFormElement;
    expect(form.className).toContain('hj-form');
    expect(form.getAttribute('data-layout')).toBe('grid');
    expect(screen.getByText('That address is already registered.')).toBeTruthy();
  });

  it('ErrorSummary lists errors, takes focus, and links focus the field', async () => {
    render(
      <Form.Root>
        <Form.ErrorSummary
          errors={{ handle: '@mira is taken.', email: ['Use an inbox you can open.'] }}
        />
        <input name="handle" aria-label="Handle" />
        <input name="email" aria-label="Email" />
      </Form.Root>,
    );
    const summary = screen.getByRole('alert');
    expect(document.activeElement).toBe(summary);
    expect(screen.getAllByRole('link').map((a) => a.textContent)).toEqual([
      '@mira is taken.',
      'Use an inbox you can open.',
    ]);
    await userEvent.click(screen.getByRole('link', { name: 'Use an inbox you can open.' }));
    expect(document.activeElement).toBe(screen.getByLabelText('Email'));
  });

  it('ErrorSummary renders nothing without errors', () => {
    const { container } = render(<Form.ErrorSummary errors={{}} />);
    expect(container.innerHTML).toBe('');
  });
});
