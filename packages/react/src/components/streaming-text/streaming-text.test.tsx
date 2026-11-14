import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StreamingText } from './streaming-text.tsx';

async function* chunks(...parts: string[]): AsyncGenerator<string> {
  yield* parts;
}

async function* broken(): AsyncGenerator<string> {
  yield 'Partial ';
  throw new Error('network');
}

describe('StreamingText', () => {
  it('appends a stream into one text node and calls onDone once', async () => {
    const onDone = vi.fn<(text: string) => void>();
    const { container } = render(
      <StreamingText stream={chunks('Hel', 'lo ', 'there')} onDone={onDone} />,
    );
    await waitFor(() => expect(onDone).toHaveBeenCalledWith('Hello there'));
    const body = container.querySelector('.hj-streaming-text-body');
    expect(body?.textContent).toBe('Hello there');
    expect(body?.childNodes.length).toBe(1);
    expect(container.querySelector('[data-streaming]')).toBeNull();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('controlled text appends the delta and replaces on divergence', () => {
    const { container, rerender } = render(<StreamingText text="Lossless" streaming />);
    const body = container.querySelector('.hj-streaming-text-body');
    const node = body?.firstChild;
    rerender(<StreamingText text="Lossless keeps every bit" streaming />);
    expect(body?.textContent).toBe('Lossless keeps every bit');
    expect(body?.firstChild).toBe(node);
    expect(container.querySelector('.hj-streaming-text-caret')).not.toBeNull();
    rerender(<StreamingText text="High is fine" />);
    expect(body?.textContent).toBe('High is fine');
    expect(container.querySelector('.hj-streaming-text-caret')).toBeNull();
  });

  it('reports a failed stream and keeps what arrived', async () => {
    const onError = vi.fn<(e: unknown) => void>();
    const { container } = render(<StreamingText stream={broken()} onError={onError} />);
    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(container.textContent).toBe('Partial ');
  });
});
