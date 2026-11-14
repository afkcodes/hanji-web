'use client';
import { Popover } from '@base-ui/react/popover';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';
import * as Calendar from '../calendar/calendar.tsx';
import type { CalendarSelection, CommonOwnProps, DateRange } from '../calendar/calendar.tsx';
import { isoDay } from '../calendar/dates.ts';

interface DatePickerContextValue {
  mode: 'single' | 'range';
  value: Date | DateRange | null;
  commit: (v: Date | DateRange | null) => void;
  setOpen: (open: boolean) => void;
  calendar: CommonOwnProps;
  labelId: string;
  valueId: string;
  disabled: boolean;
}
const DatePickerContext = React.createContext<DatePickerContextValue | null>(null);

function useDatePicker(part: string): DatePickerContextValue {
  const ctx = React.useContext(DatePickerContext);
  if (!ctx) throw new Error(`<DatePicker.${part}> must be inside <DatePicker.Root>.`);
  return ctx;
}

/** Every Root prop hanji defines, as one shape (for docs and the agent manifest). */
export interface RootOwnProps extends CommonOwnProps {
  mode?: 'single' | 'range';
  value?: Date | DateRange | null;
  defaultValue?: Date | DateRange | null;
  onValueChange?: (value: Date | DateRange | null) => void;
  /** Controlled popover. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Submit with a form: `yyyy-mm-dd`, or `yyyy-mm-dd/yyyy-mm-dd` for a range. */
  name?: string;
  disabled?: boolean;
}

export type RootProps = CalendarSelection &
  CommonOwnProps & {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    name?: string;
    disabled?: boolean;
    children?: React.ReactNode;
  };

const EMPTY: DateRange = { start: null, end: null };

/**
 * A field-like trigger that opens a Calendar in a popover. Single days close the popover on
 * pick; ranges close when the end is picked.
 *
 * @example
 * <DatePicker.Root mode="range" min={today}>
 *   <DatePicker.Label>Dates</DatePicker.Label>
 *   <DatePicker.Trigger placeholder="Add dates" />
 *   <DatePicker.Content />
 * </DatePicker.Root>
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const p = withDefaults(config, 'DatePicker.Root', props);
  const {
    mode = 'single',
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    name,
    disabled = false,
    children,
    month,
    defaultMonth,
    onMonthChange,
    min,
    max,
    isDateDisabled,
    locale,
    weekStartsOn,
    today,
  } = p;
  const [inner, setInner] = React.useState<Date | DateRange | null>(
    () => defaultValue ?? (mode === 'range' ? EMPTY : null),
  );
  const current = value !== undefined ? value : inner;
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen ?? false);
  const isOpen = open ?? innerOpen;
  const setOpen = React.useCallback(
    (o: boolean): void => {
      if (open === undefined) setInnerOpen(o);
      onOpenChange?.(o);
    },
    [open, onOpenChange],
  );
  const commit = React.useCallback(
    (v: Date | DateRange | null): void => {
      if (value === undefined) setInner(v);
      (onValueChange as ((x: Date | DateRange | null) => void) | undefined)?.(v);
    },
    [value, onValueChange],
  );
  const labelId = React.useId();
  const valueId = React.useId();
  const ctx = React.useMemo<DatePickerContextValue>(
    () => ({
      mode,
      value: current,
      commit,
      setOpen,
      calendar: {
        month,
        defaultMonth,
        onMonthChange,
        min,
        max,
        isDateDisabled,
        locale,
        weekStartsOn,
        today,
      },
      labelId,
      valueId,
      disabled,
    }),
    [
      mode,
      current,
      commit,
      setOpen,
      labelId,
      valueId,
      disabled,
      month,
      defaultMonth,
      onMonthChange,
      min,
      max,
      isDateDisabled,
      locale,
      weekStartsOn,
      today,
    ],
  );
  const formValue =
    current instanceof Date
      ? isoDay(current)
      : current?.start
        ? `${isoDay(current.start)}/${current.end ? isoDay(current.end) : ''}`
        : '';
  return (
    <DatePickerContext.Provider value={ctx}>
      <Popover.Root open={isOpen} onOpenChange={(o) => setOpen(o)}>
        {children}
      </Popover.Root>
      {name ? <input type="hidden" name={name} value={formValue} disabled={disabled} /> : null}
    </DatePickerContext.Provider>
  );
}

export interface LabelProps extends Omit<React.ComponentProps<'span'>, 'id'> {}

/** Names the picker (the trigger is labelled by it and by the chosen date). */
export function Label({ className, ...props }: LabelProps): React.ReactElement {
  const config = useHanjiConfig();
  const c = useDatePicker('Label');
  return (
    <span
      {...props}
      id={c.labelId}
      data-disabled={flag(c.disabled)}
      className={cls(config, 'DatePicker.Label', 'hj-date-picker-label', className) as string}
    />
  );
}

