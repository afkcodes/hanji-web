'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

export interface RootOwnProps {
  /**
   * The whole card is one target: hover steps up a paper, press dips to .97. Render it as a
   * link or button (`render={<a href="…" />}`) so it is reachable and announced.
   */
  pressable?: boolean;
  /** vertical = media on top · horizontal = a compact row with square media. @default 'vertical' */
  orientation?: 'vertical' | 'horizontal';
}
export interface RootProps extends RootOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
  render?: useRender.RenderProp;
}

/** A surface for one thing: an album, an episode, an article. Not a layout tool. */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    pressable = false,
    orientation = 'vertical',
    render,
    className,
    ...rest
  } = withDefaults(config, 'Card.Root', props);
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...rest,
      'data-pressable': flag(pressable),
      'data-orientation': orientation,
      className: cls(config, 'Card.Root', 'hj-card', className) as string | undefined,
    },
  });
}

export interface MediaOwnProps {
  /** Aspect ratio of the media. @default '16:9' (hanji card media) */
  ratio?: '16:9' | '4:3' | '1:1' | '3:4';
}
export interface MediaProps extends MediaOwnProps, ElementPartProps<'div'> {}

const RATIO: Readonly<Record<NonNullable<MediaOwnProps['ratio']>, string>> = {
  '16:9': '16 / 9',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
  '3:4': '3 / 4',
};

/** Image or art, full bleed. Put an `<img>` (object-fit: cover) or any art inside. */
export function Media(props: MediaProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    ratio = '16:9',
    render,
    className,
    style,
    ...rest
  } = withDefaults(config, 'Card.Media', props);
  const merged = { '--_ratio': RATIO[ratio], ...style } as React.CSSProperties;
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...rest,
      style: merged,
      className: cls(config, 'Card.Media', 'hj-card-media', className) as string | undefined,
    },
  });
}

export const Body: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Card.Body',
  'hj-card-body',
);
/** Optional small label above the title. */
export const Eyebrow: (props: ElementPartProps<'p'>) => React.ReactElement = elementPart(
  'p',
  'Card.Eyebrow',
  'hj-card-eyebrow',
);
export const Title: (props: ElementPartProps<'h3'>) => React.ReactElement = elementPart(
  'h3',
  'Card.Title',
  'hj-card-title',
);
export const Description: (props: ElementPartProps<'p'>) => React.ReactElement = elementPart(
  'p',
  'Card.Description',
  'hj-card-description',
);
/** Meta row at the bottom: counts, time, a quiet action. */
export const Footer: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Card.Footer',
  'hj-card-footer',
);
