'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';
import {
  addDays,
  addMonths,
  compareDay,
  isoDay,
  localeWeekStart,
  monthGrid,
  normaliseRange,
  sameDay,
  sameMonth,
  startOfDay,
  startOfMonth,
} from './dates.ts';
import type { DateRange, Weekday } from './dates.ts';

export type { DateRange, Weekday } from './dates.ts';

/** Props shared by both selection modes. */
export interface CommonOwnProps {
  /** The month shown (controlled). Any day in the month. */
  month?: Date;
  /** The month shown first. Defaults to the selection, else today. */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Earliest selectable day. */
  min?: Date;
  /** Latest selectable day. */
  max?: Date;
  /** Disable individual days (holidays, sold-out dates). */
  isDateDisabled?: (date: Date) => boolean;
  /** BCP 47 locale for names and the first day of the week. Defaults to the browser's. */
  locale?: string;
  /** 0 = Sunday … 6 = Saturday. Defaults to the locale's. */
  weekStartsOn?: Weekday;
  /** Override “today” (tests, other time zones). */
  today?: Date;
}

interface SingleSelection {
  /** single = one day (default) · range = a start and an end. */
  mode?: 'single';
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
}
interface RangeSelection {
  mode: 'range';
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange) => void;
}
/** Single or range selection: the value's shape follows `mode`. */
export type CalendarSelection = SingleSelection | RangeSelection;

/** Every Root prop hanji defines, as one shape (for docs and the agent manifest). */
export interface RootOwnProps extends CommonOwnProps {
  mode?: 'single' | 'range';
  value?: Date | DateRange | null;
  defaultValue?: Date | DateRange | null;
  onValueChange?: (value: Date | DateRange | null) => void;
}

export type RootProps = CalendarSelection &
  CommonOwnProps &
  Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange' | 'children'> & {
    children?: React.ReactNode;
    render?: useRender.RenderProp;
  };

/** What `useCalendar()` returns inside a `<Calendar.Root>`. */
export interface CalendarContextValue {
  mode: 'single' | 'range';
  selected: Date | null;
  range: DateRange;
  month: Date;
  direction: 'next' | 'prev' | undefined;
  focused: Date;
  hover: Date | null;
  today: Date;
  locale: string | undefined;
  weekStartsOn: Weekday;
  titleId: string;
  canPrev: boolean;
  canNext: boolean;
  isDisabled: (d: Date) => boolean;
  select: (d: Date) => void;
  goMonth: (m: Date) => void;
  setFocused: (d: Date) => void;
  setHover: (d: Date | null) => void;
}
const CalendarContext = React.createContext<CalendarContextValue | null>(null);

/** The calendar's state, for building your own parts inside `<Calendar.Root>`. */
export function useCalendar(): CalendarContextValue {
  const ctx = React.useContext(CalendarContext);
  if (!ctx) throw new Error('Calendar parts must be inside <Calendar.Root>.');
  return ctx;
}

const EMPTY_RANGE: DateRange = { start: null, end: null };

