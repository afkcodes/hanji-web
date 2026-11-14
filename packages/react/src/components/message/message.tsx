'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

export type MessageFrom = 'user' | 'assistant' | 'system';
export type MessageStatus = 'complete' | 'streaming' | 'error';

/** Props hanji adds to the message row. */
export interface RootOwnProps {
  /** Who wrote it. user = bubble on the right · assistant = flush on the paper · system = a quiet centred note. */
  from?: MessageFrom;
  /** complete · streaming (still arriving) · error (failed; show Message.Error with a retry). */
  status?: MessageStatus;
}
export interface RootProps extends RootOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * One turn in a conversation.
 *
 * @example
 * <Message.Root from="assistant">
 *   <Message.Avatar>…</Message.Avatar>
 *   <Message.Content>…</Message.Content>
 *   <Message.Footer><MessageActions.Root>…</MessageActions.Root></Message.Footer>
 * </Message.Root>
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    from = 'assistant',
    status = 'complete',
    className,
    render,
    ...rest
  } = withDefaults(config, 'Message.Root', props);
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...rest,
      'data-from': from,
      'data-status': status,
      'data-streaming': flag(status === 'streaming'),
      'aria-busy': status === 'streaming' || undefined,
      className: cls(config, 'Message.Root', 'hj-message', className) as string | undefined,
    },
  });
}

/** 28px slot for an avatar or the assistant's mark. Decorative: name the author in Author. */
export const Avatar: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Message.Avatar',
  'hj-message-avatar',
);
/** The author line above the content (model name, person, time). */
export const Author: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Message.Author',
  'hj-message-author',
);
/** The body. A bubble for the user; flush text for the assistant. */
export const Content: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Message.Content',
  'hj-message-content',
);
/** Under the content: time, MessageActions, attachments, sources. */
export const Footer: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Message.Footer',
  'hj-message-footer',
);

export interface ErrorOwnProps {
  /** A retry button or link, placed after the sentence. */
  action?: React.ReactNode;
}
export interface ErrorProps extends ErrorOwnProps, React.ComponentProps<'div'> {}

/** A failed or refused reply: glyph + sentence + an optional retry. role="alert". */
export function Error(props: ErrorProps): React.ReactElement {
  const config = useHanjiConfig();
  const { action, className, children, ...rest } = withDefaults(config, 'Message.Error', props);
  const styled = !config.unstyled;
  return (
    <div
      role="alert"
      {...rest}
      className={cls(config, 'Message.Error', 'hj-message-error', className) as string | undefined}
    >
      <span className={styled ? 'hj-message-error-glyph' : undefined} aria-hidden="true">
        {config.icons.alert}
      </span>
      <span className={styled ? 'hj-message-error-text' : undefined}>{children}</span>
      {action ? (
        <span className={styled ? 'hj-message-error-action' : undefined}>{action}</span>
      ) : null}
    </div>
  );
}
