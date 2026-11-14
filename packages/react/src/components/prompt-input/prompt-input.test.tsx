import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as PromptInput from './prompt-input.tsx';

function Composer(props: PromptInput.RootProps): React.JSX.Element {
  return (
    <PromptInput.Root {...props}>
      <PromptInput.Textarea aria-label="Message" />
      <PromptInput.Toolbar>
        <PromptInput.Submit />
      </PromptInput.Toolbar>
    </PromptInput.Root>
  );
}

describe('PromptInput', () => {
  it('Enter sends the trimmed text and clears; Shift+Enter adds a line', async () => {
    const onSubmit = vi.fn<(v: string) => void>();
    render(<Composer onSubmit={(v) => onSubmit(v)} />);
    const box = screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement;
    await userEvent.type(box, '  play something calm');
    await userEvent.type(box, '{Shift>}{Enter}{/Shift}');
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(box, '{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('play something calm');
    expect(box.value).toBe('');
  });

  it('Send is disabled while empty and becomes Stop while streaming', async () => {
    const onStop = vi.fn<() => void>();
    const { rerender } = render(<Composer />);
    expect(screen.getByRole('button', { name: 'Send' }).hasAttribute('data-disabled')).toBe(true);
    rerender(<Composer status="streaming" onStop={onStop} defaultValue="x" />);
    const stop = screen.getByRole('button', { name: 'Stop generating' });
    expect(stop.getAttribute('data-mode')).toBe('stop');
    await userEvent.click(stop);
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('IME composition never submits', () => {
    const onSubmit = vi.fn<(v: string) => void>();
    render(<Composer onSubmit={(v) => onSubmit(v)} defaultValue="こんにちは" />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    fireEvent.keyDown(box, { key: 'Enter', isComposing: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
