'use client';
import { Collapsible as Base } from '@base-ui/react/collapsible';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

export type ToolCallStatus = 'pending' | 'running' | 'done' | 'failed' | 'needs-approval';

const StatusContext = React.createContext<ToolCallStatus>('pending');

/** Props hanji adds to the Root. */
export interface RootOwnProps {
  /**
   * pending (queued) · running (spinner) · done · failed · needs-approval (a person must
   * approve before it runs — opens by default).
   */
  status?: ToolCallStatus;
}
export interface RootProps extends RootOwnProps, Base.Root.Props {}

/**
 * One tool the assistant called: a collapsible card with its name, status, arguments and result.
 *
 * @example
 * <ToolCall.Root status="done">
 *   <ToolCall.Trigger><ToolCall.Name>library.search</ToolCall.Name><ToolCall.Status duration="0.4 s" /></ToolCall.Trigger>
 *   <ToolCall.Panel>
 *     <ToolCall.Section label="Arguments"><ToolCall.Code>{json}</ToolCall.Code></ToolCall.Section>
 *   </ToolCall.Panel>
 * </ToolCall.Root>
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    status = 'pending',
    className,
    defaultOpen,
    ...rest
  } = withDefaults(config, 'ToolCall.Root', props);
  return (
    <StatusContext.Provider value={status}>
      <Base.Root
        defaultOpen={defaultOpen ?? status === 'needs-approval'}
        {...rest}
        data-status={status}
        className={cls(config, 'ToolCall.Root', 'hj-tool-call', className)}
      />
    </StatusContext.Provider>
  );
}

export interface TriggerOwnProps {
  /** Replace the tool glyph at the start. */
  icon?: React.ReactNode;
}
export interface TriggerProps extends TriggerOwnProps, Base.Trigger.Props {}

/** The header row: tool glyph, children (Name, Status), and a chevron that turns when open. */
export function Trigger(props: TriggerProps): React.ReactElement {
  const config = useHanjiConfig();
  const { icon, className, children, ...rest } = withDefaults(config, 'ToolCall.Trigger', props);
  const styled = !config.unstyled;
  return (
    <Base.Trigger
      {...rest}
      className={cls(config, 'ToolCall.Trigger', 'hj-tool-call-trigger', className)}
    >
      <span className={styled ? 'hj-tool-call-icon' : undefined} aria-hidden="true">
        {icon ?? config.icons.tool}
      </span>
      {children}
      <span className={styled ? 'hj-tool-call-chevron' : undefined} aria-hidden="true">
        {config.icons.chevronDown}
      </span>
    </Base.Trigger>
  );
}

/** The tool's name, in mono. */
export const Name: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'ToolCall.Name',
  'hj-tool-call-name',
);

const STATUS_WORD: Record<ToolCallStatus, string> = {
  pending: 'Queued',
  running: 'Running',
  done: 'Done',
  failed: 'Failed',
  'needs-approval': 'Needs approval',
};

export interface StatusOwnProps {
  /** How long it took, e.g. `0.4 s`. Shown after the word. */
  duration?: string;
}
export interface StatusProps extends StatusOwnProps, React.ComponentProps<'span'> {}

/** Word + glyph + tint for the Root's status — never colour alone. Children replace the word. */
export function Status(props: StatusProps): React.ReactElement {
  const config = useHanjiConfig();
  const status = React.useContext(StatusContext);
  const { duration, className, children, ...rest } = withDefaults(config, 'ToolCall.Status', props);
  const styled = !config.unstyled;
  const glyph =
    status === 'running' ? (
      <span className={styled ? 'hj-tool-call-spinner' : undefined} />
    ) : status === 'done' ? (
      config.icons.checkCircle
    ) : status === 'failed' ? (
      config.icons.xCircle
    ) : status === 'needs-approval' ? (
      config.icons.alert
    ) : (
      <span className={styled ? 'hj-tool-call-dot' : undefined} />
    );
  return (
    <span
      {...rest}
      data-status={status}
      className={
        cls(config, 'ToolCall.Status', 'hj-tool-call-status', className) as string | undefined
      }
    >
      <span className={styled ? 'hj-tool-call-status-glyph' : undefined} aria-hidden="true">
        {glyph}
      </span>
      {children ?? STATUS_WORD[status]}
      {duration ? (
        <span className={styled ? 'hj-tool-call-duration' : undefined}>{duration}</span>
      ) : null}
    </span>
  );
}

/** The details. Height reveal via Base UI's --collapsible-panel-height. */
export function Panel(props: Base.Panel.Props): React.ReactElement {
  const config = useHanjiConfig();
  const { className, children, ...rest } = withDefaults(config, 'ToolCall.Panel', props);
  return (
    <Base.Panel
      {...rest}
      className={cls(config, 'ToolCall.Panel', 'hj-tool-call-panel', className)}
    >
      <div className={config.unstyled ? undefined : 'hj-tool-call-body'}>{children}</div>
    </Base.Panel>
  );
}

export interface SectionOwnProps {
  /** Eyebrow above the block: Arguments, Result, Error. */
  label?: React.ReactNode;
}
export interface SectionProps
  extends SectionOwnProps, Omit<React.ComponentProps<'section'>, 'className'> {
  className?: string;
  render?: useRender.RenderProp;
}

/** A labelled block inside the panel. */
export function Section(props: SectionProps): React.ReactElement {
  const config = useHanjiConfig();
  const { label, className, render, children, ...rest } = withDefaults(
    config,
    'ToolCall.Section',
    props,
  );
  return useRender({
    render,
    defaultTagName: 'section',
    props: {
      ...rest,
      className: cls(config, 'ToolCall.Section', 'hj-tool-call-section', className) as
        | string
        | undefined,
      children: (
        <>
          {label ? (
            <div className={config.unstyled ? undefined : 'hj-tool-call-label'}>{label}</div>
          ) : null}
          {children}
        </>
      ),
    },
  });
}

/** Arguments or a result, in mono. Objects are shown as indented JSON. */
export interface CodeOwnProps {
  /** A value to show as JSON. Children win when both are given. */
  value?: unknown;
}
export interface CodeProps extends CodeOwnProps, React.ComponentProps<'pre'> {}

export function Code(props: CodeProps): React.ReactElement {
  const config = useHanjiConfig();
  const { value, className, children, ...rest } = withDefaults(config, 'ToolCall.Code', props);
  const text =
    children ??
    (value === undefined
      ? null
      : typeof value === 'string'
        ? value
        : JSON.stringify(value, null, 2));
  return (
    <pre
      {...rest}
      className={cls(config, 'ToolCall.Code', 'hj-tool-call-code', className) as string | undefined}
    >
      <code>{text}</code>
    </pre>
  );
}

/**
 * The human-in-the-loop row: what will happen, and Approve / Deny. Use for anything that spends
 * money, sends, deletes or changes access — never run those without a person approving.
 */
export const Approval: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'ToolCall.Approval',
  'hj-tool-call-approval',
);
