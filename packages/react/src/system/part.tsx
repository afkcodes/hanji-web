'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from './config.tsx';
import { cls, withDefaults } from './slot.ts';
import type { ClassName } from './slot.ts';

/** A Base UI part with hanji's class, slot defaults and slot classes applied. */
export type HanjiPart<C extends React.ElementType> = (
  props: React.ComponentProps<C>,
) => React.ReactElement;

/**
 * Wrap a Base UI part that needs no props of its own. Accepts every Base UI prop (render,
 * className as a function of state, style, …) and adds hanji's class for the slot.
 *
 * @example export const Title: HanjiPart<typeof Base.Title> = part(Base.Title, 'Dialog.Title', 'hj-dialog-title');
 */
export function part<C extends React.ElementType>(
  Base: C,
  slot: string,
  base: string,
): HanjiPart<C> {
  function HanjiPartComponent(props: React.ComponentProps<C>): React.ReactElement {
    const config = useHanjiConfig();
    const p = withDefaults(config, slot, props) as React.ComponentProps<C> & {
      className?: ClassName<unknown>;
    };
    const Component = Base as React.ElementType;
    return <Component {...p} className={cls(config, slot, base, p.className)} />;
  }
  HanjiPartComponent.displayName = slot;
  return HanjiPartComponent;
}

/** Props for a hanji-only layout part (no Base UI behaviour), with Base UI's `render` prop. */
export type ElementPartProps<T extends keyof React.JSX.IntrinsicElements> = Omit<
  React.ComponentProps<T>,
  'className'
> & {
  className?: string;
  render?: useRender.RenderProp;
};

/**
 * A hanji-only part that renders a plain element (header, actions row…), composable via
 * `render` like every Base UI part.
 */
export function elementPart<T extends keyof React.JSX.IntrinsicElements>(
  tag: T,
  slot: string,
  base: string,
): (props: ElementPartProps<T>) => React.ReactElement {
  function HanjiElementPart(props: ElementPartProps<T>): React.ReactElement {
    const config = useHanjiConfig();
    const { render, className, ...rest } = withDefaults(config, slot, props);
    return useRender({
      render,
      defaultTagName: tag,
      props: { ...rest, className: cls(config, slot, base, className) as string | undefined },
    });
  }
  HanjiElementPart.displayName = slot;
  return HanjiElementPart;
}