/**
 * A month grid for picking a day or a range. No dependencies: dates are local days, names come
 * from Intl. Childless, it renders a Header and a Grid.
 *
 * @example <Calendar.Root mode="range" min={today} onValueChange={setStay} />
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const p = withDefaults(config, 'Calendar.Root', props);
  const {
    mode = 'single',
    value,
    defaultValue,
    onValueChange,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    min,
    max,
    isDateDisabled,
    locale,
    weekStartsOn,
    today: todayProp,
    className,
    render,
    children,
    ...rest
  } = p;

  const todayKey = todayProp ? isoDay(todayProp) : isoDay(new Date());
  // oxlint-disable-next-line react/exhaustive-deps -- keyed by the calendar day, not the instant
  const today = React.useMemo(() => startOfDay(todayProp ?? new Date()), [todayKey]);

  const [inner, setInner] = React.useState<Date | DateRange | null>(
    () => defaultValue ?? (mode === 'range' ? EMPTY_RANGE : null),
  );
  const current = value !== undefined ? value : inner;
  const selected = mode === 'single' && current instanceof Date ? current : null;
  const range = mode === 'range' && current && !(current instanceof Date) ? current : EMPTY_RANGE;

  const anchor = selected ?? range.start ?? today;
  const [innerMonth, setInnerMonth] = React.useState(() => startOfMonth(defaultMonth ?? anchor));
  const month = monthProp ? startOfMonth(monthProp) : innerMonth;
  const [direction, setDirection] = React.useState<'next' | 'prev' | undefined>(undefined);
  const [focused, setFocused] = React.useState<Date>(() =>
    sameMonth(anchor, month) ? anchor : month,
  );
  const [hover, setHover] = React.useState<Date | null>(null);
  const titleId = React.useId();
  const wsOn = weekStartsOn ?? localeWeekStart(locale);

  const isDisabled = React.useCallback(
    (d: Date): boolean =>
      (min !== undefined && compareDay(d, min) < 0) ||
      (max !== undefined && compareDay(d, max) > 0) ||
      (isDateDisabled?.(d) ?? false),
    [min, max, isDateDisabled],
  );

  const goMonth = React.useCallback(
    (m: Date): void => {
      const next = startOfMonth(m);
      if (sameMonth(next, month)) return;
      setDirection(compareDay(next, month) > 0 ? 'next' : 'prev');
      if (!monthProp) setInnerMonth(next);
      onMonthChange?.(next);
    },
    [month, monthProp, onMonthChange],
  );

  const commit = React.useCallback(
    (v: Date | DateRange | null): void => {
      if (value === undefined) setInner(v);
      (onValueChange as ((x: Date | DateRange | null) => void) | undefined)?.(v);
    },
    [value, onValueChange],
  );

  const select = React.useCallback(
    (d: Date): void => {
      if (isDisabled(d)) return;
      setFocused(d);
      if (!sameMonth(d, month)) goMonth(d);
      if (mode === 'single') {
        commit(d);
        return;
      }
      if (!range.start || range.end) commit({ start: d, end: null });
      else commit(normaliseRange(range.start, d));
      setHover(null);
    },
    [isDisabled, month, goMonth, mode, commit, range.start, range.end],
  );

  const canPrev = min === undefined || compareDay(addDays(month, -1), min) >= 0;
  const canNext = max === undefined || compareDay(addMonths(month, 1), max) <= 0;

  const ctx = React.useMemo<CalendarContextValue>(
    () => ({
      mode,
      selected,
      range,
      month,
      direction,
      focused,
      hover,
      today,
      locale,
      weekStartsOn: wsOn,
      titleId,
      canPrev,
      canNext,
      isDisabled,
      select,
      goMonth,
      setFocused,
      setHover,
    }),
    [
      mode,
      selected,
      range,
      month,
      direction,
      focused,
      hover,
      today,
      locale,
      wsOn,
      titleId,
      canPrev,
      canNext,
      isDisabled,
      select,
      goMonth,
    ],
  );

  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'group',
      'aria-labelledby': titleId,
      ...rest,
      'data-mode': mode,
      className: cls(config, 'Calendar.Root', 'hj-calendar', className) as string | undefined,
      children: children ?? (
        <>
          <Header />
          <Grid />
        </>
      ),
    },
  });
  return <CalendarContext.Provider value={ctx}>{element}</CalendarContext.Provider>;
}

export interface HeaderProps extends Omit<React.ComponentProps<'div'>, 'children'> {}

/** The month name with previous / next buttons. */
export function Header(props: HeaderProps): React.ReactElement {
  const config = useHanjiConfig();
  const { className, ...rest } = withDefaults(config, 'Calendar.Header', props);
  const c = useCalendar();
  const styled = !config.unstyled;
  const title = new Intl.DateTimeFormat(c.locale, { month: 'long', year: 'numeric' }).format(
    c.month,
  );
  return (
    <div
      {...rest}
      className={cls(config, 'Calendar.Header', 'hj-calendar-header', className) as string}
    >
      <button
        type="button"
        className={styled ? 'hj-calendar-nav' : undefined}
        aria-label={config.strings.previous}
        disabled={!c.canPrev}
        onClick={() => c.goMonth(addMonths(c.month, -1))}
      >
        {config.icons.chevronLeft}
      </button>
      <h2 id={c.titleId} className={styled ? 'hj-calendar-title' : undefined} aria-live="polite">
        {title}
      </h2>
      <button
        type="button"
        className={styled ? 'hj-calendar-nav' : undefined}
        aria-label={config.strings.next}
        disabled={!c.canNext}
        onClick={() => c.goMonth(addMonths(c.month, 1))}
      >
        {config.icons.chevronRight}
      </button>
    </div>
  );
}

export interface GridProps extends Omit<React.ComponentProps<'table'>, 'children'> {}

