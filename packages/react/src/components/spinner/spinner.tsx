'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

/** Props hanji adds to the spinner. */
export interface SpinnerOwnProps {
  /** sm 16 (inline) · md 20 (buttons) · lg 40 (a page or a panel). */
  size?: 'sm' | 'md' | 'lg';
  /** accent, or `current` to take the surrounding text colour (inside buttons). */
  tone?: 'accent' | 'current';
  /**
   * Wait before appearing, so fast work never flashes a ring. `true` = 400 ms, or a number of ms.
   * @default false
   */
  delay?: boolean | number;
  /** Accessible name. Defaults to the provider's `strings.loading`. */
  label?: string;
  render?: useRender.RenderProp;
}

export interface SpinnerProps
  extends SpinnerOwnProps, Omit<React.ComponentProps<'span'>, 'className' | 'children'> {
  className?: string;
}

const DEFAULT_DELAY = 400;

/**
 * The ink ring: a constant turn, a tail that fades behind a round head. Feedback, not
 * decoration — under reduced motion it pulses in place instead of turning.
 *
 * @example
 * <Spinner delay /> {/* appears only if the wait passes 400 ms *\/}
 */
export function Spinner(props: SpinnerProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    size = 'md',
    tone = 'accent',
    delay = false,
    label,
    render,
    className,
    ...rest
  } = withDefaults(config, 'Spinner', props);
  const wait = delay === true ? DEFAULT_DELAY : typeof delay === 'number' ? delay : 0;
  const [shown, setShown] = React.useState(wait === 0);
  React.useEffect(() => {
    if (wait === 0) return undefined;
    const t = window.setTimeout(() => setShown(true), wait);
    return () => window.clearTimeout(t);
  }, [wait]);

  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      role: shown ? 'progressbar' : undefined,
      'aria-label': shown ? (label ?? config.strings.loading) : undefined,
      'aria-hidden': shown ? undefined : true,
      ...rest,
      'data-size': size,
      'data-tone': tone,
      'data-waiting': flag(!shown),
      className: cls(config, 'Spinner', 'hj-spinner', className) as string | undefined,
      children: <span className={config.unstyled ? undefined : 'hj-spinner-ring'} />,
    },
  });
}
