'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { prefersReducedMotion } from '../../system/motion.ts';
import { cls, flag, withDefaults } from '../../system/slot.ts';

export interface MarqueeOwnProps {
  /** Travel speed in px per second. @default 45 */
  speed?: number;
  /** Space between the end of the text and its repeat, in px. @default 40 */
  gap?: number;
  /** Pause at the start of every pass, in ms. @default 1200 */
  dwell?: number;
  /** Stop while hovered or focused, so it can be read. @default true */
  pauseOnHover?: boolean;
}

export type MarqueeProps = MarqueeOwnProps &
  Omit<React.ComponentProps<'div'>, 'className'> & {
    className?: string;
    render?: useRender.RenderProp;
  };

/** Allowance before text counts as overflowing (hanji MARQUEE_SLACK). */
const SLACK = 2;

export interface MarqueePlan {
  /** Whether the text is wider than the box. */
  overflows: boolean;
  /** One full pass: text width + gap, px. */
  distance: number;
  /** Total cycle including the dwell, ms. */
  duration: number;
  /** Where the dwell ends, as a keyframe offset 0–1. */
  dwellOffset: number;
}

/** The arithmetic, kept pure so it can be tested (PRINCIPLES §19: check the numbers first). */
export function planMarquee(
  boxWidth: number,
  textWidth: number,
  { speed = 45, gap = 40, dwell = 1200 }: { speed?: number; gap?: number; dwell?: number } = {},
): MarqueePlan {
  const overflows = textWidth > boxWidth + SLACK;
  const distance = textWidth + gap;
  const travel = (distance / Math.max(1, speed)) * 1000;
  const duration = dwell + travel;
  return { overflows, distance, duration, dwellOffset: duration > 0 ? dwell / duration : 0 };
}

/**
 * A single line that is too long for its box. It rests for 1.2 s so the start can be read, then
 * travels at 45 px/s and loops seamlessly — only when it actually overflows. Under reduced
 * motion, or off-screen, it stops; reduced motion shows an ellipsis instead.
 */
export function Marquee(props: MarqueeProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    speed = 45,
    gap = 40,
    dwell = 1200,
    pauseOnHover = true,
    render,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Marquee', props);
  const rootRef = React.useRef<HTMLElement | null>(null);
  const trackRef = React.useRef<HTMLSpanElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [overflows, setOverflows] = React.useState(false);
  const [running, setRunning] = React.useState(false);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const text = textRef.current;
    if (!root || !track || !text) return undefined;
    let anim: Animation | null = null;
    let visible = true;
    let hovered = false;

    const sync = (): void => {
      if (!anim) return;
      if (visible && !hovered) anim.play();
      else anim.pause();
    };
    const build = (): void => {
      anim?.cancel();
      anim = null;
      const plan = planMarquee(root.clientWidth, text.scrollWidth, { speed, gap, dwell });
      const reduced = prefersReducedMotion(root);
      setOverflows(plan.overflows);
      setRunning(plan.overflows && !reduced);
      if (!plan.overflows || reduced || typeof track.animate !== 'function') return;
      anim = track.animate(
        [
          { transform: 'translateX(0)', offset: 0 },
          { transform: 'translateX(0)', offset: plan.dwellOffset },
          { transform: `translateX(${-plan.distance}px)`, offset: 1 },
        ],
        { duration: plan.duration, iterations: Infinity, easing: 'linear' },
      );
      sync();
    };

    build();
    const ro = new ResizeObserver(() => build());
    ro.observe(root);
    ro.observe(text);
    // Decoration releases its clock when nobody can see it.
    const io =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver((entries) => {
            visible = entries.some((e) => e.isIntersecting);
            sync();
          })
        : null;
    io?.observe(root);
    // The motion policy can change at runtime (a Theme or the system setting).
    const mo = new MutationObserver(() => build());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-hj-motion'] });
    const mq =
      typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    mq?.addEventListener('change', build);

    const enter = (): void => {
      hovered = true;
      sync();
    };
    const leave = (): void => {
      hovered = false;
      sync();
    };
    if (pauseOnHover) {
      root.addEventListener('pointerenter', enter);
      root.addEventListener('pointerleave', leave);
      root.addEventListener('focusin', enter);
      root.addEventListener('focusout', leave);
    }
    return () => {
      anim?.cancel();
      ro.disconnect();
      io?.disconnect();
      mo.disconnect();
      mq?.removeEventListener('change', build);
      root.removeEventListener('pointerenter', enter);
      root.removeEventListener('pointerleave', leave);
      root.removeEventListener('focusin', enter);
      root.removeEventListener('focusout', leave);
    };
    // New words change the text's size, which the ResizeObserver above already catches.
  }, [speed, gap, dwell, pauseOnHover, rootRef, trackRef, textRef]);

  const styled = !config.unstyled;
  const gapStyle = { '--hj-marquee-gap': `${gap}px` } as React.CSSProperties;
  return useRender({
    render,
    defaultTagName: 'div',
    ref: rootRef,
    props: {
      ...rest,
      'data-overflowing': flag(overflows),
      'data-running': flag(running),
      className: cls(config, 'Marquee', 'hj-marquee', className) as string | undefined,
      style: rest.style ? { ...gapStyle, ...rest.style } : gapStyle,
      children: (
        <span ref={trackRef} className={styled ? 'hj-marquee-track' : undefined}>
          <span ref={textRef} className={styled ? 'hj-marquee-text' : undefined}>
            {children}
          </span>
          {running ? (
            <span className={styled ? 'hj-marquee-text' : undefined} aria-hidden="true">
              {children}
            </span>
          ) : null}
        </span>
      ),
    },
  });
}
