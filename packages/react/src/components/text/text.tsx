'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

/** hanji's type roles. `hero` is one number per screen; `mono` is for timecodes and values. */
export type TextVariant =
  | 'hero'
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'sub'
  | 'label'
  | 'eyebrow'
  | 'mono';

/** Props hanji adds to a plain element. */
export interface TextOwnProps {
  /** The type role. Sets size, weight, line height and tracking from the tokens. */
  variant?: TextVariant;
  /** Ink. Omit to inherit the surrounding colour. Muted ink is for plain surfaces only. */
  tone?: 'fg' | 'dim' | 'mute' | 'accent' | 'danger' | 'success';
  /** Clip to one line with an ellipsis. */
  truncate?: boolean;
  /** Replace the element (e.g. `<h1 />` for a page title) or compose with your own component. */
  render?: useRender.RenderProp;
}

export interface TextProps extends TextOwnProps, Omit<React.ComponentProps<'p'>, 'className'> {
  className?: string;
}

/** Default element per role. Headings are a guess — pass `render` to fit the page's outline. */
const TAGS: Readonly<Record<TextVariant, keyof React.JSX.IntrinsicElements>> = {
  hero: 'p',
  display: 'h1',
  title: 'h2',
  heading: 'h3',
  subheading: 'h4',
  body: 'p',
  sub: 'p',
  label: 'span',
  eyebrow: 'span',
  mono: 'span',
};

/**
 * Text in one of hanji's nine roles (plus `hero`). Character comes from how the sans is set —
 * weight and tight tracking at the top, plain at reading size — and numbers are always tabular.
 *
 * @example
 * <Text variant="eyebrow" tone="mute">Now playing</Text>
 * <Text variant="title" render={<h1 />}>Recently played</Text>
 */
export function Text(props: TextProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    variant = 'body',
    tone,
    truncate = false,
    render,
    className,
    ...rest
  } = withDefaults(config, 'Text', props);
  return useRender({
    render,
    defaultTagName: TAGS[variant],
    props: {
      ...rest,
      'data-variant': variant,
      'data-tone': tone,
      'data-truncate': flag(truncate),
      className: cls(config, 'Text', 'hj-text', className) as string | undefined,
    },
  });
}
