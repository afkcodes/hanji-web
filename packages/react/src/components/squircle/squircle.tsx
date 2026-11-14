'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, withDefaults } from '../../system/slot.ts';
import { cornerShape, squirclePath } from './squircle-path.ts';

export { cornerShape, squirclePath } from './squircle-path.ts';

const supportsCornerShape = (): boolean =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('corner-shape', 'superellipse(2)');

/** Props hanji adds. */
export interface SquircleOwnProps {
  /** A radius token or px. @default 'md' */
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  /** 0 = circular · .72 = hanji (default) · 1 = most continuous. */
  smoothing?: number;
  /**
   * Draw with a measured clip-path even where CSS corner-shape exists — pixel-identical to the
   * native library. Default: only when corner-shape is unsupported.
   */
  exact?: boolean;
}

export interface SquircleProps
  extends SquircleOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * A continuous-corner surface (hanji `Squircle`). Uses CSS `corner-shape` where the browser has
 * it — zero JavaScript — and otherwise clips to the exact figma squircle, re-measured on resize.
 * Clip-path also clips focus rings and shadows, so prefer it for art, avatars and tiles.
 */
export function Squircle(props: SquircleProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    radius = 'md',
    smoothing = 0.72,
    exact = false,
    render,
    className,
    style,
    ...rest
  } = withDefaults(config, 'Squircle', props);
  const ref = React.useRef<HTMLElement>(null);
  const [clip, setClip] = React.useState<string | undefined>(undefined);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || (!exact && supportsCornerShape())) {
      setClip(undefined);
      return undefined;
    }
    // From the radius token, never the element's border-radius: once clipped, that is 0, and the
    // ResizeObserver's first call (and every resize) would redraw the clip square.
    const px = (): number => {
      if (typeof radius === 'number') return radius;
      const cs = getComputedStyle(el);
      const token = Number.parseFloat(cs.getPropertyValue('--hj-squircle-radius'));
      return Number.isFinite(token) ? token : Number.parseFloat(cs.borderTopLeftRadius) || 0;
    };
    const measure = (): void => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0)
        setClip(`path('${squirclePath(width, height, px(), smoothing)}')`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [radius, smoothing, exact, ref]);

  const radiusValue = typeof radius === 'number' ? `${radius}px` : `var(--hj-r-${radius})`;
  const own = {
    '--hj-squircle-radius': radiusValue,
    '--hj-squircle-shape': cornerShape(smoothing),
    '--hj-squircle-span': String(1 + Math.max(0, Math.min(1, smoothing))),
    ...(clip ? { clipPath: clip, borderRadius: 0 } : null),
    ...style,
  } as React.CSSProperties;

  return useRender({
    render,
    ref,
    defaultTagName: 'div',
    props: {
      ...rest,
      'data-clipped': clip ? '' : undefined,
      className: cls(config, 'Squircle', 'hj-squircle', className) as string | undefined,
      style: own,
    },
  });
}
