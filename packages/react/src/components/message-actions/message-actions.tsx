'use client';
import { Button as BaseButton } from '@base-ui/react/button';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { cls, flag } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';

function Glyph({ d }: { d: string }): React.ReactElement {
  return (
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
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
const REFRESH = 'M21 12a9 9 0 1 1-2.6-6.4L21 8M21 3v5h-5';
const THUMB_UP =
  'M7 10v11M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 18.4 21H7V10l4.6-7.5A1.8 1.8 0 0 1 15 4.4Z';
const THUMB_DOWN =
  'M17 14V3M9 18.1 10 14H4.2a2 2 0 0 1-2-2.3l1.4-7A2 2 0 0 1 5.6 3H17v11l-4.6 7.5A1.8 1.8 0 0 1 9 19.6Z';

interface ActionsContextValue {
  text: string | (() => string) | undefined;
}
const ActionsContext = React.createContext<ActionsContextValue>({ text: undefined });

/** Props hanji adds to the toolbar. */
export interface RootOwnProps {
  /** The message text Copy writes to the clipboard — a string, or a function read at copy time. */
  text?: string | (() => string);
  /** hover: hidden until the message is hovered or focused (pointer devices only) · always. @default 'hover' */
  reveal?: 'hover' | 'always';
}
export interface RootProps extends RootOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
  render?: useRender.RenderProp;
}

/** A row of icon actions under a reply. role="toolbar". */
export function Root(props: RootProps): React.ReactElement {
  const [config, { text, reveal = 'hover', className, render, children, ...rest }] = useSlot(
    'MessageActions.Root',
    props,
  );
  const ctx = React.useMemo(() => ({ text }), [text]);
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'toolbar',
      'aria-label': 'Message actions',
      ...rest,
      'data-reveal': reveal,
      className: cls(config, 'MessageActions.Root', 'hj-message-actions', className) as
        | string
        | undefined,
      children: <ActionsContext.Provider value={ctx}>{children}</ActionsContext.Provider>,
    },
  });
}

export interface ActionOwnProps {
  /** Accessible label (also the tooltip text via `title`). Required: actions are icon-only. */
  label: string;
}
export interface ActionProps extends ActionOwnProps, BaseButton.Props {}

/** A generic icon action — use it for a “More” menu trigger or your own actions. */
export function Action(props: ActionProps): React.ReactElement {
  const [config, { label, className, ...rest }] = useSlot('MessageActions.Action', props);
  return (
    <BaseButton
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={cls(config, 'MessageActions.Action', 'hj-message-actions-button', className)}
    />
  );
}

export interface CopyOwnProps {
  /** Override the Root's text for this button. */
  text?: string | (() => string);
  /** Called after a successful copy. */
  onCopied?: () => void;
}
export interface CopyProps extends CopyOwnProps, Omit<BaseButton.Props, 'children'> {}

/** Copies the message. The glyph becomes a check that draws itself, for 1.6 s. */
export function Copy(props: CopyProps): React.ReactElement {
  const [config, { text, onCopied, className, onClick, ...rest }] = useSlot(
    'MessageActions.Copy',
    props,
  );
  const ctx = React.useContext(ActionsContext);
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);
  const source = text ?? ctx.text;
  const label = copied ? config.strings.copied : config.strings.copy;
  const styled = !config.unstyled;
  return (
    <BaseButton
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      data-copied={flag(copied)}
      className={cls(config, 'MessageActions.Copy', 'hj-message-actions-button', className)}
      onClick={(e) => {
        onClick?.(e);
        const value = typeof source === 'function' ? source() : (source ?? '');
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          onCopied?.();
        });
      }}
    >
      <span className={styled ? 'hj-message-actions-glyph' : undefined} data-glyph="copy">
        {config.icons.copy}
      </span>
      <span className={styled ? 'hj-message-actions-glyph' : undefined} data-glyph="done">
        <svg
          viewBox="0 0 24 24"
          width="1em"
          height="1em"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path
            d="M20 6 9 17l-5-5"
            pathLength={1}
            className={styled ? 'hj-message-actions-check' : undefined}
          />
        </svg>
      </span>
      <span className={styled ? 'hj-message-actions-live' : undefined} aria-live="polite">
        {copied ? config.strings.copied : ''}
      </span>
    </BaseButton>
  );
}

