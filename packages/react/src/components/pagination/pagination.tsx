'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';

/** A page number, or a gap in the sequence. */
export type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

/**
 * The visible sequence: boundary pages at each end, siblings around the current page, and an
 * ellipsis where pages are skipped. The total length is constant, so the row never jumps.
 */
const range = (a: number, b: number): number[] =>
  Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);

export function pageRange(page: number, count: number, siblings = 1, boundaries = 1): PageItem[] {
  const total = boundaries * 2 + siblings * 2 + 3;
  if (count <= total) return range(1, count);
  const leftSibling = Math.max(page - siblings, boundaries + 2);
  const rightSibling = Math.min(page + siblings, count - boundaries - 1);
  const showLeft = leftSibling > boundaries + 2;
  const showRight = rightSibling < count - boundaries - 1;
  const start = range(1, boundaries);
  const end = range(count - boundaries + 1, count);
  if (!showLeft) return [...range(1, total - boundaries - 1), 'ellipsis-end', ...end];
  if (!showRight)
    return [...start, 'ellipsis-start', ...range(count - (total - boundaries - 1) + 1, count)];
  return [...start, 'ellipsis-start', ...range(leftSibling, rightSibling), 'ellipsis-end', ...end];
}

interface PaginationContextValue {
  page: number;
  count: number;
}
/** Primitives only; navigation happens through one delegated click listener on Root. */
const PageContext = React.createContext<number>(0);
const CountContext = React.createContext<number>(0);
/** The app's getHref, passed through untouched. */
const HrefContext = React.createContext<((page: number) => string) | undefined>(undefined);
const PAGE_ATTR = 'data-hj-page';

function usePagination(part: string): PaginationContextValue {
  const page = React.useContext(PageContext);
  const count = React.useContext(CountContext);
  if (page === 0) throw new Error(`[hanji] Pagination.${part} must be inside Pagination.Root`);
  return { page, count };
}

export interface RootOwnProps {
  /** Total pages. */
  count: number;
  /** Current page, 1-based (controlled). */
  page?: number;
  /** Initial page (uncontrolled). @default 1 */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Pages either side of the current one. @default 1 */
  siblings?: number;
  /** Pages always shown at each end. @default 1 */
  boundaries?: number;
  /** full = numbered pages · compact = “3 of 12” between previous and next. */
  variant?: 'full' | 'compact';
  /** Render pages as links (crawlable, middle-click-able) built from this. */
  getHref?: (page: number) => string;
}
export interface RootProps extends RootOwnProps, Omit<React.ComponentProps<'nav'>, 'className'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * Moves through pages of a long list. With no children it lays itself out: Previous, the pages
 * (or the compact count) and Next. Compose the parts yourself for anything else.
 */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    count,
    page,
    defaultPage = 1,
    onPageChange,
    siblings = 1,
    boundaries = 1,
    variant = 'full',
    getHref,
    render,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Pagination.Root', props);
  const [inner, setInner] = React.useState(defaultPage);
  const current = Math.min(Math.max(1, page ?? inner), Math.max(1, count));
  // One listener for every control: each says which page it goes to with an attribute.
  const go = (e: React.MouseEvent<HTMLElement>): void => {
    rest.onClick?.(e as React.MouseEvent<HTMLElement>);
    const control = (e.target as Element).closest(`[${PAGE_ATTR}]`);
    if (!control || !e.currentTarget.contains(control)) return;
    if (control.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      return;
    }
    if (e.defaultPrevented) return;
    const next = Math.min(Math.max(1, Number(control.getAttribute(PAGE_ATTR))), count);
    if (next === current) return;
    if (page === undefined) setInner(next);
    onPageChange?.(next); // links still navigate; state stays in step either way
  };
  const body = children ?? (
    <>
      <Previous />
      {variant === 'compact' ? <Summary /> : <Pages siblings={siblings} boundaries={boundaries} />}
      <Next />
    </>
  );
  const element = useRender({
    render,
    defaultTagName: 'nav',
    props: {
      'aria-label': config.strings.pagination,
      ...rest,
      onClick: go,
      'data-variant': variant,
      className: cls(config, 'Pagination.Root', 'hj-pagination-root', className) as
        | string
        | undefined,
      children: body,
    },
  });
  return (
    <PageContext.Provider value={current}>
      <CountContext.Provider value={count}>
        <HrefContext.Provider value={getHref}>{element}</HrefContext.Provider>
      </CountContext.Provider>
    </PageContext.Provider>
  );
}

