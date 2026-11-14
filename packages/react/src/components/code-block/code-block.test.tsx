import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as CodeBlock from './code-block.tsx';

function Block(props: CodeBlock.RootProps): React.JSX.Element {
  return (
    <CodeBlock.Root {...props}>
      <CodeBlock.Header>
        <CodeBlock.Actions>
          <CodeBlock.WrapToggle />
          <CodeBlock.Copy />
        </CodeBlock.Actions>
      </CodeBlock.Header>
      <CodeBlock.Code code={'const a = 1;\nconst b = 2;\n'} />
    </CodeBlock.Root>
  );
}

describe('CodeBlock', () => {
  it('numbers lines without putting numbers in the text', () => {
    const { container } = render(<Block lineNumbers />);
    expect(container.querySelectorAll('.hj-code-block-line')).toHaveLength(2);
    expect(container.querySelector('code')?.textContent).toBe('const a = 1;\nconst b = 2;\n');
  });

  it('copies the code text and toggles wrap', async () => {
    const writeText = vi.fn<(t: string) => Promise<void>>(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { container } = render(<Block />);
    await userEvent.click(screen.getByRole('button', { name: /Copy/ }));
    expect(writeText).toHaveBeenCalledWith('const a = 1;\nconst b = 2;\n');
    await waitFor(() => expect(screen.getByRole('button', { name: /Copied/ })).toBeTruthy());
    const wrap = screen.getByRole('button', { name: 'Wrap lines' });
    await userEvent.click(wrap);
    expect(wrap.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('figure')?.hasAttribute('data-wrap')).toBe(true);
  });
});
