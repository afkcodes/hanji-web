'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

/** The sequence. Renders `<ol>` — order is the point. */
export const Root: (props: ElementPartProps<'ol'>) => React.ReactElement = elementPart(
  'ol',
  'Timeline.Root',
  'hj-timeline',
);
export const Title: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Timeline.Title',
  'hj-timeline-title',
);
export const Description: (props: ElementPartProps<'p'>) => React.ReactElement = elementPart(
  'p',
  'Timeline.Description',
  'hj-timeline-description',
);
/** A slot for the step's action — Retry on a failed step, View on a done one. */
export const Actions: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Timeline.Actions',
  'hj-timeline-actions',
);

export type TimelineStatus = 'done' | 'current' | 'pending' | 'failed';

const STATUS_WORDS: Readonly<Record<TimelineStatus, string>> = {
  done: 'Done',
  current: 'In progress',
  pending: 'Not started',
  failed: 'Failed',
};

export interface ItemOwnProps {
  /** done = filled with a check · current = ring with a live pulse · pending = hollow · failed = danger with ✕. */
  status?: TimelineStatus;
  /** Words read before the step ("Failed"), so status is never only a colour. Defaults to English. */
  statusLabel?: string;
}
export type ItemProps = ItemOwnProps & ElementPartProps<'li'>;

/** One step: its marker on the rail, then Title, Time, Description and Actions. */
export function Item(props: ItemProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    status = 'pending',
    statusLabel,
    render,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Timeline.Item', props);
  const styled = !config.unstyled;
  const glyph =
    status === 'done' ? config.icons.check : status === 'failed' ? config.icons.x : null;
  return useRender({
    render,
    defaultTagName: 'li',
    props: {
      ...rest,
      'data-status': status,
      'aria-current': status === 'current' ? 'step' : undefined,
      className: cls(config, 'Timeline.Item', 'hj-timeline-item', className) as string | undefined,
      children: (
        <>
          <span className={styled ? 'hj-timeline-marker' : undefined} aria-hidden="true">
            {glyph}
          </span>
          <div className={styled ? 'hj-timeline-body' : undefined}>
            <span className="hj-sr-only">{statusLabel ?? STATUS_WORDS[status]}: </span>
            {children}
          </div>
        </>
      ),
    },
  });
}

export interface TimeOwnProps {
  /** Machine-readable timestamp for the `<time>` element (ISO 8601). */
  dateTime?: string;
  /** A relative phrase shown after the absolute time: "2 min ago", "in 1 week". */
  relative?: string;
}
export type TimeProps = TimeOwnProps & ElementPartProps<'span'>;

/** When: the absolute time (children) and, after it, the relative one. */
export function Time(props: TimeProps): React.ReactElement {
  const config = useHanjiConfig();
  const { dateTime, relative, render, className, children, ...rest } = withDefaults(
    config,
    'Timeline.Time',
    props,
  );
  const styled = !config.unstyled;
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      ...rest,
      className: cls(config, 'Timeline.Time', 'hj-timeline-time', className) as string | undefined,
      children: (
        <>
          <time dateTime={dateTime}>{children}</time>
          {relative ? (
            <span className={styled ? 'hj-timeline-relative' : undefined}> · {relative}</span>
          ) : null}
        </>
      ),
    },
  });
}
