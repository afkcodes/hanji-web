'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

/** The frame: holds the image, the layer and the content; clips them to its corners. */
export const Root: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Scrim.Root',
  'hj-scrim',
);

/** Props hanji adds to the gradient layer. */
export interface LayerOwnProps {
  /** Where the dark sits: bottom (titles), top (chrome over a hero), or full (text anywhere). */
  edge?: 'bottom' | 'top' | 'full';
  /** Darkness at the edge, 0–1. @default 0.72 */
  strength?: number;
  /** How far the fade reaches, as a CSS length or %. @default '64%' */
  extent?: string;
  /**
   * The colour that fades. Default the scrim token (black). Pass the art's own deep colour to
   * keep the fade in its hue — it only ever changes opacity, so it never greys.
   */
  color?: string;
  render?: useRender.RenderProp;
}

export interface LayerProps
  extends LayerOwnProps, Omit<React.ComponentProps<'span'>, 'className' | 'children'> {
  className?: string;
}

/**
 * The gradient. One RGB fading by opacity along an eased curve (five stops), so the edge of the
 * scrim is never visible. Decorative: aria-hidden.
 */
export function Layer(props: LayerProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    edge = 'bottom',
    strength = 0.72,
    extent,
    color,
    render,
    className,
    style,
    ...rest
  } = withDefaults(config, 'Scrim.Layer', props);
  const a = Math.min(1, Math.max(0, strength));
  const vars = {
    '--hj-scrim-strength': `${Math.round(a * 1000) / 10}%`,
    ...(extent ? { '--hj-scrim-extent': extent } : null),
    ...(color ? { '--hj-scrim-color': color } : null),
    ...style,
  } as React.CSSProperties;
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      'aria-hidden': true,
      ...rest,
      style: vars,
      'data-edge': edge,
      className: cls(config, 'Scrim.Layer', 'hj-scrim-layer', className) as string | undefined,
    },
  });
}

/** Props hanji adds to the content block. */
export interface ContentOwnProps {
  /** Where the content sits; match the Layer's edge. @default 'bottom' */
  edge?: 'bottom' | 'top' | 'center';
  render?: useRender.RenderProp;
}

export interface ContentProps
  extends ContentOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
}

/**
 * Content over the image. Ink inside is always light: the fg tokens are re-pointed at on-scrim,
 * so hanji text and controls placed here read correctly on every paper.
 */
export function Content(props: ContentProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    edge = 'bottom',
    render,
    className,
    ...rest
  } = withDefaults(config, 'Scrim.Content', props);
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...rest,
      'data-edge': edge,
      className: cls(config, 'Scrim.Content', 'hj-scrim-content', className) as string | undefined,
    },
  });
}
