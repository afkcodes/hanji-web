/**
 * hanji's motion vocabulary (@hanji/core tokens/motion.ts + motion/policy.ts), plus the compiler
 * that turns a spring into a CSS `linear()` easing so springs run with zero JavaScript.
 */

export interface Spring {
  readonly damping: number;
  readonly stiffness: number;
  readonly mass: number;
}

export const springNames = ['snappy', 'gentle', 'bouncy'] as const;
export type SpringName = (typeof springNames)[number];

export const springs: Readonly<Record<SpringName, Spring>> = {
  /** Controls and anything the finger just let go of. */
  snappy: { damping: 28, stiffness: 380, mass: 1 },
  /** Things arriving: sheets, lists, reveals. */
  gentle: { damping: 24, stiffness: 210, mass: 1 },
  /** Celebration only. Its overshoot is the point, so it never gates state. */
  bouncy: { damping: 14, stiffness: 320, mass: 1 },
};

/** Under reduced motion every spring becomes critically damped (~40 ms). */
export const REDUCED_SPRING: Spring = { damping: 240, stiffness: 14400, mass: 1 };

export const durations: Readonly<{ fast: number; base: number; slow: number }> = {
  fast: 180,
  base: 260,
  slow: 400,
};

/** Ease-out cubic: fast at the start, gentle at the end. */
export const EASE_OUT_CUBIC = 'cubic-bezier(.33, 1, .68, 1)';

/** One clock per surface: 24 ms a step, counting stops at ten, rows rise 12. */
export const stagger: Readonly<{ stepMs: number; cap: number; rise: number }> = {
  stepMs: 24,
  cap: 10,
  rise: 12,
};

/** Press feedback: scale for controls, opacity for rows. */
export const press: Readonly<{ scale: number; opacity: number }> = { scale: 0.97, opacity: 0.75 };

/** A unit spring sampled over time. */
export interface SpringCurve {
  /** Positions from 0 to 1, one per `stepMs`. */
  readonly points: readonly number[];
  /** Milliseconds until rest (or until the first crossing, when clamped). */
  readonly duration: number;
}

/**
 * Integrate a unit spring 0 → 1 (semi-implicit Euler, 1 ms steps).
 * `clamp` stops at the first crossing — Reanimated's `overshootClamping`, i.e. hanji's `settle()`.
 */
export function simulateSpring(spring: Spring, clamp = false, stepMs = 1): SpringCurve {
  const { stiffness: k, damping: c, mass: m } = spring;
  let x = 0;
  let v = 0;
  let t = 0;
  const points: number[] = [0];
  for (; t < 4000; t++) {
    const a = (-k * (x - 1) - c * v) / m;
    v += a / 1000;
    x += v / 1000;
    if (clamp && x >= 1) {
      t++;
      break;
    }
    if ((t + 1) % stepMs === 0) points.push(x);
    const energy = 0.5 * k * (x - 1) ** 2 + 0.5 * m * v * v;
    if (Math.abs(x - 1) < 1e-3 && energy < 1e-6 * k) {
      t++;
      break;
    }
  }
  if (points.at(-1) !== 1) points.push(1);
  return { points, duration: t };
}

/** Compile a spring to a CSS `linear()` easing and its duration. */
export function springToCss(
  spring: Spring,
  clamp = false,
  maxStops = 48,
): { easing: string; duration: number } {
  const curve = simulateSpring(spring, clamp, 1);
  const n = curve.points.length;
  const step = Math.max(1, Math.ceil(n / maxStops));
  const stops: string[] = [];
  for (let i = 0; i < n; i += step) stops.push(String(+(curve.points[i] ?? 1).toFixed(4)));
  if (stops.at(-1) !== '1') stops.push('1');
  return { easing: `linear(${stops.join(', ')})`, duration: curve.duration };
}

/** Damping ratio ζ: below 1 overshoots, 1 is critical, above 1 creeps. */
export function dampingRatio(spring: Spring): number {
  return spring.damping / (2 * Math.sqrt(spring.stiffness * spring.mass));
}
