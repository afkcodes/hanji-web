'use client';
import { Button as BaseButton } from '@base-ui/react/button';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import type { HanjiConfig } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, flag } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';
import { writeClipboard } from './clipboard.ts';
import { tokenize } from './highlight.ts';
import type { TokenKind } from './highlight.ts';

/** One run of code and how to paint it. */
export interface HighlightToken {
  text: string;
  /** Painted from the theme (`--hj-code-block-<kind>`). The built-in highlighter sets this. */
  kind?: TokenKind | null;
  /** For adapters that bring their own classes (Prism, highlight.js). */
  className?: string;
  /** For adapters that bring their own colours (Shiki's `codeToTokens`). */
  style?: React.CSSProperties;
}

/**
 * Turns code into tokens. Returning tokens rather than elements keeps line numbers, wrapping and
 * copy working with any engine.
 */
export type Highlighter = (code: string, language: string | undefined) => readonly HighlightToken[];

const VISUALLY_HIDDEN: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};
const SHELLS = new Set(['sh', 'bash', 'zsh', 'shell', 'console']);

/** Copied state that lasts 1.6 s and restarts on every copy. */
function useCopy(onCopy?: (text: string) => void): {
  copied: boolean;
  copy: (text: string) => void;
} {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!tick) return;
    const id = window.setTimeout(() => setTick(0), 1600);
    return () => window.clearTimeout(id);
  }, [tick]);
  const copy = React.useCallback(
    (text: string) => {
      void writeClipboard(text).then((ok) => {
        if (!ok) return;
        setTick((t) => t + 1);
        onCopy?.(text);
      });
    },
    [onCopy],
  );
  return { copied: tick > 0, copy };
}

function useTokens(
  code: string | undefined,
  language: string | undefined,
  highlight: boolean | Highlighter,
): readonly HighlightToken[] | null {
  return React.useMemo(() => {
    if (code === undefined) return null;
    if (highlight === false) return [{ text: code }];
    return highlight === true ? tokenize(code, language) : highlight(code, language);
  }, [code, language, highlight]);
}

function paint(t: HighlightToken, key: number, styled: boolean): React.ReactNode {
  if (!t.kind && !t.className && !t.style) return t.text;
  return (
    <span
      key={key}
      className={
        [styled ? 'hj-code-block-token' : null, t.className].filter(Boolean).join(' ') || undefined
      }
      data-token={t.kind ?? undefined}
      style={t.style}
    >
      {t.text}
    </span>
  );
}

/** Split tokens at newlines; a trailing newline doesn't make an empty last line. */
function toLines(tokens: readonly HighlightToken[]): HighlightToken[][] {
  const lines: HighlightToken[][] = [[]];
  for (const t of tokens) {
    const parts = t.text.split('\n');
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) lines.push([]);
      const text = parts[i] as string;
      if (text) (lines.at(-1) as HighlightToken[]).push(parts.length === 1 ? t : { ...t, text });
    }
  }
  if (lines.length > 1 && lines.at(-1)?.length === 0) lines.pop();
  return lines;
}

function CopyGlyph({
  styled,
  config,
}: {
  styled: boolean;
  config: HanjiConfig;
}): React.ReactElement {
  return (
    <span className={styled ? 'hj-code-block-glyphs' : undefined} aria-hidden="true">
      <span className={styled ? 'hj-code-block-glyph' : undefined} data-glyph="copy">
        {config.icons.copy}
      </span>
      <span className={styled ? 'hj-code-block-glyph' : undefined} data-glyph="done">
        <svg
          viewBox="0 0 24 24"
          width="1em"
          height="1em"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M20 6 9 17l-5-5"
            pathLength={1}
            className={styled ? 'hj-code-block-check' : undefined}
          />
        </svg>
      </span>
    </span>
  );
}

interface CodeBlockContextValue {
  wrap: boolean;
  setWrap: (wrap: boolean) => void;
  lineNumbers: boolean;
  language: string | undefined;
  copied: boolean;
  /** Copy `text`, or the block's code. */
  copy: (text?: string) => void;
  /** Callback ref for the <code> element. */
  setCode: (el: HTMLElement | null) => void;
}
const CodeBlockContext = React.createContext<CodeBlockContextValue | null>(null);

function useCodeBlock(part: string): CodeBlockContextValue {
  const ctx = React.useContext(CodeBlockContext);
  if (!ctx) throw new Error(`[hanji] CodeBlock.${part} must be inside CodeBlock.Root`);
  return ctx;
}

/** Props hanji adds to the Root. */
export interface RootOwnProps {
  /** Language for highlighting and the Language part, e.g. `tsx`, `css`, `json`, `sh`. */
  language?: string;
  /** Soft-wrap long lines (controlled). */
  wrap?: boolean;
  /** @default false */
  defaultWrap?: boolean;
  onWrapChange?: (wrap: boolean) => void;
  /** Number the lines. Works with the `code` prop of CodeBlock.Code. @default false */
  lineNumbers?: boolean;
  /** Called with the text after every successful copy (button or ⌘C). */
  onCopy?: (text: string) => void;
}
export interface RootProps
  extends RootOwnProps, Omit<React.ComponentProps<'figure'>, 'className' | 'onCopy'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * Code in a reply or doc: a header (language, filename, copy, wrap) over a scrollable block,
 * highlighted by a small built-in highlighter or your own.
 */