export interface RegenerateOwnProps {
  /** Accessible label. @default 'Regenerate' */
  label?: string;
}
export interface RegenerateProps extends RegenerateOwnProps, Omit<BaseButton.Props, 'children'> {}

/** Ask for a new answer. The arrow turns a quarter while pressed. */
export function Regenerate(props: RegenerateProps): React.ReactElement {
  const [config, { label = 'Regenerate', className, ...rest }] = useSlot(
    'MessageActions.Regenerate',
    props,
  );
  return (
    <BaseButton
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={cls(config, 'MessageActions.Regenerate', 'hj-message-actions-button', className)}
    >
      <span
        className={config.unstyled ? undefined : 'hj-message-actions-glyph'}
        data-glyph="regenerate"
      >
        <Glyph d={REFRESH} />
      </span>
    </BaseButton>
  );
}

export type FeedbackValue = 'up' | 'down' | null;

export interface FeedbackOwnProps {
  /** Controlled rating. */
  value?: FeedbackValue;
  defaultValue?: FeedbackValue;
  onValueChange?: (value: FeedbackValue) => void;
  /** Labels for the two toggles. @default { up: 'Good response', down: 'Bad response' } */
  labels?: { up: string; down: string };
}
export interface FeedbackProps
  extends FeedbackOwnProps, Omit<React.ComponentProps<'fieldset'>, 'defaultValue'> {}

const DEFAULT_LABELS = { up: 'Good response', down: 'Bad response' };

/** Thumbs up / down. One or neither is pressed; pressing the pressed one clears it. */
export function Feedback(props: FeedbackProps): React.ReactElement {
  const [
    config,
    {
      value: valueProp,
      defaultValue = null,
      onValueChange,
      labels = DEFAULT_LABELS,
      className,
      ...rest
    },
  ] = useSlot('MessageActions.Feedback', props);
  const [inner, setInner] = React.useState<FeedbackValue>(defaultValue);
  const value = valueProp === undefined ? inner : valueProp;
  const set = (next: FeedbackValue): void => {
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };
  const button = config.unstyled ? undefined : 'hj-message-actions-button';
  const glyph = config.unstyled ? undefined : 'hj-message-actions-glyph';
  return (
    <fieldset
      aria-label="Rate this response"
      {...rest}
      className={
        cls(config, 'MessageActions.Feedback', 'hj-message-actions-feedback', className) as
          | string
          | undefined
      }
    >
      <BaseToggle
        aria-label={labels.up}
        title={labels.up}
        pressed={value === 'up'}
        onPressedChange={(pressed) => set(pressed ? 'up' : null)}
        className={button}
        data-feedback="up"
      >
        <span className={glyph} data-glyph="up">
          <Glyph d={THUMB_UP} />
        </span>
      </BaseToggle>
      <BaseToggle
        aria-label={labels.down}
        title={labels.down}
        pressed={value === 'down'}
        onPressedChange={(pressed) => set(pressed ? 'down' : null)}
        className={button}
        data-feedback="down"
      >
        <span className={glyph} data-glyph="down">
          <Glyph d={THUMB_DOWN} />
        </span>
      </BaseToggle>
    </fieldset>
  );
}

/** A thin divider between groups of actions. */
export function Separator(props: React.ComponentProps<'hr'>): React.ReactElement {
  const [config, { className, ...rest }] = useSlot('MessageActions.Separator', props);
  return (
    <hr
      aria-orientation="vertical"
      {...rest}
      className={
        cls(config, 'MessageActions.Separator', 'hj-message-actions-separator', className) as
          | string
          | undefined
      }
    />
  );
}
