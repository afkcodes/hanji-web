'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

/** Props hanji adds to `<kbd>`. */
export interface KbdOwnProps {
  /** sm 18 tall (inside fields and menus) · md 22 (in prose). */
  size?: 'sm' | 'md';
  render?: useRender.RenderProp;
}

export interface KbdProps extends KbdOwnProps, Omit<React.ComponentProps<'kbd'>, 'className'> {
  className?: string;
}

/**
 * A key on the keyboard, set in mono on a hairline. Combine keys by placing several side by side.
 *
 * @example
 * <Kbd>⌘</Kbd><Kbd>K</Kbd>
 */
export function Kbd(props: KbdProps): React.ReactElement {
  const config = useHanjiConfig();
  const { size = 'md', render, className, ...rest } = withDefaults(config, 'Kbd', props);
  return useRender({
    render,
    defaultTagName: 'kbd',
    props: {
      ...rest,
      'data-size': size,
      className: cls(config, 'Kbd', 'hj-kbd', className) as string | undefined,
    },
  });
}
