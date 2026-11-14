import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as CodeBlock from './code-block.tsx';
import { tokenize } from './highlight.ts';

function Block(props: CodeBlock.RootProps): React.JSX.Element {
  return (
    <CodeBlock.Root {...props}>
      <CodeBlock.Header>
        <CodeBlock.Language />
        <CodeBlock.Actions>
          <CodeBlock.WrapToggle />
          <CodeBlock.Copy />
        </CodeBlock.Actions>
      </CodeBlock.Header>
      <CodeBlock.Code code={'const a = 1;\nconst b = 2;\n'} />
    </CodeBlock.Root>
  );
}

function mockClipboard(): ReturnType<typeof vi.fn<(t: string) => Promise<void>>> {
  const writeText = vi.fn<(t: string) => Promise<void>>(() => Promise.resolve());
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return writeText;
}

afterEach(() => {
  window.getSelection()?.removeAllRanges();
});

describe('CodeBlock', () => {
  it('numbers lines without putting numbers in the text', () => {
    const { container } = render(<Block lineNumbers />);
    expect(container.querySelectorAll('.hj-code-block-line')).toHaveLength(2);
    expect(container.querySelector('code')?.textContent).toBe('const a = 1;\nconst b = 2;\n');
  });

  it('highlights from the Root language and shows it in Language', () => {
    const { container } = render(<Block language="ts" lineNumbers />);
    expect(container.querySelector('.hj-code-block-language')?.textContent).toBe('ts');
    const kinds = [...container.querySelectorAll('[data-token]')].map((el) => [
      el.getAttribute('data-token'),
      el.textContent,
    ]);
    expect(kinds).toContainEqual(['keyword', 'const']);
    expect(kinds).toContainEqual(['number', '1']);
    // Highlighting never changes the text.
    expect(container.querySelector('code')?.textContent).toBe('const a = 1;\nconst b = 2;\n');
  });

  it('takes a custom highlighter and plain text', () => {
    const { container, rerender } = render(
      <CodeBlock.Root>
        <CodeBlock.Code code="hi" highlight={(code) => [{ text: code, className: 'shiki-x' }]} />
      </CodeBlock.Root>,
    );
    expect(container.querySelector('.shiki-x')?.textContent).toBe('hi');
    rerender(
      <CodeBlock.Root language="ts">
        <CodeBlock.Code code="const x" highlight={false} />
      </CodeBlock.Root>,
    );
    expect(container.querySelector('[data-token]')).toBeNull();
  });

  it('copies the code text and toggles wrap', async () => {
    const writeText = mockClipboard();
    const onCopy = vi.fn<(t: string) => void>();
    const { container } = render(<Block language="ts" onCopy={onCopy} />);
    await userEvent.click(screen.getByRole('button', { name: /Copy/ }));
    expect(writeText).toHaveBeenCalledWith('const a = 1;\nconst b = 2;\n');
    await waitFor(() => expect(screen.getByRole('button', { name: /Copied/ })).toBeTruthy());
    expect(onCopy).toHaveBeenCalledWith('const a = 1;\nconst b = 2;\n');
    expect(container.querySelector('figure')?.hasAttribute('data-copied')).toBe(true);
    const wrap = screen.getByRole('button', { name: 'Wrap lines' });
    await userEvent.click(wrap);
    expect(wrap.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('figure')?.hasAttribute('data-wrap')).toBe(true);
  });

  it('copies the whole block on ⌘C when nothing is selected', async () => {
    const writeText = mockClipboard();
    const { container } = render(<Block />);
    const pre = container.querySelector('pre') as HTMLElement;
    pre.focus();
    await userEvent.keyboard('{Meta>}c{/Meta}');
    expect(writeText).toHaveBeenCalledWith('const a = 1;\nconst b = 2;\n');
  });

  it('copies a snippet without its prompt', async () => {
    const writeText = mockClipboard();
    const { container } = render(<CodeBlock.Snippet code="pnpm add @hanji/react" />);
    expect(container.querySelector('.hj-code-block-prompt')?.textContent).toBe('$');
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(writeText).toHaveBeenCalledWith('pnpm add @hanji/react');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy());
  });
});

const kinds = (code: string, lang: string): string[] =>
  tokenize(code, lang)
    .filter((t) => t.kind && t.kind !== 'punct')
    .map((t) => `${t.kind}:${t.text}`);

describe('tokenize', () => {
  it('reads JSX tags, attributes and expressions', () => {
    expect(
      kinds('return <Theme theme={night} id="a">{n > 1 ? "x" : null}</Theme>;', 'tsx'),
    ).toEqual([
      'keyword:return',
      'type:Theme',
      'attr:theme',
      'attr:id',
      'string:"a"',
      'number:1',
      'string:"x"',
      'constant:null',
      'type:Theme',
    ]);
  });

  it('tells comparisons and generics from JSX', () => {
    expect(kinds('if (a < b) useState<string>(c);', 'ts')).toEqual([
      'keyword:if',
      'function:useState',
    ]);
  });

  it('keeps regexes and comments whole', () => {
    expect(kinds("const re = /a'b/g; // it's", 'js')).toEqual([
      'keyword:const',
      "string:/a'b/g",
      "comment:// it's",
    ]);
  });

  it('reads CSS, JSON and shell', () => {
    expect(kinds('.a { --x: 4px; color: var(--x); }', 'css')).toEqual([
      'type:a',
      'variable:--x',
      'number:4px',
      'property:color',
      'function:var',
      'variable:--x',
    ]);
    expect(kinds('{"ok": true, "n": 2}', 'json')).toEqual([
      'property:"ok"',
      'constant:true',
      'property:"n"',
      'number:2',
    ]);
    expect(kinds('pnpm add -D x && echo $HOME', 'sh')).toEqual([
      'function:pnpm',
      'attr:-D',
      'function:echo',
      'variable:$HOME',
    ]);
  });

  it('leaves unknown languages as plain text', () => {
    expect(tokenize('SELECT 1', 'sql')).toEqual([{ kind: null, text: 'SELECT 1' }]);
  });
});