export function Root(props: RootProps): React.ReactElement {
  const [
    config,
    {
      language,
      wrap: wrapProp,
      defaultWrap = false,
      onWrapChange,
      lineNumbers = false,
      onCopy,
      className,
      render,
      children,
      ...rest
    },
  ] = useSlot('CodeBlock.Root', props);
  const [inner, setInner] = React.useState(defaultWrap);
  const wrap = wrapProp ?? inner;
  const codeEl = React.useRef<HTMLElement | null>(null);
  const controlled = wrapProp !== undefined;
  const setWrap = React.useCallback(
    (next: boolean) => {
      if (!controlled) setInner(next);
      onWrapChange?.(next);
    },
    [controlled, onWrapChange],
  );
  const setCode = React.useCallback((el: HTMLElement | null) => {
    codeEl.current = el;
  }, []);
  const { copied, copy: write } = useCopy(onCopy);
  const copy = React.useCallback(
    (text?: string) => write(text ?? codeEl.current?.textContent ?? ''),
    [write],
  );
  const ctx = React.useMemo(
    () => ({ wrap, setWrap, lineNumbers, language, copied, copy, setCode }),
    [wrap, setWrap, lineNumbers, language, copied, copy, setCode],
  );
  return useRender({
    render,
    defaultTagName: 'figure',
    props: {
      ...rest,
      'data-wrap': flag(wrap),
      'data-line-numbers': flag(lineNumbers),
      'data-copied': flag(copied),
      className: cls(config, 'CodeBlock.Root', 'hj-code-block', className) as string | undefined,
      children: (
        <CodeBlockContext.Provider value={ctx}>
          {children}
          <span style={VISUALLY_HIDDEN} aria-live="polite">
            {copied ? config.strings.copied : ''}
          </span>
        </CodeBlockContext.Provider>
      ),
    },
  });
}

export const Header: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'CodeBlock.Header',
  'hj-code-block-header',
);

/** The language, e.g. `tsx`. Shows the Root's `language` when it has no children. */
export function Language(props: ElementPartProps<'span'>): React.ReactElement {
  const [config, { render, className, children, ...rest }] = useSlot('CodeBlock.Language', props);
  const ctx = React.useContext(CodeBlockContext);
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      ...rest,
      className: cls(config, 'CodeBlock.Language', 'hj-code-block-language', className) as
        | string
        | undefined,
      children: children ?? ctx?.language,
    },
  });
}

/** A file path, truncated from the start. */
export const Filename: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'CodeBlock.Filename',
  'hj-code-block-filename',
);
/** Right-aligned actions in the header. */
export const Actions: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'CodeBlock.Actions',
  'hj-code-block-actions',
);

export interface CodeOwnProps {
  /** Plain text. Highlighted and numbered for you; or pass already-highlighted children instead. */
  code?: string;
  /** Overrides the Root's language. */
  language?: string;
  /**
   * `true` uses the built-in highlighter (TS/JS/JSX, CSS, JSON, shell, HTML). Pass a function to
   * plug in Shiki or Prism, or `false` for plain text. Set it app-wide with HanjiProvider
   * `defaults={{ 'CodeBlock.Code': { highlight } }}`.
   * @default true
   */
  highlight?: boolean | Highlighter;
}
export interface CodeProps extends CodeOwnProps, React.ComponentProps<'pre'> {}

/**
 * The code. Focusable so keyboard users can scroll it; ⌘C / Ctrl+C with nothing selected copies
 * the whole block.
 */
export function Code(props: CodeProps): React.ReactElement {
  const [config, { code, language, highlight = true, className, children, onKeyDown, ...rest }] =
    useSlot('CodeBlock.Code', props);
  const { language: rootLanguage, lineNumbers, copy, setCode } = useCodeBlock('Code');
  const lang = language ?? rootLanguage;
  const tokens = useTokens(code, lang, highlight);
  const styled = !config.unstyled;
  let body: React.ReactNode = children;
  if (tokens && lineNumbers) {
    body = toLines(tokens).map((line, i) => (
      // oxlint-disable-next-line react/no-array-index-key -- lines are positional
      <span key={i} className={styled ? 'hj-code-block-line' : undefined}>
        {line.map((t, j) => paint(t, j, styled))}
        {'\n'}
      </span>
    ));
  } else if (tokens) {
    body = tokens.map((t, j) => paint(t, j, styled));
  }
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- ⌘C on a focusable scroll region is a shortcut; Copy stays the accessible path
    <pre
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll region must be keyboard-reachable (WCAG 2.1.1)
      tabIndex={0}
      {...rest}
      data-language={lang}
      className={
        cls(config, 'CodeBlock.Code', 'hj-code-block-code', className) as string | undefined
      }
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented || e.altKey || e.shiftKey || !(e.metaKey || e.ctrlKey)) return;
        if (e.key.toLowerCase() !== 'c') return;
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) return; // copy what the reader selected
        e.preventDefault();
        copy();
      }}
    >
      <code ref={setCode}>{body}</code>
    </pre>
  );
}

