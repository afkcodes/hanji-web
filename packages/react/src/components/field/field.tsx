'use client';
import { Field as Base } from '@base-ui/react/field';
import { Input as BaseInput } from '@base-ui/react/input';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

export const Root: HanjiPart<typeof Base.Root> = part(Base.Root, 'Field.Root', 'hj-field');
export const Description: HanjiPart<typeof Base.Description> = part(
  Base.Description,
  'Field.Description',
  'hj-field-description',
);
export const Validity: typeof Base.Validity = Base.Validity;
export const Item: HanjiPart<typeof Base.Item> = part(Base.Item, 'Field.Item', 'hj-field-item');

/** The input box when it holds adornments: icons, a clear or reveal button, a unit. */
export const Shell: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Field.Shell',
  'hj-field-shell',
);
/** A leading or trailing slot inside Shell (icon, button, unit, ⌘K hint). */
export const Adornment: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'Field.Adornment',
  'hj-field-adornment',
);

export interface LabelOwnProps {
  /** Mark the field optional (prefer this to asterisks on required ones). */
  optional?: boolean;
}
export interface LabelProps extends LabelOwnProps, Base.Label.Props {}

export function Label(props: LabelProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    optional = false,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Field.Label', props);
  return (
    <Base.Label {...rest} className={cls(config, 'Field.Label', 'hj-field-label', className)}>
      {children}
      {optional ? (
        <span className={config.unstyled ? undefined : 'hj-field-optional'}>
          {config.strings.optional}
        </span>
      ) : null}
    </Base.Label>
  );
}

export interface ControlOwnProps {
  /** Heights 40 / 48 / 56. Ignored inside a Shell (the Shell sets the height). */
  size?: 'sm' | 'md' | 'lg';
}
export interface ControlProps extends ControlOwnProps, Omit<Base.Control.Props, 'size'> {}

/** The input. On its own it draws the box; inside a Shell it draws only the text. */
export function Control(props: ControlProps): React.ReactElement {
  const config = useHanjiConfig();
  const { size = 'md', className, ...rest } = withDefaults(config, 'Field.Control', props);
  return (
    <Base.Control
      {...rest}
      data-size={size}
      className={cls(config, 'Field.Control', 'hj-field-control', className)}
    />
  );
}

export interface ErrorOwnProps {
  /** Lead with the alert glyph, so the error is never colour alone. @default true */
  icon?: boolean;
}
export interface ErrorProps extends ErrorOwnProps, Base.Error.Props {}

/** Says what went wrong and what to do next. Shown by Base UI when validity matches. */
export function Error(props: ErrorProps): React.ReactElement {
  const config = useHanjiConfig();
  const { icon = true, className, children, ...rest } = withDefaults(config, 'Field.Error', props);
  return (
    <Base.Error
      {...rest}
      data-icon={flag(icon)}
      className={cls(config, 'Field.Error', 'hj-field-error', className)}
    >
      {children}
    </Base.Error>
  );
}

export interface InputOwnProps {
  size?: 'sm' | 'md' | 'lg';
}
export interface InputProps extends InputOwnProps, Omit<BaseInput.Props, 'size'> {}

/** A standalone input outside a Field (search bars, inline edits). Inside a Field use Field.Control. */
export function Input(props: InputProps): React.ReactElement {
  const config = useHanjiConfig();
  const { size = 'md', className, ...rest } = withDefaults(config, 'Input', props);
  return (
    <BaseInput
      {...rest}
      data-size={size}
      className={cls(config, 'Input', 'hj-field-control', className)}
    />
  );
}
