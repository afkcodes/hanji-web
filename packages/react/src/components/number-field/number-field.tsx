'use client';
import { NumberField as Base } from '@base-ui/react/number-field';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';
import { useDigitRoll } from '../counter/counter.tsx';

export const Group: HanjiPart<typeof Base.Group> = part(
  Base.Group,
  'NumberField.Group',
  'hj-number-field-group',
);
export const ScrubArea: HanjiPart<typeof Base.ScrubArea> = part(
  Base.ScrubArea,
  'NumberField.ScrubArea',
  'hj-number-field-scrub',
);
export const ScrubAreaCursor: HanjiPart<typeof Base.ScrubAreaCursor> = part(
  Base.ScrubAreaCursor,
  'NumberField.ScrubAreaCursor',
  'hj-number-field-scrub-cursor',
);
/** A unit after the value: “min”, “×”, “GB”. */
export const Unit: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'NumberField.Unit',
  'hj-number-field-unit',
);

/** − : press once to step, hold to repeat and accelerate (Base UI). Renders a minus when childless. */
export function Decrement(props: Base.Decrement.Props): React.ReactElement {
  const config = useHanjiConfig();
  const { className, children, ...rest } = withDefaults(config, 'NumberField.Decrement', props);
  return (
    <Base.Decrement
      aria-label={children === undefined ? config.strings.decrement : undefined}
      {...rest}
      className={cls(config, 'NumberField.Decrement', 'hj-number-field-step', className)}
    >
      {children ?? config.icons.minus}
    </Base.Decrement>
  );
}

/** + : press once to step, hold to repeat and accelerate (Base UI). Renders a plus when childless. */
export function Increment(props: Base.Increment.Props): React.ReactElement {
  const config = useHanjiConfig();
  const { className, children, ...rest } = withDefaults(config, 'NumberField.Increment', props);
  return (
    <Base.Increment
      aria-label={children === undefined ? config.strings.increment : undefined}
      {...rest}
      className={cls(config, 'NumberField.Increment', 'hj-number-field-step', className)}
    >
      {children ?? config.icons.plus}
    </Base.Increment>
  );
}

/** The rolling copy of the value drawn over the input while it isn't being typed in. */
function RollingValue({ text, styled }: { text: string; styled: boolean }): React.ReactElement {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [initial] = React.useState(text);
  useDigitRoll(ref, text);
  return (
    <span ref={ref} aria-hidden="true" className={styled ? 'hj-number-field-roll' : undefined}>
      {initial}
    </span>
  );
}

/** Base UI's render-function form for the input. */
type InputRender = Extract<NonNullable<Base.Input.Props['render']>, (...args: never[]) => unknown>;

export interface InputOwnProps {
  /**
   * Roll changed digits when the value steps (− / +, arrows, wheel). Typing shows the plain
   * input. @default true
   */
  roll?: boolean;
}
export interface InputProps extends InputOwnProps, Base.Input.Props {}

/** The value. Steps roll their changed digits; focus and type to edit it directly. */
export function Input(props: InputProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    roll = true,
    className,
    render,
    ...rest
  } = withDefaults(config, 'NumberField.Input', props);
  const styled = !config.unstyled;
  const renderRoll = React.useCallback<InputRender>(
    (p, state) => {
      const typing = (el: EventTarget, on: boolean): void => {
        const wrap = (el as HTMLElement).parentElement;
        if (!wrap) return;
        if (on) wrap.setAttribute('data-typing', '');
        else wrap.removeAttribute('data-typing');
      };
      return (
        <span className={styled ? 'hj-number-field-value' : undefined}>
          <input
            {...(p as React.ComponentProps<'input'>)}
            onInput={(e) => {
              // only user edits fire input events; steps set the value programmatically
              typing(e.currentTarget, true);
              (p as React.ComponentProps<'input'>).onInput?.(e);
            }}
            onKeyDown={(e) => {
              // stepping keys show the roll again
              if (/^(Arrow(Up|Down)|Page(Up|Down)|Home|End)$/.test(e.key))
                typing(e.currentTarget, false);
              (p as React.ComponentProps<'input'>).onKeyDown?.(e);
            }}
            onBlur={(e) => {
              typing(e.currentTarget, false);
              (p as React.ComponentProps<'input'>).onBlur?.(e);
            }}
          />
          <RollingValue text={state.inputValue ?? ''} styled={styled} />
        </span>
      );
    },
    [styled],
  );
  return (
    <Base.Input
      {...rest}
      render={render ?? (roll ? renderRoll : undefined)}
      className={cls(config, 'NumberField.Input', 'hj-number-field-input', className)}
    />
  );
}

export interface RootOwnProps {
  /** md = 44 tall (hanji touch target), sm = 36. */
  size?: 'sm' | 'md';
  /** Unit shown after the value in the default layout. */
  unit?: React.ReactNode;
}
export interface RootProps extends RootOwnProps, Base.Root.Props {}

/**
 * A number you step with − and +, hold to repeat (Base UI accelerates), or type. Childless, it
 * renders Group › Decrement · Input (+ unit) · Increment.
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    size = 'md',
    unit,
    className,
    children,
    ...rest
  } = withDefaults(config, 'NumberField.Root', props);
  return (
    <Base.Root
      {...rest}
      data-size={size}
      data-has-unit={flag(unit !== undefined)}
      className={cls(config, 'NumberField.Root', 'hj-number-field', className)}
    >
      {children ?? (
        <Group>
          <Decrement />
          <Input />
          {unit !== undefined ? <Unit>{unit}</Unit> : null}
          <Increment />
        </Group>
      )}
    </Base.Root>
  );
}
