import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type {
  CodeOwnProps,
  CopyOwnProps,
  RootOwnProps,
  WrapToggleOwnProps,
} from './code-block.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'CodeBlock',
  slug: 'code-block',
  category: 'ai',
  status: 'new',
  description:
    'Code inside a reply or doc: language and filename, copy, soft-wrap, optional line numbers. No highlighter bundled.',
  whenToUse: ['Code, commands, config or JSON an assistant returns.', 'Snippets in documentation.'],
  whenNotToUse: [
    'A short inline name — use <code> inline.',
    'Tool arguments and results — ToolCall.Code shows them inside the call.',
  ],
  import: "import { CodeBlock } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'figure',
      slot: 'CodeBlock.Root',
      className: 'hj-code-block',
      description: 'Holds wrap and line-number state.',
      props: props<RootOwnProps>({
        wrap: { type: 'boolean', description: 'Soft-wrap (controlled).' },
        defaultWrap: { type: 'boolean', default: 'false', description: 'Initial soft-wrap.' },
        onWrapChange: { type: '(wrap: boolean) => void', description: 'Wrap toggled.' },
        lineNumbers: {
          type: 'boolean',
          default: 'false',
          description: 'Number lines (needs Code’s `code` prop).',
        },
      }),
      dataAttributes: { 'data-wrap': 'Soft-wrapping.', 'data-line-numbers': 'Numbered.' },
      cssVars: {
        '--hj-code-block-max-height': 'Scrolls past this. Default 420px.',
        '--hj-code-block-bg': 'Fill. Default surface.',
        '--hj-code-block-font-size': 'Default 12.5px.',
      },
    },
    {
      name: 'Header',
      element: 'div',
      slot: 'CodeBlock.Header',
      className: 'hj-code-block-header',
      description: '40px row over the code with a hairline.',
    },
    {
      name: 'Language',
      element: 'span',
      slot: 'CodeBlock.Language',
      className: 'hj-code-block-language',
      description: 'Language in lowercase mono.',
    },
    {
      name: 'Filename',
      element: 'span',
      slot: 'CodeBlock.Filename',
      className: 'hj-code-block-filename',
      description: 'Path, truncated from the start so the file name stays visible.',
    },
    {
      name: 'Actions',
      element: 'div',
      slot: 'CodeBlock.Actions',
      className: 'hj-code-block-actions',
      description: 'Right-aligned: Copy, WrapToggle, your own.',
    },
    {
      name: 'Code',
      element: 'pre',
      slot: 'CodeBlock.Code',
      className: 'hj-code-block-code',
      description: 'Focusable scroll area. Plain `code`, or highlighted children.',
      props: props<CodeOwnProps>({
        code: { type: 'string', description: 'Plain text; required for line numbers.' },
      }),
    },
    {
      name: 'Copy',
      element: 'button',
      base: 'Button',
      slot: 'CodeBlock.Copy',
      className: 'hj-code-block-button',
      description:
        'Copies the code’s text; the glyph becomes a check that draws itself; “Copied” is announced.',
      props: props<CopyOwnProps>({
        text: { type: 'string', description: 'Override what is copied.' },
        showLabel: {
          type: 'boolean',
          default: 'true',
          description: 'Show Copy/Copied next to the glyph.',
        },
      }),
      dataAttributes: { 'data-copied': 'For 1.6 s after copying.' },
    },
    {
      name: 'WrapToggle',
      element: 'button',
      base: 'Toggle',
      slot: 'CodeBlock.WrapToggle',
      className: 'hj-code-block-button',
      description: 'Toggles soft-wrap; pressed = accent tint.',
      props: props<WrapToggleOwnProps>({
        label: { type: 'string', default: "'Wrap lines'", description: 'Accessible label.' },
      }),
      dataAttributes: { 'data-pressed': 'Wrapping (Base UI).' },
    },
  ],
  examples: [
    {
      file: 'snippet',
      title: 'A snippet with line numbers',
      description: 'TypeScript with a filename, copy and wrap.',
    },
    { file: 'command', title: 'A shell command', description: 'One line, copy only.' },
  ],
  accessibility: [
    'The code block is focusable (tabindex 0) so it can be scrolled with the keyboard.',
    'Copy announces “Copied” politely; WrapToggle exposes aria-pressed.',
    'Line numbers are drawn with CSS counters, so they are never copied or read.',
  ],
  motion: 'Copy cross-fades to a check that draws in 400 ms. Press dips .97.',
  tokens: ['surface', 'line', 'fg-mute', 'success', 'accent-soft', 'font-mono', 'radius-md'],
  related: ['message', 'tool-call'],
});
