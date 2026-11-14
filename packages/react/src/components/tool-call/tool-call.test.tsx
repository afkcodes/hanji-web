import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import * as ToolCall from './tool-call.tsx';

describe('ToolCall', () => {
  it('shows status as a word with a glyph and toggles its panel', async () => {
    render(
      <ToolCall.Root status="failed">
        <ToolCall.Trigger>
          <ToolCall.Name>lyrics.fetch</ToolCall.Name>
          <ToolCall.Status duration="5.0 s" />
        </ToolCall.Trigger>
        <ToolCall.Panel>
          <ToolCall.Code value={{ a: 1 }} />
        </ToolCall.Panel>
      </ToolCall.Root>,
    );
    const trigger = screen.getByRole('button');
    expect(trigger.textContent).toContain('Failed');
    expect(trigger.textContent).toContain('5.0 s');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/"a": 1/)).toBeTruthy();
  });

  it('needs-approval opens by default', () => {
    render(
      <ToolCall.Root status="needs-approval">
        <ToolCall.Trigger>
          <ToolCall.Name>store.purchase</ToolCall.Name>
          <ToolCall.Status />
        </ToolCall.Trigger>
        <ToolCall.Panel>
          <ToolCall.Approval>Buy it?</ToolCall.Approval>
        </ToolCall.Panel>
      </ToolCall.Root>,
    );
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Needs approval')).toBeTruthy();
  });
});