export interface CopyOwnProps {
  /** Text to copy. Default: the block's text content. */
  text?: string;
  /** Show the word next to the glyph. @default true */
  showLabel?: boolean;
}
export interface CopyProps extends CopyOwnProps, Omit<BaseButton.Props, 'children'> {}

/**
 * Copies the code; the glyph becomes a check that draws itself and “Copied” is announced. In the
 * Header it sits with the actions; as a direct child of Root it floats over the code's corner.
 */
export function Copy(props: CopyProps): React.ReactElement {
  const [config, { text, showLabel = true, className, onClick, ...rest }] = useSlot(
    'CodeBlock.Copy',
    props,
  );
  const { copied, copy } = useCodeBlock('Copy');
  const word = copied ? config.strings.copied : config.strings.copy;
  const styled = !config.unstyled;
  return (
    <BaseButton
      type="button"
      aria-label={showLabel ? undefined : word}
      title={showLabel ? undefined : word}
      {...rest}
      data-copied={flag(copied)}
      className={cls(config, 'CodeBlock.Copy', 'hj-code-block-button', className)}
      onClick={(e) => {
        onClick?.(e);
        copy(text);
      }}
    >
      <CopyGlyph styled={styled} config={config} />
      {showLabel ? <span>{word}</span> : null}
    </BaseButton>
  );
}

export interface WrapToggleOwnProps {
  /** @default 'Wrap lines' */
  label?: string;
}
export interface WrapToggleProps
  extends WrapToggleOwnProps, Omit<BaseToggle.Props, 'pressed' | 'onPressedChange' | 'children'> {}

/** Toggles soft wrap. aria-pressed reflects the state. */
export function WrapToggle(props: WrapToggleProps): React.ReactElement {
  const [config, { label = 'Wrap lines', className, ...rest }] = useSlot(
    'CodeBlock.WrapToggle',
    props,
  );
  const { wrap, setWrap } = useCodeBlock('WrapToggle');
  return (
    <BaseToggle
      aria-label={label}
      title={label}
      {...rest}
      pressed={wrap}
      onPressedChange={setWrap}
      className={cls(config, 'CodeBlock.WrapToggle', 'hj-code-block-button', className)}
    >
      <svg
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 6h18M3 12h15a3 3 0 1 1 0 6h-4M3 18h7M16 16l-2 2 2 2" />
      </svg>
    </BaseToggle>
  );
}

export interface SnippetOwnProps {
  /** The line to show and copy: an install command, an import. */
  code: string;
  /** @default 'sh' */
  language?: string;
  /** Drawn before the line and never copied. Default `$` for shell languages, none otherwise. */
  prompt?: string | false;
  /** As CodeBlock.Code. @default true */
  highlight?: boolean | Highlighter;
  /** Called with the text after every successful copy. */
  onCopy?: (text: string) => void;
}
export interface SnippetProps
  extends SnippetOwnProps, Omit<React.ComponentProps<'div'>, 'className' | 'children' | 'onCopy'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * A one-line, copy-first block for install commands and imports. Stands alone (no Root). One click
 * on the text selects all of it; the button copies it.
 */
export function Snippet(props: SnippetProps): React.ReactElement {
  const [
    config,
    { code, language = 'sh', prompt, highlight = true, onCopy, className, render, ...rest },
  ] = useSlot('CodeBlock.Snippet', props);
  const { copied, copy } = useCopy(onCopy);
  const tokens = useTokens(code, language, highlight) ?? [];
  const styled = !config.unstyled;
  const mark = prompt ?? (SHELLS.has(language) ? '$' : false);
  const word = copied ? config.strings.copied : config.strings.copy;
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...rest,
      'data-copied': flag(copied),
      className: cls(config, 'CodeBlock.Snippet', 'hj-code-block-snippet', className) as
        | string
        | undefined,
      children: (
        <>
          {mark ? (
            <span className={styled ? 'hj-code-block-prompt' : undefined} aria-hidden="true">
              {mark}
            </span>
          ) : null}
          <code
            className={styled ? 'hj-code-block-snippet-code' : undefined}
            data-language={language}
          >
            {tokens.map((t, j) => paint(t, j, styled))}
          </code>
          <BaseButton
            type="button"
            aria-label={word}
            title={word}
            data-copied={flag(copied)}
            className={styled ? 'hj-code-block-button' : undefined}
            onClick={() => copy(code)}
          >
            <CopyGlyph styled={styled} config={config} />
          </BaseButton>
          <span style={VISUALLY_HIDDEN} aria-live="polite">
            {copied ? config.strings.copied : ''}
          </span>
        </>
      ),
    },
  });
}
