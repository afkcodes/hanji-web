'use client';
import { Button as BaseButton } from '@base-ui/react/button';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, flag } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';

interface CodeBlockContextValue {
  wrap: boolean;
  setWrap: (wrap: boolean) => void;
  lineNumbers: boolean;
  /** Callback ref for the <code> element. */
  setCode: (el: HTMLElement | null) => void;
  /** Read at copy time (in an event handler). */
  readCode: () => string;
}
const CodeBlockContext = React.createContext<CodeBlockContextValue | null>(null);

function useCodeBlock(part: string): CodeBlockContextValue {
  const ctx = React.useContext(CodeBlockContext);
  if (!ctx) throw new Error(`[hanji] CodeBlock.${part} must be inside CodeBlock.Root`);
  return ctx;
}

/** Props hanji adds to the Root. */
export interface RootOwnProps {
  /** Soft-wrap long lines (controlled). */
  wrap?: boolean;
  /** @default false */
  defaultWrap?: boolean;
  onWrapChange?: (wrap: boolean) => void;
  /** Number the lines. Works with the `code` prop of CodeBlock.Code. @default false */
  lineNumbers?: boolean;
}
export interface RootProps extends RootOwnProps, Omit<React.ComponentProps<'figure'>, 'className'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * Code in a reply: a header (language, filename, copy, wrap) over a scrollable block. No
 * highlighter is bundled — pass plain text, or children your highlighter already produced.
 */
export function Root(props: RootProps): React.ReactElement {
  const [
    config,
    {
      wrap: wrapProp,
      defaultWrap = false,
      onWrapChange,
      lineNumbers = false,
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
  const readCode = React.useCallback(() => codeEl.current?.textContent ?? '', []);
  const ctx = React.useMemo(
    () => ({ wrap, setWrap, lineNumbers, setCode, readCode }),
    [wrap, setWrap, lineNumbers, setCode, readCode],
  );
  return useRender({
    render,
    defaultTagName: 'figure',
    props: {
      ...rest,
      'data-wrap': flag(wrap),
      'data-line-numbers': flag(lineNumbers),
      className: cls(config, 'CodeBlock.Root', 'hj-code-block', className) as string | undefined,
      children: <CodeBlockContext.Provider value={ctx}>{children}</CodeBlockContext.Provider>,
    },
  });
}

export const Header: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'CodeBlock.Header',
  'hj-code-block-header',
);
/** The language, e.g. `tsx`. */
export const Language: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'CodeBlock.Language',
  'hj-code-block-language',
);
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
  /** Plain text. Required for line numbers; otherwise you may pass highlighted children instead. */
  code?: string;
}
export interface CodeProps extends CodeOwnProps, React.ComponentProps<'pre'> {}

/** The code. The block is focusable so keyboard users can scroll it sideways. */
export function Code(props: CodeProps): React.ReactElement {
  const [config, { code, className, children, ...rest }] = useSlot('CodeBlock.Code', props);
  const { lineNumbers, setCode } = useCodeBlock('Code');
  const lines = lineNumbers && code !== undefined ? code.replace(/\n$/, '').split('\n') : null;
  const lineClass = config.unstyled ? undefined : 'hj-code-block-line';
  return (
    <pre
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll region must be keyboard-reachable (WCAG 2.1.1)
      tabIndex={0}
      {...rest}
      className={
        cls(config, 'CodeBlock.Code', 'hj-code-block-code', className) as string | undefined
      }
    >
      <code ref={setCode}>
        {lines
          ? lines.map((line, i) => (
              // oxlint-disable-next-line react/no-array-index-key -- lines are positional
              <span key={i} className={lineClass}>
                {line}
                {'\n'}
              </span>
            ))
          : (children ?? code)}
      </code>
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

/** Copies the code; the glyph becomes a check that draws itself and “Copied” is announced. */
export function Copy(props: CopyProps): React.ReactElement {
  const [config, { text, showLabel = true, className, onClick, ...rest }] = useSlot(
    'CodeBlock.Copy',
    props,
  );
  const { readCode } = useCodeBlock('Copy');
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);
  const word = copied ? config.strings.copied : config.strings.copy;
  const s = !config.unstyled;
  return (
    <BaseButton
      type="button"
      aria-label={showLabel ? undefined : word}
      {...rest}
      data-copied={flag(copied)}
      className={cls(config, 'CodeBlock.Copy', 'hj-code-block-button', className)}
      onClick={(e) => {
        onClick?.(e);
        void navigator.clipboard?.writeText(text ?? readCode()).then(() => setCopied(true));
      }}
    >
      <span className={s ? 'hj-code-block-glyphs' : undefined} aria-hidden="true">
        <span className={s ? 'hj-code-block-glyph' : undefined} data-glyph="copy">
          {config.icons.copy}
        </span>
        <span className={s ? 'hj-code-block-glyph' : undefined} data-glyph="done">
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
              className={s ? 'hj-code-block-check' : undefined}
            />
          </svg>
        </span>
      </span>
      {showLabel ? (
        <span aria-live="polite">{word}</span>
      ) : (
        <span className={s ? 'hj-code-block-live' : undefined} aria-live="polite">
          {copied ? word : ''}
        </span>
      )}
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
