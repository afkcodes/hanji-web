'use client';
import { Button as BaseButton } from '@base-ui/react/button';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, flag } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';

export type PromptStatus = 'idle' | 'submitting' | 'streaming' | 'error';

interface PromptContextValue {
  value: string;
  setValue: (value: string) => void;
  status: PromptStatus;
  disabled: boolean;
  canSubmit: boolean;
  stop: () => void;
  requestSubmit: () => void;
}

const PromptContext = React.createContext<PromptContextValue | null>(null);

function usePrompt(part: string): PromptContextValue {
  const ctx = React.useContext(PromptContext);
  // globalThis: this module exports its own `Error` part.
  if (!ctx)
    throw new globalThis.Error(`[hanji] PromptInput.${part} must be inside PromptInput.Root`);
  return ctx;
}

/** Props hanji adds to the Root form. */
export interface RootOwnProps {
  /** Controlled prompt text. */
  value?: string;
  /** Uncontrolled initial text. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the trimmed prompt. Not called while streaming or when empty. */
  onSubmit?: (value: string, event: React.FormEvent<HTMLFormElement>) => void;
  /** Called when Submit is pressed while `status` is `streaming` (it becomes Stop). */
  onStop?: () => void;
  /** idle · submitting (sending) · streaming (a reply is arriving; Submit becomes Stop) · error. */
  status?: PromptStatus;
  disabled?: boolean;
  /** Clear the text after a successful submit (uncontrolled only). @default true */
  clearOnSubmit?: boolean;
}

export interface RootProps
  extends
    RootOwnProps,
    Omit<React.ComponentProps<'form'>, 'onSubmit' | 'className' | 'defaultValue'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * The prompt box: a form that owns the text, the status and submit/stop.
 *
 * @example
 * <PromptInput.Root status={status} onSubmit={send} onStop={abort}>
 *   <PromptInput.Textarea placeholder="Ask about your library" />
 *   <PromptInput.Toolbar><PromptInput.Attach onFiles={add} /><PromptInput.Submit /></PromptInput.Toolbar>
 * </PromptInput.Root>
 */
export function Root(props: RootProps): React.ReactElement {
  const [
    config,
    {
      value: valueProp,
      defaultValue = '',
      onValueChange,
      onSubmit,
      onStop,
      status = 'idle',
      disabled = false,
      clearOnSubmit = true,
      className,
      render,
      children,
      ...rest
    },
  ] = useSlot('PromptInput.Root', props);
  const [inner, setInner] = React.useState(defaultValue);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : inner;
  const formRef = React.useRef<HTMLFormElement>(null);
  const busy = status === 'submitting' || status === 'streaming';
  const canSubmit = !disabled && !busy && value.trim().length > 0;

  const setValue = React.useCallback(
    (next: string) => {
      if (!controlled) setInner(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );
  const stop = React.useCallback(() => onStop?.(), [onStop]);
  const requestSubmit = React.useCallback(() => formRef.current?.requestSubmit(), []);

  const ctx = React.useMemo<PromptContextValue>(
    () => ({ value, setValue, status, disabled, canSubmit, stop, requestSubmit }),
    [value, setValue, status, disabled, canSubmit, stop, requestSubmit],
  );

  return useRender({
    render,
    defaultTagName: 'form',
    ref: formRef,
    props: {
      ...rest,
      'data-status': status,
      'data-disabled': flag(disabled),
      'aria-busy': busy || undefined,
      className: cls(config, 'PromptInput.Root', 'hj-prompt-input', className) as
        | string
        | undefined,
      onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit?.(value.trim(), event);
        if (clearOnSubmit && !controlled) setInner('');
      },
      children: <PromptContext.Provider value={ctx}>{children}</PromptContext.Provider>,
    },
  });
}

export interface TextareaOwnProps {
  /** Enter submits, Shift+Enter adds a line. Off: Enter always adds a line. @default true */
  submitOnEnter?: boolean;
}
export interface TextareaProps
  extends TextareaOwnProps, Omit<React.ComponentProps<'textarea'>, 'value' | 'defaultValue'> {}

/** Grows with its content (CSS field-sizing) up to --hj-prompt-input-max-height, then scrolls. */
export function Textarea(props: TextareaProps): React.ReactElement {
  const [config, { submitOnEnter = true, className, onChange, onKeyDown, rows = 1, ...rest }] =
    useSlot('PromptInput.Textarea', props);
  const ctx = usePrompt('Textarea');
  return (
    <textarea
      aria-label={rest['aria-label'] ?? (rest.placeholder ? undefined : 'Message')}
      {...rest}
      rows={rows}
      value={ctx.value}
      disabled={ctx.disabled || rest.disabled}
      aria-invalid={ctx.status === 'error' || undefined}
      className={
        cls(config, 'PromptInput.Textarea', 'hj-prompt-input-textarea', className) as
          | string
          | undefined
      }
      onChange={(e) => {
        onChange?.(e);
        ctx.setValue(e.currentTarget.value);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented || !submitOnEnter) return;
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
          e.preventDefault();
          if (ctx.canSubmit) ctx.requestSubmit();
        }
      }}
    />
  );
}

