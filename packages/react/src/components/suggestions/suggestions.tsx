'use client';
import { Button as BaseButton } from '@base-ui/react/button';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

const SelectContext = React.createContext<((prompt: string) => void) | undefined>(undefined);

/** Props hanji adds to the row. */
export interface RootOwnProps {
  /** Called with the chosen suggestion's prompt. */
  onSelect?: (prompt: string) => void;
  /** Accessible name for the group. @default 'Suggestions' */
  label?: string;
}
export interface RootProps
  extends RootOwnProps, Omit<React.ComponentProps<'div'>, 'className' | 'onSelect'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * A row of prompts the person can send with one tap. Chips cascade in on mount — 24 ms apart,
 * counting stops at ten.
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    onSelect,
    label = 'Suggestions',
    className,
    render,
    children,
    ...rest
  } = withDefaults(config, 'Suggestions.Root', props);
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'group',
      'aria-label': label,
      ...rest,
      className: cls(config, 'Suggestions.Root', 'hj-suggestions', className) as string | undefined,
      children: <SelectContext.Provider value={onSelect}>{children}</SelectContext.Provider>,
    },
  });
}

export interface ItemOwnProps {
  /** What gets sent. Defaults to the chip's text when children is a string. */
  prompt?: string;
  /** A leading glyph. */
  icon?: React.ReactNode;
}
export interface ItemProps extends ItemOwnProps, BaseButton.Props {}

/** One suggestion chip. */
export function Item(props: ItemProps): React.ReactElement {
  const config = useHanjiConfig();
  const onSelect = React.useContext(SelectContext);
  const { prompt, icon, className, children, onClick, ...rest } = withDefaults(
    config,
    'Suggestions.Item',
    props,
  );
  return (
    <BaseButton
      type="button"
      {...rest}
      className={cls(config, 'Suggestions.Item', 'hj-suggestions-item', className)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        const value = prompt ?? (typeof children === 'string' ? children : '');
        if (value) onSelect?.(value);
      }}
    >
      {icon ? (
        <span className={config.unstyled ? undefined : 'hj-suggestions-icon'} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </BaseButton>
  );
}
