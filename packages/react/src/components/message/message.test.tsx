import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import * as Message from './message.tsx';

describe('Message', () => {
  it('marks author and status as data hooks; streaming sets aria-busy', () => {
    const { container } = render(
      <Message.Root from="user" status="streaming">
        <Message.Content>Hi</Message.Content>
      </Message.Root>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe('hj-message');
    expect(root.dataset.from).toBe('user');
    expect(root.getAttribute('aria-busy')).toBe('true');
    expect(root.hasAttribute('data-streaming')).toBe(true);
  });

  it('Error is an alert with a glyph, the sentence and an action', () => {
    render(
      <Message.Root status="error">
        <Message.Error action={<button type="button">Retry</button>}>
          The connection dropped.
        </Message.Error>
      </Message.Root>,
    );
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('The connection dropped.');
    expect(alert.querySelector('svg')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });
});
