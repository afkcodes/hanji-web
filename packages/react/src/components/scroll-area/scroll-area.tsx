'use client';
import { ScrollArea as Base } from '@base-ui/react/scroll-area';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

export const Root: HanjiPart<typeof Base.Root> = part(
  Base.Root,
  'ScrollArea.Root',
  'hj-scroll-area',
);
export const Content: HanjiPart<typeof Base.Content> = part(
  Base.Content,
  'ScrollArea.Content',
  'hj-scroll-area-content',
);
export const Thumb: HanjiPart<typeof Base.Thumb> = part(
  Base.Thumb,
  'ScrollArea.Thumb',
  'hj-scroll-area-thumb',
);
export const Corner: HanjiPart<typeof Base.Corner> = part(
  Base.Corner,
  'ScrollArea.Corner',
  'hj-scroll-area-corner',
);

export interface ViewportOwnProps {
  /** Fade the edges where content continues (uses Base UI's overflow distances). @default true */
  fade?: boolean;
}
export interface ViewportProps extends ViewportOwnProps, Base.Viewport.Props {}

/** The scrolling element. Focusable when it overflows, so the keyboard can scroll it. */
export function Viewport(props: ViewportProps): React.ReactElement {
  const config = useHanjiConfig();
  const { fade = true, className, ...rest } = withDefaults(config, 'ScrollArea.Viewport', props);
  return (
    <Base.Viewport
      {...rest}
      data-fade={flag(fade)}
      className={cls(config, 'ScrollArea.Viewport', 'hj-scroll-area-viewport', className)}
    />
  );
}

/** The thin overlay track. Renders its Thumb when given no children. */
export function Scrollbar(props: Base.Scrollbar.Props): React.ReactElement {
  const config = useHanjiConfig();
  const { className, children, ...rest } = withDefaults(config, 'ScrollArea.Scrollbar', props);
  return (
    <Base.Scrollbar
      {...rest}
      className={cls(config, 'ScrollArea.Scrollbar', 'hj-scroll-area-scrollbar', className)}
    >
      {children ?? <Thumb />}
    </Base.Scrollbar>
  );
}

export interface BoxOwnProps {
  /** Which scrollbars to draw. @default 'vertical' */
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** Fade the edges where content continues. @default true */
  fade?: boolean;
}
export interface BoxProps extends BoxOwnProps, Base.Root.Props {}

/** Shorthand: Root + Viewport + Content + scrollbar(s). Size it like any box. */
export function Box({
  orientation = 'vertical',
  fade,
  children,
  ...root
}: BoxProps): React.ReactElement {
  return (
    <Root {...root}>
      <Viewport fade={fade}>
        <Content>{children}</Content>
      </Viewport>
      {orientation !== 'horizontal' ? <Scrollbar orientation="vertical" /> : null}
      {orientation !== 'vertical' ? <Scrollbar orientation="horizontal" /> : null}
      {orientation === 'both' ? <Corner /> : null}
    </Root>
  );
}
