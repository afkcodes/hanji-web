'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

/** Props hanji adds to the badge. */
export interface RootOwnProps {
  /** The number. Above `max` it reads `max+` so the pill keeps a bounded width. */
  count?: number;
  /** @default 99 */
  max?: number;
  /** An 8px dot instead of a number: “something new”, no count. */
  dot?: boolean;
  /** Render when count is 0. Off by default — an empty badge is noise. */
  showZero?: boolean;
  /** accent for new things · danger only for problems · neutral for plain counts. */
  tone?: 'accent' | 'danger' | 'neutral';
  /** Accessible text, e.g. “3 unread messages”. Defaults to the count. */
  label?: string;
  render?: useRender.RenderProp;
}

export interface RootProps
  extends RootOwnProps, Omit<React.ComponentProps<'span'>, 'className' | 'children'> {
  className?: string;
}

/**
 * A count or a dot. When the count changes it pops once on the bouncy spring — the one place a
 * badge earns motion. A zero badge renders nothing unless `showZero`.
 *
 * @example
 * <Badge.Root count={3} label="3 new releases" />
 * <Badge.Anchor><Avatar.Root name="Mira Okafor" /><Badge.Root dot /></Badge.Anchor>
 */
export function Root(props: RootProps): React.ReactElement | null {
  const config = useHanjiConfig();
  const {
    count = 0,
    max = 99,
    dot = false,
    showZero = false,
    tone = 'accent',
    label,
    render,
    className,
    ref,
    ...rest
  } = withDefaults(config, 'Badge.Root', props);
  // Pop when the count changes (not on mount): track the last count in state and alternate
  // between two identical keyframes, which restarts the animation without remounting the node.
  const [last, setLast] = React.useState(count);
  const [pops, setPops] = React.useState(0);
  if (count !== last) {
    setLast(count);
    setPops((n) => n + 1);
  }

  const hidden = !dot && count <= 0 && !showZero;
  const text = dot ? '' : count > max ? `${max}+` : String(count);
  const element = useRender({
    render,
    ref,
    defaultTagName: 'span',
    enabled: !hidden,
    props: {
      role: 'status',
      'aria-label': label ?? (dot ? undefined : text),
      ...rest,
      'data-tone': tone,
      'data-dot': flag(dot),
      'data-wide': flag(text.length > 1),
      'data-pop': pops === 0 ? undefined : pops % 2 ? 'a' : 'b',
      className: cls(config, 'Badge.Root', 'hj-badge', className) as string | undefined,
      children: dot ? null : text,
    },
  });
  return element;
}

/** Props hanji adds to the anchor. */
export interface AnchorOwnProps {
  /** Where the badge sits: top-end for counts, bottom-end for presence-like dots. */
  placement?: 'top-end' | 'bottom-end';
  /** circle = the anchored thing is round (avatars): the badge tucks in toward the curve. */
  shape?: 'circle' | 'rect';
  render?: useRender.RenderProp;
}

export interface AnchorProps
  extends AnchorOwnProps, Omit<React.ComponentProps<'span'>, 'className'> {
  className?: string;
}

/** Wraps an icon, avatar or button and positions a Badge.Root over its corner. */
export function Anchor(props: AnchorProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    placement = 'top-end',
    shape = 'rect',
    render,
    className,
    ...rest
  } = withDefaults(config, 'Badge.Anchor', props);
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      ...rest,
      'data-placement': placement,
      'data-shape': shape,
      className: cls(config, 'Badge.Anchor', 'hj-badge-anchor', className) as string | undefined,
    },
  });
}
