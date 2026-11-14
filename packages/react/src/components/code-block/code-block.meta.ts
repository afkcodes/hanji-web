import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type {
  CodeOwnProps,
  CopyOwnProps,
  RootOwnProps,
  SnippetOwnProps,
  WrapToggleOwnProps,
} from './code-block.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'CodeBlock',
  slug: 'code-block',
  category: 'ai',
  status: 'new',
  description:
    'Code inside a reply or doc: syntax-highlighted from the theme (TS/JS/JSX, CSS, JSON, shell, HTML built in; Shiki or Prism pluggable), language and filename, copy (button, floating button or ⌘C), soft-wrap, line numbers. Snippet is the one-line, copy-first form for install commands and imports.',
  whenToUse: [
    'Code, commands, config or JSON an assistant returns.',
    'Snippets in documentation.',
    'An install command or import line people will copy — CodeBlock.Snippet.',
  ],
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
      description: 'Holds language, wrap, line-number and copied state.',
      props: props<RootOwnProps>({
        language: {
          type: 'string',
          description:
            'Highlighting language for Code and the text of Language: tsx, ts, jsx, js, css, json, sh, html…',
        },
        onCopy: {
          type: '(text: string) => void',
          description: 'After every successful copy (button or ⌘C).',
        },
        wrap: { type: 'boolean', description: 'Soft-wrap (controlled).' },
        defaultWrap: { type: 'boolean', default: 'false', description: 'Initial soft-wrap.' },
        onWrapChange: { type: '(wrap: boolean) => void', description: 'Wrap toggled.' },
        lineNumbers: {
          type: 'boolean',
          default: 'false',
          description: 'Number lines (needs Code’s `code` prop).',
        },
      }),
      dataAttributes: {
        'data-wrap': 'Soft-wrapping.',
        'data-line-numbers': 'Numbered.',
        'data-copied': 'For 1.6 s after a copy; the hairline turns success.',
      },
      cssVars: {
        '--hj-code-block-max-height': 'Scrolls past this. Default 420px.',
        '--hj-code-block-bg': 'Fill. Default surface.',
        '--hj-code-block-font-size': 'Default 12.5px.',
        '--hj-code-block-keyword': 'Keyword colour. Default data-4 (violet) pulled 20% to fg.',
        '--hj-code-block-string': 'Strings and regexes. Default data-3 (moss).',
        '--hj-code-block-number': 'Numbers. Default data-2 (ember).',
        '--hj-code-block-constant': 'true, false, null, CSS hex. Default data-2.',
        '--hj-code-block-function': 'Calls, shell commands. Default data-1 (cobalt).',
        '--hj-code-block-type': 'Types, components, CSS class selectors. Default data-6 (teal).',
        '--hj-code-block-tag': 'JSX/HTML tags, CSS element selectors. Default data-1.',
        '--hj-code-block-attr': 'JSX attributes, shell flags. Default data-5 (amber).',
        '--hj-code-block-property': 'CSS properties, JSON keys. Default data-1.',
        '--hj-code-block-variable': 'CSS custom properties, shell variables. Default data-5.',
        '--hj-code-block-comment': 'Default fg-mute.',
        '--hj-code-block-punct': 'Punctuation and operators. Default fg-dim.',
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
      description: 'Language in lowercase mono; shows the Root’s `language` when empty.',
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
      description:
        'Focusable scroll area. Pass `code` to have it highlighted (and numbered), or children you highlighted yourself. ⌘C / Ctrl+C with nothing selected copies the whole block.',
      props: props<CodeOwnProps>({
        code: {
          type: 'string',
          description: 'Plain text; highlighted for you. Required for line numbers.',
        },
        language: { type: 'string', description: 'Overrides the Root’s language.' },
        highlight: {
          type: 'boolean | Highlighter',
          default: 'true',
          description:
            "Built-in highlighter, `false` for plain text, or `(code, language) => HighlightToken[]` for Shiki/Prism (tokens take kind, className or style). App-wide: HanjiProvider defaults['CodeBlock.Code'].",
        },
      }),
      dataAttributes: { 'data-language': 'The language in use.' },
    },
    {
      name: 'Copy',
      element: 'button',
      base: 'Button',
      slot: 'CodeBlock.Copy',
      className: 'hj-code-block-button',
      description:
        'Copies the code’s text; the glyph becomes a check that draws itself; “Copied” is announced. In the Header it sits with the actions; as a direct child of Root it floats over the top-right corner (shown on hover or focus where hover exists, always on touch).',
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
    {
      name: 'Snippet',
      element: 'div',
      slot: 'CodeBlock.Snippet',
      className: 'hj-code-block-snippet',
      description:
        'Standalone (no Root): one highlighted line with a copy button. A `$` prompt for shell languages is drawn but never copied; one click on the text selects all of it; long lines scroll under a fade.',
      props: props<SnippetOwnProps>({
        code: { type: 'string', description: 'Required. The line to show and copy.' },
        language: { type: 'string', default: "'sh'", description: 'Highlighting language.' },
        prompt: {
          type: 'string | false',
          description: 'Drawn before the line, never copied. Default `$` for shell languages.',
        },
        highlight: {
          type: 'boolean | Highlighter',
          default: 'true',
          description: 'As CodeBlock.Code.',
        },
        onCopy: { type: '(text: string) => void', description: 'After every successful copy.' },
      }),
      dataAttributes: { 'data-copied': 'For 1.6 s after copying.' },
      cssVars: { '--hj-code-block-snippet-height': 'Default 40px (scales with density).' },
    },
  ],
  examples: [
    {
      file: 'snippet',
      title: 'Highlighted, with line numbers',
      description: 'TSX with a filename, copy and wrap. ⌘C on the focused block copies all of it.',
    },
    {
      file: 'command',
      title: 'Install and import lines',
      description: 'Snippet: one line, copy-first. The $ prompt is drawn but never copied.',
    },
    {
      file: 'bare',
      title: 'No header',
      description: 'CSS with a floating copy button that appears on hover or focus.',
    },
  ],
  accessibility: [
    'The code block is focusable (tabindex 0) so it can be scrolled with the keyboard.',
    'Copy announces “Copied” politely (one live region per block); icon-only copy buttons are labelled and titled.',
    'With the block focused and nothing selected, ⌘C / Ctrl+C copies the whole block; a selection is copied as usual.',
    'Token colours are the data hues mixed 20% toward fg, so highlighted text keeps contrast on every paper.',
    'WrapToggle exposes aria-pressed.',
    'Line numbers are drawn with CSS counters, so they are never copied or read.',
  ],
  motion:
    'Copy cross-fades to a check that draws in 400 ms and the block’s hairline turns success for 1.6 s. The floating copy fades in on hover. Press dips .97.',
  tokens: [
    'surface',
    'line',
    'fg-mute',
    'fg-dim',
    'data-1',
    'data-2',
    'data-3',
    'data-4',
    'data-5',
    'data-6',
    'success',
    'accent-soft',
    'font-mono',
    'radius-md',
    'radius-sm',
  ],
  related: ['message', 'tool-call'],
});
