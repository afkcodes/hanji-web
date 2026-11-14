'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

type Length = number | string;
const toCss = (v: Length | undefined): string | undefined =>
  v === undefined ? undefined : typeof v === 'number' ? `${v}px` : v;

/** Props hanji adds to a skeleton block. */
export interface RootOwnProps {
  /** rect = media and cards · circle = avatars · text = one line at the current font size. */
  shape?: 'rect' | 'circle' | 'text';
  /** Width (px or any CSS length). Text lines default to 100%. */
  width?: Length;
  /** Height (px or any CSS length). Circles use width when height is omitted. */
  height?: Length;
  render?: useRender.RenderProp;
}

export interface RootProps
  extends RootOwnProps, Omit<React.ComponentProps<'span'>, 'className' | 'children'> {
  className?: string;
}

/**
 * A still block in the shape of what is coming, with one soft highlight passing over it. It is
 * decoration: hidden from assistive tech, and still under reduced motion. Mark the loading region
 * with `aria-busy`.
 *
 * @example
 * <div aria-busy="true"><Skeleton.Root shape="circle" width={40} /><Skeleton.Text lines={2} /></div>
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    shape = 'rect',
    width,
    height,
    render,
    className,
    style,
    ...rest
  } = withDefaults(config, 'Skeleton.Root', props);
  const w = toCss(width);
  const h = toCss(height ?? (shape === 'circle' ? width : undefined));
  const sized = w || h ? { width: w, height: h, ...style } : style;
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      'aria-hidden': true,
      ...rest,
      style: sized,
      'data-shape': shape,
      className: cls(config, 'Skeleton.Root', 'hj-skeleton', className) as string | undefined,
    },
  });
}

/** Props hanji adds to a block of text lines. */
export interface TextOwnProps {
  /** How many lines. The last is shorter, as real paragraphs are. @default 3 */
  lines?: number;
  /** Width of the last line. @default '60%' */
  lastLine?: Length;
  render?: useRender.RenderProp;
}

export interface TextProps
  extends TextOwnProps, Omit<React.ComponentProps<'span'>, 'className' | 'children'> {
  className?: string;
}

/** A paragraph's worth of skeleton lines, at the line height of the surrounding text. */
export function Text(props: TextProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    lines = 3,
    lastLine = '60%',
    render,
    className,
    ...rest
  } = withDefaults(config, 'Skeleton.Text', props);
  const count = Math.max(1, Math.floor(lines));
  const last = toCss(lastLine);
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      'aria-hidden': true,
      ...rest,
      className: cls(config, 'Skeleton.Text', 'hj-skeleton-text', className) as string | undefined,
      children: Array.from({ length: count }, (_, i) => (
        <Root
          // oxlint-disable-next-line react/no-array-index-key -- lines are positional and never reorder
          key={i}
          shape="text"
          width={i === count - 1 && count > 1 ? last : undefined}
        />
      )),
    },
  });
}
