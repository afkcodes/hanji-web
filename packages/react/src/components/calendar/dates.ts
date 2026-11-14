/** Date arithmetic on local calendar days. Every Date here is local midnight. */

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** Add months, clamping the day so 31 Jan + 1 month = 28/29 Feb, not 2/3 Mar. */
export function addMonths(d: Date, n: number): Date {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), last));
}

export function sameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** -1, 0 or 1 by calendar day. */
export function compareDay(a: Date, b: Date): number {
  const x = startOfDay(a).getTime();
  const y = startOfDay(b).getTime();
  return x < y ? -1 : x > y ? 1 : 0;
}

/** `yyyy-mm-dd`, for keys and form values (no timezone drift). */
export function isoDay(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** The 42 days (6 weeks) shown for `month`, so the grid never changes height. */
export function monthGrid(month: Date, weekStartsOn: Weekday): Date[] {
  const first = startOfMonth(month);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const start = addDays(first, -lead);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/** First day of the week for a locale (Intl weekInfo where supported). */
export function localeWeekStart(locale: string | undefined): Weekday {
  try {
    const loc = new Intl.Locale(
      locale ?? new Intl.DateTimeFormat().resolvedOptions().locale,
    ) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info) return (info.firstDay % 7) as Weekday;
    return loc.region === 'US' || loc.region === 'CA' || loc.region === 'JP' || loc.region === 'KR'
      ? 0
      : 1;
  } catch {
    return 1;
  }
}

/** Order a range so start ≤ end. */
export function normaliseRange(a: Date, b: Date): DateRange {
  return compareDay(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };
}
