'use client';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseGroup } from '@base-ui/react/radio-group';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

/**
 * hanji segmented-track: the indicator is ONE element of a fixed drawn width (the widest
 * segment), moved by translateX and squeezed by scaleX ≤ 1 — never a box whose width and left
 * are animated (PRINCIPLES §1).
 */
function place(root: HTMLElement, indicator: HTMLElement): boolean {
  const items = Array.from(root.querySelectorAll<HTMLElement>(':scope > [data-hj-segment]'));
  const chosen = items.find((i) => i.hasAttribute('data-checked'));
  if (!chosen || items.length === 0) {
    indicator.style.opacity = '0';
    return false;
  }
  const widest = Math.max(...items.map((i) => i.offsetWidth));
  if (widest === 0) return false;
  const w = chosen.offsetWidth;
  const x = chosen.offsetLeft + w / 2 - widest / 2;
  indicator.style.width = `${widest}px`;
  indicator.style.transform = `translateX(${x}px) scaleX(${w / widest})`;
  indicator.style.opacity = '1';
  return true;
}

export interface RootOwnProps {
  /** md = 40 (hanji), sm = 32. */
  size?: 'sm' | 'md';
  /** Stretch to the container; segments share the width equally. */
  block?: boolean;
}
export interface RootProps extends RootOwnProps, React.ComponentProps<typeof BaseGroup> {}

/**
 * Two to five short, mutually exclusive options in one pill. Radio semantics: arrows move the
 * choice, Tab leaves. The accent-soft indicator slides under the chosen segment.
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    size = 'md',
    block = false,
    className,
    children,
    onValueChange,
    ...rest
  } = withDefaults(config, 'SegmentedControl.Root', props);
  // The indicator's parent is the root, so the caller's own `ref` passes through untouched.
  const indicatorRef = React.useRef<HTMLSpanElement>(null);
  const [, bump] = React.useReducer((n: number) => n + 1, 0);

  // After every commit (a new choice re-renders us through onValueChange) re-place the pill.
  React.useLayoutEffect(() => {
    const ind = indicatorRef.current;
    const root = ind?.parentElement;
    if (root && ind) place(root, ind);
  });

  // First placement assigns without motion; resizes and late fonts re-measure.
  React.useLayoutEffect(() => {
    const ind = indicatorRef.current;
    const root = ind?.parentElement;
    if (!root || !ind) return undefined;
    place(root, ind);
    const raf = requestAnimationFrame(() => root.setAttribute('data-ready', ''));
    const ro = new ResizeObserver(() => place(root, ind));
    ro.observe(root);
    for (const item of root.querySelectorAll(':scope > [data-hj-segment]')) ro.observe(item);
    void document.fonts?.ready.then(() => place(root, ind));
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const handleChange: NonNullable<RootProps['onValueChange']> = (value, details) => {
    onValueChange?.(value, details);
    bump();
  };

  return (
    <BaseGroup
      {...rest}
      onValueChange={handleChange}
      data-size={size}
      data-block={flag(block)}
      className={cls(config, 'SegmentedControl.Root', 'hj-segmented-control', className)}
    >
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className={config.unstyled ? undefined : 'hj-segmented-control-indicator'}
      />
      {children}
    </BaseGroup>
  );
}

export interface ItemProps extends BaseRadio.Root.Props {}

/** One segment. Text, an icon, or both; icon-only segments need an aria-label. */
export function Item(props: ItemProps): React.ReactElement {
  const config = useHanjiConfig();
  const { className, ...rest } = withDefaults(config, 'SegmentedControl.Item', props);
  return (
    <BaseRadio.Root
      {...rest}
      data-hj-segment=""
      className={cls(config, 'SegmentedControl.Item', 'hj-segmented-control-item', className)}
    />
  );
}