/** Six weeks of days, always — the grid never changes height between months. */
export function Grid(props: GridProps): React.ReactElement {
  const config = useHanjiConfig();
  const { className, onKeyDown, ...rest } = withDefaults(config, 'Calendar.Grid', props);
  const c = useCalendar();
  const ref = React.useRef<HTMLTableElement>(null);
  const keyboard = React.useRef(false);
  const styled = !config.unstyled;

  const days = monthGrid(c.month, c.weekStartsOn);
  const weeks = Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7));
  const short = new Intl.DateTimeFormat(c.locale, { weekday: 'short' });
  const long = new Intl.DateTimeFormat(c.locale, { weekday: 'long' });
  const full = new Intl.DateTimeFormat(c.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const head = days.slice(0, 7);
  // The focus target stays inside the visible month.
  const focus = sameMonth(c.focused, c.month) ? c.focused : c.month;

  React.useEffect(() => {
    if (!keyboard.current) return;
    keyboard.current = false;
    ref.current?.querySelector<HTMLButtonElement>(`[data-date="${isoDay(focus)}"]`)?.focus();
  });

  const move = (e: React.KeyboardEvent<HTMLTableElement>): void => {
    onKeyDown?.(e);
    let next: Date | null = null;
    const dow = (focus.getDay() - c.weekStartsOn + 7) % 7;
    switch (e.key) {
      case 'ArrowLeft':
        next = addDays(focus, -1);
        break;
      case 'ArrowRight':
        next = addDays(focus, 1);
        break;
      case 'ArrowUp':
        next = addDays(focus, -7);
        break;
      case 'ArrowDown':
        next = addDays(focus, 7);
        break;
      case 'Home':
        next = addDays(focus, -dow);
        break;
      case 'End':
        next = addDays(focus, 6 - dow);
        break;
      case 'PageUp':
        next = addMonths(focus, e.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(focus, e.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }
    e.preventDefault();
    keyboard.current = true;
    c.setFocused(next);
    if (!sameMonth(next, c.month)) c.goMonth(next);
    if (c.mode === 'range' && c.range.start && !c.range.end) c.setHover(next);
  };

  return (
    // The APG date-picker pattern: a table exposed as an interactive grid with roving focus.
    <table
      {...rest}
      ref={ref}
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
      role="grid"
      aria-labelledby={c.titleId}
      data-direction={c.direction}
      key={isoDay(c.month)}
      onKeyDown={move}
      className={cls(config, 'Calendar.Grid', 'hj-calendar-grid', className) as string}
    >
      <thead>
        <tr>
          {head.map((d) => (
            <th
              key={d.getDay()}
              scope="col"
              abbr={long.format(d)}
              className={styled ? 'hj-calendar-weekday' : undefined}
            >
              {short.format(d)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={styled ? 'hj-calendar-weeks' : undefined}>
        {weeks.map((week) => (
          <tr key={isoDay(week[0] as Date)}>
            {week.map((d) => (
              <Day
                key={isoDay(d)}
                date={d}
                label={full.format(d)}
                tabbable={sameDay(d, focus)}
                styled={styled}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Day({
  date,
  label,
  tabbable,
  styled,
}: {
  date: Date;
  label: string;
  tabbable: boolean;
  styled: boolean;
}): React.ReactElement {
  const c = useCalendar();
  const outside = !sameMonth(date, c.month);
  const disabled = c.isDisabled(date);
  const { start, end } = c.range;
  const previewEnd = c.mode === 'range' && start && !end ? c.hover : null;
  const lo =
    start && (end ?? previewEnd) ? normaliseRange(start, (end ?? previewEnd) as Date) : null;
  const isStart = c.mode === 'range' && !!lo?.start && sameDay(date, lo.start);
  const isEnd = c.mode === 'range' && !!lo?.end && sameDay(date, lo.end);
  const inRange =
    !!lo?.start && !!lo.end && compareDay(date, lo.start) >= 0 && compareDay(date, lo.end) <= 0;
  const selected =
    c.mode === 'single' ? sameDay(date, c.selected) : sameDay(date, start) || sameDay(date, end);
  return (
    <td
      aria-selected={selected || undefined}
      className={styled ? 'hj-calendar-cell' : undefined}
      data-in-range={flag(inRange && !!(start && end))}
      data-in-preview={flag(inRange && !end)}
      data-range-start={flag(isStart && !sameDay(lo?.start, lo?.end))}
      data-range-end={flag(isEnd && !sameDay(lo?.start, lo?.end))}
    >
      <button
        type="button"
        tabIndex={tabbable ? 0 : -1}
        aria-label={label}
        aria-current={sameDay(date, c.today) ? 'date' : undefined}
        aria-disabled={disabled || undefined}
        data-date={isoDay(date)}
        data-today={flag(sameDay(date, c.today))}
        data-selected={flag(selected)}
        data-outside={flag(outside)}
        data-disabled={flag(disabled)}
        className={styled ? 'hj-calendar-day' : undefined}
        onClick={() => c.select(date)}
        onPointerEnter={c.mode === 'range' && start && !end ? () => c.setHover(date) : undefined}
        onFocus={() => {
          if (!sameDay(date, c.focused)) c.setFocused(date);
        }}
      >
        {date.getDate()}
      </button>
    </td>
  );
}
