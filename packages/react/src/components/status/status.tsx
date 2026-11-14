'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import type { IconName } from '../../system/icons.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pending';

/** Props hanji adds to the status element. */
export interface StatusOwnProps {
  /** What state it names. Each tone has a glyph, so status is never colour alone. */
  tone?: StatusTone;
  /** tint = pill on a soft fill (in lists, tables) · plain = glyph + word only (inline in text). */
  variant?: 'tint' | 'plain';
  /** A muted qualifier after the word — usually when: “2 min ago”, “since 09:14”. */
  meta?: React.ReactNode;
  /** Hide the glyph. Only when the word alone is unmistakable. @default true */
  icon?: boolean;
  render?: useRender.RenderProp;
}

export interface StatusProps
  extends StatusOwnProps, Omit<React.ComponentProps<'span'>, 'className'> {
  className?: string;
}

const GLYPH: Readonly<Record<Exclude<StatusTone, 'pending' | 'neutral'>, IconName>> = {
  success: 'checkCircle',
  warning: 'alert',
  danger: 'xCircle',
  info: 'info',
};

/**
 * A state in words: word + glyph + tint, and when it happened. Pending carries a live ring that
 * pulses while the work runs (and holds still when motion is reduced).
 *
 * @example
 * <Status tone="success" meta="2 min ago">Synced</Status>
 * <Status tone="danger">Couldn’t sync</Status>
 */
export function Status(props: StatusProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    tone = 'neutral',
    variant = 'tint',
    meta,
    icon = true,
    render,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Status', props);
  const styled = !config.unstyled;
  let glyph: React.ReactNode = null;
  if (icon) {
    if (tone === 'pending' || tone === 'neutral') {
      glyph = (
        <span
          className={styled ? 'hj-status-dot' : undefined}
          aria-hidden="true"
          data-tone={tone}
        />
      );
    } else {
      glyph = (
        <span className={styled ? 'hj-status-glyph' : undefined} aria-hidden="true">
          {config.icons[GLYPH[tone]]}
        </span>
      );
    }
  }
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      ...rest,
      'data-tone': tone,
      'data-variant': variant,
      className: cls(config, 'Status', 'hj-status', className) as string | undefined,
      children: (
        <>
          {glyph}
          <span className={styled ? 'hj-status-word' : undefined}>{children}</span>
          {meta !== undefined && meta !== null ? (
            <span className={styled ? 'hj-status-meta' : undefined}>{meta}</span>
          ) : null}
        </>
      ),
    },
  });
}