/** The row under the text: attach, model picker, hint, submit. */
export const Toolbar: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'PromptInput.Toolbar',
  'hj-prompt-input-toolbar',
);

/** A quiet hint in the toolbar: a shortcut, a model note, a limit. */
export const Hint: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'PromptInput.Hint',
  'hj-prompt-input-hint',
);

export interface CountOwnProps {
  /** Show `length / max` and mark the count when the prompt is over it. */
  max?: number;
}
export interface CountProps extends CountOwnProps, Omit<React.ComponentProps<'span'>, 'children'> {}

/** Character count from the Root's text. Over `max` it turns danger and says so. */
export function Count(props: CountProps): React.ReactElement {
  const [config, { max, className, ...rest }] = useSlot('PromptInput.Count', props);
  const ctx = usePrompt('Count');
  const n = ctx.value.length;
  const over = max !== undefined && n > max;
  return (
    <span
      aria-live="polite"
      {...rest}
      data-over={flag(over)}
      className={
        cls(config, 'PromptInput.Count', 'hj-prompt-input-count', className) as string | undefined
      }
    >
      {max === undefined ? n.toLocaleString() : `${n.toLocaleString()} / ${max.toLocaleString()}`}
    </span>
  );
}

export interface AttachOwnProps {
  /** Files chosen by the user. */
  onFiles?: (files: File[]) => void;
  /** `accept` for the file input, e.g. `image/*,.pdf`. */
  accept?: string;
  /** @default true */
  multiple?: boolean;
  /** Accessible label. @default 'Attach files' */
  label?: string;
}
export interface AttachProps extends AttachOwnProps, Omit<BaseButton.Props, 'onClick'> {}

/** Opens the system file picker. Renders a paperclip; pass children for a custom glyph. */
export function Attach(props: AttachProps): React.ReactElement {
  const [
    config,
    {
      onFiles,
      accept,
      multiple = true,
      label = 'Attach files',
      className,
      children,
      disabled,
      ...rest
    },
  ] = useSlot('PromptInput.Attach', props);
  const ctx = usePrompt('Attach');
  const input = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <BaseButton
        type="button"
        aria-label={label}
        {...rest}
        disabled={ctx.disabled || disabled}
        className={cls(config, 'PromptInput.Attach', 'hj-prompt-input-attach', className)}
        onClick={() => input.current?.click()}
      >
        {children ?? config.icons.paperclip}
      </BaseButton>
      <input
        ref={input}
        type="file"
        hidden
        tabIndex={-1}
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const files = [...(e.currentTarget.files ?? [])];
          if (files.length) onFiles?.(files);
          e.currentTarget.value = '';
        }}
      />
    </>
  );
}

export interface SubmitOwnProps {
  /** Accessible label while idle. @default strings.send */
  label?: string;
  /** Accessible label while streaming. @default strings.stop */
  stopLabel?: string;
}
export interface SubmitProps extends SubmitOwnProps, Omit<BaseButton.Props, 'type'> {}

/** Send (arrow up). While the Root is streaming it becomes Stop and calls onStop. */
export function Submit(props: SubmitProps): React.ReactElement {
  const [config, { label, stopLabel, className, onClick, ...rest }] = useSlot(
    'PromptInput.Submit',
    props,
  );
  const ctx = usePrompt('Submit');
  const streaming = ctx.status === 'streaming';
  const styled = !config.unstyled;
  return (
    <BaseButton
      {...rest}
      type={streaming ? 'button' : 'submit'}
      aria-label={streaming ? (stopLabel ?? config.strings.stop) : (label ?? config.strings.send)}
      disabled={streaming ? false : !ctx.canSubmit}
      focusableWhenDisabled
      data-mode={streaming ? 'stop' : 'send'}
      data-pending={flag(ctx.status === 'submitting')}
      className={cls(config, 'PromptInput.Submit', 'hj-prompt-input-submit', className)}
      onClick={(e) => {
        onClick?.(e);
        if (streaming) {
          e.preventDefault();
          ctx.stop();
        }
      }}
    >
      <span
        className={styled ? 'hj-prompt-input-glyph' : undefined}
        data-glyph="send"
        aria-hidden="true"
      >
        {config.icons.arrowUp}
      </span>
      <span
        className={styled ? 'hj-prompt-input-glyph' : undefined}
        data-glyph="stop"
        aria-hidden="true"
      >
        {config.icons.stop}
      </span>
    </BaseButton>
  );
}

export interface ErrorOwnProps {
  /** Show even when the Root's status isn't `error`. */
  forceShow?: boolean;
}
export interface ErrorProps extends ErrorOwnProps, React.ComponentProps<'div'> {}

/** Says what went wrong with the last send. Rendered only while the Root's status is `error`. */
export function Error(props: ErrorProps): React.ReactElement | null {
  const [config, { forceShow = false, className, children, ...rest }] = useSlot(
    'PromptInput.Error',
    props,
  );
  const ctx = usePrompt('Error');
  if (ctx.status !== 'error' && !forceShow) return null;
  return (
    <div
      role="alert"
      {...rest}
      className={
        cls(config, 'PromptInput.Error', 'hj-prompt-input-error', className) as string | undefined
      }
    >
      {config.icons.alert}
      <span>{children}</span>
    </div>
  );
}