/** Props shared by Previous, Next and Page. */
export type ControlProps = Omit<React.ComponentProps<'button'>, 'className'> & {
  className?: string;
  render?: useRender.RenderProp;
};

function useControl(
  slot: string,
  base: string,
  target: number,
  disabled: boolean,
  props: ControlProps,
  extra: Record<string, unknown>,
): React.ReactElement {
  const config = useHanjiConfig();
  usePagination(slot.split('.')[1] ?? slot);
  const getHref = React.useContext(HrefContext);
  const { render, className, ...rest } = withDefaults(config, slot, props);
  const asLink = getHref !== undefined && !disabled;
  return useRender({
    render,
    defaultTagName: asLink ? 'a' : 'button',
    props: {
      type: asLink || render ? undefined : 'button',
      href: asLink ? getHref(target) : undefined,
      ...rest,
      ...extra,
      [PAGE_ATTR]: target,
      // aria-disabled, not disabled: focus stays put at the ends of the range
      'aria-disabled': disabled ? true : undefined,
      'data-disabled': flag(disabled),
      className: cls(config, slot, base, className) as string | undefined,
    },
  });
}

export interface PageOwnProps {
  /** The page this button goes to. */
  value: number;
}
export interface PageProps extends PageOwnProps, Omit<ControlProps, 'value'> {}

/** One numbered page. The current page is accent on accent-soft with aria-current="page". */
export function Page(props: PageProps): React.ReactElement {
  const { value, children, ...rest } = props;
  const ctx = usePagination('Page');
  const current = ctx.page === value;
  return useControl('Pagination.Page', 'hj-pagination-page', value, false, rest, {
    'aria-current': current ? 'page' : undefined,
    'aria-label': `Page ${value}`,
    'data-current': flag(current),
    children: children ?? value,
  });
}

export interface PagesOwnProps {
  siblings?: number;
  boundaries?: number;
}

/** The numbered pages with ellipses, from `pageRange`. */
export function Pages({ siblings = 1, boundaries = 1 }: PagesOwnProps): React.ReactElement {
  const config = useHanjiConfig();
  const ctx = usePagination('Pages');
  const items = pageRange(ctx.page, ctx.count, siblings, boundaries);
  return (
    <ol className={config.unstyled ? undefined : 'hj-pagination-pages'}>
      {items.map((it) => (
        <li key={it}>
          {typeof it === 'number' ? (
            <Page value={it} />
          ) : (
            <span
              className={config.unstyled ? undefined : 'hj-pagination-ellipsis'}
              aria-hidden="true"
            >
              …
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Goes back one page. Disabled on the first. */
export function Previous(props: ControlProps): React.ReactElement {
  const config = useHanjiConfig();
  const ctx = usePagination('Previous');
  const { children, ...rest } = props;
  return useControl(
    'Pagination.Previous',
    'hj-pagination-step',
    ctx.page - 1,
    ctx.page <= 1,
    rest,
    {
      'aria-label': children ? undefined : config.strings.previous,
      'data-direction': 'previous',
      children: children ?? config.icons.chevronLeft,
    },
  );
}

/** Goes forward one page. Disabled on the last. */
export function Next(props: ControlProps): React.ReactElement {
  const config = useHanjiConfig();
  const ctx = usePagination('Next');
  const { children, ...rest } = props;
  return useControl(
    'Pagination.Next',
    'hj-pagination-step',
    ctx.page + 1,
    ctx.page >= ctx.count,
    rest,
    {
      'aria-label': children ? undefined : config.strings.next,
      'data-direction': 'next',
      children: children ?? config.icons.chevronRight,
    },
  );
}

export interface SummaryOwnProps {
  /** @default strings.countOf — “3 of 12” */
  format?: (page: number, count: number) => React.ReactNode;
}
export interface SummaryProps
  extends SummaryOwnProps, Omit<React.ComponentProps<'span'>, 'className'> {
  className?: string;
}

/** “3 of 12”, in tabular figures; announced politely when it changes. */
export function Summary(props: SummaryProps): React.ReactElement {
  const config = useHanjiConfig();
  const ctx = usePagination('Summary');
  const {
    format = config.strings.countOf,
    className,
    ...rest
  } = withDefaults(config, 'Pagination.Summary', props);
  return (
    <span
      aria-live="polite"
      {...rest}
      className={
        cls(config, 'Pagination.Summary', 'hj-pagination-summary', className) as string | undefined
      }
    >
      {format(ctx.page, ctx.count)}
    </span>
  );
}
