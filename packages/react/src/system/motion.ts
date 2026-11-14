'use client';
import { REDUCED_SPRING, springs } from '@hanji/tokens';
import type { Spring, SpringName } from '@hanji/tokens';
import * as React from 'react';

/**
 * Most hanji motion is CSS: springs are compiled to `linear()` easings at build time and run on
 * the compositor with zero JavaScript. This module is for the few values a finger drives
 * (drag, swipe, scrub), where the spring must be interruptible and keep its velocity.
 */

export interface SpringOptions {
  spring?: SpringName | Spring;
  /** Stop at the first crossing (hanji `settle()`): use whenever completion gates state. */
  clamp?: boolean;
  /** Ignore the reduced-motion policy (only for visualising springs). */
  ignorePolicy?: boolean;
  onUpdate: (value: number, velocity: number) => void;
  onRest?: (value: number) => void;
}

/** True when the nearest `data-hj-motion` or the system asks for reduced motion. */
export function prefersReducedMotion(el?: Element | null): boolean {
  const scoped = el?.closest('[data-hj-motion]')?.getAttribute('data-hj-motion');
  if (scoped === 'reduced') return true;
  if (scoped === 'full') return false;
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * An interruptible spring on one number. Retargeting keeps the current velocity, so a flick
 * that reverses mid-flight never jumps. Integrates in 1 ms steps; one rAF loop, released at rest.
 */
export class SpringValue {
  x: number;
  v = 0;
  private target: number;
  private raf = 0;
  private last = 0;
  private eps = 1e-3;
  private o: SpringOptions;
  reduced = false;

  constructor(value: number, options: SpringOptions) {
    this.x = value;
    this.target = value;
    this.o = options;
  }

  private cfg(): Spring {
    if (this.reduced && !this.o.ignorePolicy) return REDUCED_SPRING;
    const s = this.o.spring ?? 'snappy';
    return typeof s === 'string' ? springs[s] : s;
  }

  /** Replace options (callbacks, spring, clamp) without interrupting the motion. */
  configure(options: Partial<SpringOptions>): this {
    this.o = { ...this.o, ...options };
    return this;
  }

  to(target: number, velocity?: number): this {
    this.target = target;
    if (velocity !== undefined) this.v = velocity;
    this.eps = Math.max(Math.abs(target - this.x), 1) * 1e-3;
    if (!this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    }
    return this;
  }

  set(value: number): this {
    this.stop();
    this.x = this.target = value;
    this.v = 0;
    this.o.onUpdate(value, 0);
    return this;
  }

  stop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private frame = (now: number): void => {
    const { stiffness: k, damping: c, mass: m } = this.cfg();
    const clamp = this.o.clamp || (this.reduced && !this.o.ignorePolicy);
    const ms = Math.min(48, Math.max(1, now - this.last));
    this.last = now;
    const from = this.x;
    for (let i = 0; i < ms; i++) {
      const a = (-k * (this.x - this.target) - c * this.v) / m;
      this.v += a / 1000;
      this.x += this.v / 1000;
      if (clamp && (from - this.target) * (this.x - this.target) <= 0) {
        this.x = this.target;
        this.v = 0;
        break;
      }
    }
    const rest = Math.abs(this.x - this.target) < this.eps && Math.abs(this.v) < this.eps * 20;
    if (rest) {
      this.x = this.target;
      this.v = 0;
    }
    this.o.onUpdate(this.x, this.v);
    if (rest) {
      this.raf = 0;
      this.o.onRest?.(this.x);
      return;
    }
    this.raf = requestAnimationFrame(this.frame);
  };
}

/**
 * A spring whose updates go straight to the DOM (no React state, no re-renders).
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const y = useSpring(0, { spring: 'gentle', onUpdate: (v) => { ref.current!.style.transform = `translateY(${v}px)`; } });
 * y.to(320, flickVelocity);
 */
export function useSpring(initial: number, options: SpringOptions): SpringValue {
  const [spring] = React.useState(() => new SpringValue(initial, options));
  // Latest callbacks without re-creating the spring (and without touching refs during render).
  React.useLayoutEffect(() => {
    spring.configure(options);
  });
  React.useEffect(() => () => spring.stop(), [spring]);
  return spring;
}
