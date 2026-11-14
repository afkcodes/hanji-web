'use client';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { Toolbar as Base } from '@base-ui/react/toolbar';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

export const Group: HanjiPart<typeof Base.Group> = part(
  Base.Group,
  'Toolbar.Group',
  'hj-toolbar-group',
);
export const Separator: HanjiPart<typeof Base.Separator> = part(
  Base.Separator,
  'Toolbar.Separator',
  'hj-toolbar-separator',
);
export const Link: HanjiPart<typeof Base.Link> = part(Base.Link, 'Toolbar.Link', 'hj-toolbar-link');
export const Input: HanjiPart<typeof Base.Input> = part(
  Base.Input,
  'Toolbar.Input',
  'hj-toolbar-input',
);

export interface RootOwnProps {
  /** surface = a hairlined surface-2 tray (floating formatting bar) · plain = items only, on the page. */
  variant?: 'surface' | 'plain';
}
export interface RootProps extends RootOwnProps, Base.Root.Props {}

/** A row (or column) of controls that arrow keys move between as one tab stop. */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const { variant = 'surface', className, ...rest } = withDefaults(config, 'Toolbar.Root', props);
  return (
    <Base.Root
      {...rest}
      data-variant={variant}
      className={cls(config, 'Toolbar.Root', 'hj-toolbar-root', className)}
    />
  );
}

export interface ButtonOwnProps {
  /** Square button for a lone icon. Give it an aria-label. */
  iconOnly?: boolean;
}
export interface ButtonProps extends ButtonOwnProps, Base.Button.Props {}

/** A quiet 36px toolbar button. Compose with Menu.Trigger, Select.Trigger… through render. */
export function Button(props: ButtonProps): React.ReactElement {
  const config = useHanjiConfig();
  const { iconOnly = false, className, ...rest } = withDefaults(config, 'Toolbar.Button', props);
  return (
    <Base.Button
      {...rest}
      data-icon-only={flag(iconOnly)}
      className={cls(config, 'Toolbar.Button', 'hj-toolbar-button', className)}
    />
  );
}

export interface ToggleOwnProps {
  iconOnly?: boolean;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: BaseToggle.Props['onPressedChange'];
  /** Identifies the toggle inside a ToggleGroup. */
  value?: string;
}
export interface ToggleProps extends ToggleOwnProps, Omit<Base.Button.Props, 'value'> {}

/**
 * A toolbar button that stays pressed (bold, align left…). It is a Base UI Toggle rendered
 * through Toolbar.Button, so it keeps the toolbar's roving focus. Inside a ToggleGroup it
 * becomes one-of-many.
 */
export function Toggle(props: ToggleProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    iconOnly = false,
    pressed,
    defaultPressed,
    onPressedChange,
    value,
    className,
    ...rest
  } = withDefaults(config, 'Toolbar.Toggle', props);
  return (
    <Base.Button
      {...rest}
      render={
        <BaseToggle
          pressed={pressed}
          defaultPressed={defaultPressed}
          onPressedChange={onPressedChange}
          value={value}
        />
      }
      data-icon-only={flag(iconOnly)}
      className={cls(config, 'Toolbar.Toggle', 'hj-toolbar-button', className)}
    />
  );
}
