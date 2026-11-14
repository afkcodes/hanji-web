'use client';
import { Button as BaseButton } from '@base-ui/react/button';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

/** Props hanji adds to Base UI's Button. */
export interface ButtonOwnProps {
  /**
   * primary = the one action that matters (accent) · ink = primary in ink, for accents that sit
   * near danger · secondary = fg at 8% · quiet = no fill · danger = tint + verb, never a solid red.
   */
  variant?: 'primary' | 'ink' | 'secondary' | 'quiet' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Busy: keeps its width, shows a spinner, stays focusable, ignores presses. */
  loading?: boolean;
  /** Square, for a lone icon. Give it an `aria-label`. */
  iconOnly?: boolean;
  /** Stretch to the container's width. */
  block?: boolean;
}

export interface ButtonProps extends ButtonOwnProps, BaseButton.Props {}

/**
 * The verb on a screen. One primary per view; everything else steps down a weight.
 *
 * @example
 * <Button onClick={save}>Save changes</Button>
 * <Button variant="danger">Delete playlist</Button>
 * <Button render={<a href="/new" />} nativeButton={false}>New playlist</Button>
 */
export function Button(props: ButtonProps): React.JSX.Element {
  const config = useHanjiConfig();
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    iconOnly = false,
    block = false,
    disabled,
    focusableWhenDisabled,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Button', props);
  const styled = !config.unstyled;
  return (
    <BaseButton
      {...rest}
      disabled={disabled || loading}
      focusableWhenDisabled={loading || focusableWhenDisabled}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      data-loading={flag(loading)}
      data-icon-only={flag(iconOnly)}
      data-block={flag(block)}
      className={cls(config, 'Button', 'hj-button', className)}
    >
      <span className={styled ? 'hj-button-label' : undefined}>{children}</span>
      {loading ? (
        <span className={styled ? 'hj-button-spinner' : undefined} aria-hidden="true" />
      ) : null}
    </BaseButton>
  );
}
