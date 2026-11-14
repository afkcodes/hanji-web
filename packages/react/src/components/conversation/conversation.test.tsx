import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import * as Conversation from './conversation.tsx';

describe('Conversation', () => {
  it('renders a polite log that is busy while streaming', () => {
    const { rerender } = render(
      <Conversation.Root>
        <Conversation.Viewport>
          <Conversation.Content>
            <p>Hello</p>
          </Conversation.Content>
        </Conversation.Viewport>
        <Conversation.JumpToLatest />
      </Conversation.Root>,
    );
    const log = screen.getByRole('log');
    expect(log.getAttribute('aria-live')).toBe('polite');
    expect(log.hasAttribute('aria-busy')).toBe(false);
    rerender(
      <Conversation.Root streaming>
        <Conversation.Viewport>
          <Conversation.Content>
            <p>Hello</p>
          </Conversation.Content>
        </Conversation.Viewport>
        <Conversation.JumpToLatest />
      </Conversation.Root>,
    );
    expect(screen.getByRole('log').getAttribute('aria-busy')).toBe('true');
  });

  it('Jump to latest is hidden and out of the tab order at the bottom', () => {
    const { container } = render(
      <Conversation.Root>
        <Conversation.Viewport>
          <Conversation.Content />
        </Conversation.Viewport>
        <Conversation.JumpToLatest />
      </Conversation.Root>,
    );
    const jump = container.querySelector('.hj-conversation-jump') as HTMLElement;
    expect(jump.hasAttribute('data-hidden')).toBe(true);
    expect(jump.getAttribute('tabindex')).toBe('-1');
    expect(jump.getAttribute('aria-hidden')).toBe('true');
  });
});