export interface ValueOwnProps {
  /** Shown while nothing is picked. */
  placeholder?: React.ReactNode;
  /** Format the value yourself. Defaults to Intl in the calendar's locale. */
  format?: (value: Date | DateRange) => string;
}
export interface ValueProps
  extends ValueOwnProps, Omit<React.ComponentProps<'span'>, 'children' | 'id'> {}

/** The chosen day or range, written out (“Fri 20 Nov 2026”, “20–24 Nov 2026”). */
export function Value(props: ValueProps): React.ReactElement {
  const config = useHanjiConfig();
  const { placeholder, format, className, ...rest } = withDefaults(
    config,
    'DatePicker.Value',
    props,
  );
  const c = useDatePicker('Value');
  const v = c.value;
  let text: string | null = null;
  if (v instanceof Date) {
    text = format
      ? format(v)
      : new Intl.DateTimeFormat(c.calendar.locale, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(v);
  } else if (v?.start) {
    const f = new Intl.DateTimeFormat(c.calendar.locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    text = format ? format(v) : v.end ? f.formatRange(v.start, v.end) : `${f.format(v.start)} – …`;
  }
  return (
    <span
      {...rest}
      id={c.valueId}
      data-placeholder={flag(text === null)}
      className={cls(config, 'DatePicker.Value', 'hj-date-picker-value', className) as string}
    >
      {text ?? placeholder}
    </span>
  );
}

const CALENDAR_GLYPH = (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M5.5 4.5h13a2.5 2.5 0 0 1 2.5 2.5v12a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 19V7a2.5 2.5 0 0 1 2.5-2.5ZM16 2.5v4M8 2.5v4M3 10h18" />
  </svg>
);

export interface TriggerOwnProps {
  /** Heights 40 / 48 / 56, matching Field.Control. */
  size?: 'sm' | 'md' | 'lg';
  /** Shown while nothing is picked (only when the Trigger has no children). */
  placeholder?: React.ReactNode;
}
export interface TriggerProps extends TriggerOwnProps, Popover.Trigger.Props {}

/** Drawn like a text field. Childless, it renders the Value and a calendar glyph. */
export function Trigger(props: TriggerProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    size = 'md',
    placeholder,
    className,
    children,
    ...rest
  } = withDefaults(config, 'DatePicker.Trigger', props);
  const c = useDatePicker('Trigger');
  const styled = !config.unstyled;
  return (
    <Popover.Trigger
      aria-labelledby={`${c.labelId} ${c.valueId}`}
      disabled={c.disabled}
      {...rest}
      data-size={size}
      className={cls(config, 'DatePicker.Trigger', 'hj-date-picker-trigger', className)}
    >
      {children ?? (
        <>
          <Value placeholder={placeholder} />
          <span className={styled ? 'hj-date-picker-icon' : undefined}>{CALENDAR_GLYPH}</span>
        </>
      )}
    </Popover.Trigger>
  );
}

export interface ContentOwnProps {
  side?: Popover.Positioner.Props['side'];
  /** @default 'start' */
  align?: Popover.Positioner.Props['align'];
  container?: Popover.Portal.Props['container'];
  /** Close when a day (or the end of a range) is picked. @default true */
  closeOnSelect?: boolean;
}
export interface ContentProps extends ContentOwnProps, Popover.Popup.Props {}

/** The popover with the Calendar. Children render under the calendar (presets, a Clear button). */
export function Content(props: ContentProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    side,
    align = 'start',
    container,
    closeOnSelect = true,
    className,
    children,
    ...rest
  } = withDefaults(config, 'DatePicker.Content', props);
  const c = useDatePicker('Content');
  const onPick = (v: Date | DateRange | null): void => {
    c.commit(v);
    const complete =
      c.mode === 'single' ? v instanceof Date : !!(v && !(v instanceof Date) && v.end);
    if (closeOnSelect && complete) c.setOpen(false);
  };
  const selection =
    c.mode === 'range'
      ? {
          mode: 'range' as const,
          value: (c.value as DateRange | null) ?? EMPTY,
          onValueChange: onPick,
        }
      : { mode: 'single' as const, value: c.value as Date | null, onValueChange: onPick };
  return (
    <Popover.Portal container={container}>
      <ThemeScope>
        <Popover.Positioner
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={8}
          className={config.unstyled ? undefined : 'hj-date-picker-positioner'}
        >
          <Popover.Popup
            {...rest}
            className={cls(config, 'DatePicker.Content', 'hj-date-picker-popup', className)}
          >
            <Calendar.Root {...c.calendar} {...selection} />
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </ThemeScope>
    </Popover.Portal>
  );
}

/** A row under the calendar for presets or a Clear button. */
export function Footer({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement {
  const config = useHanjiConfig();
  return (
    <div
      {...props}
      className={cls(config, 'DatePicker.Footer', 'hj-date-picker-footer', className) as string}
    />
  );
}

/** Imperative access for footers: set or clear the value, close the popover. */
export function useDatePickerActions(): {
  set: (v: Date | DateRange | null) => void;
  close: () => void;
} {
  const c = useDatePicker('Footer');
  return { set: c.commit, close: () => c.setOpen(false) };
}
