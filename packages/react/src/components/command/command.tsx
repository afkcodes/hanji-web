'use client';
import { Autocomplete as Base } from '@base-ui/react/autocomplete';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, flag } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';
import { useSlot } from '../../system/use-slot.ts';
import { Backdrop as DialogBackdrop } from '../dialog/dialog.tsx';
import { Kbd } from '../kbd/kbd.tsx';
import { Spinner } from '../spinner/spinner.tsx';

/*
 * A command palette on Base UI's inline Autocomplete: the input is the combobox, the list is the
 * listbox, and Base UI owns highlight, arrow keys, Enter and scroll-into-view. hanji adds the
 * filter and ranking: items register their text, the Root scores them, unmatched items unmount,
 * empty groups hide, and the survivors are ordered best-first with CSS `order` plus Base UI's
 * explicit `index` — so what you see, what the arrow keys walk and what Enter picks agree, while
 * the DOM keeps the authored order (nothing moves under React's feet).
 */

// ─── Filtering ──────────────────────────────────────────────────────────────────────────────────

/** Scores how well a command matches the query: 0 hides it, 1 is an exact match. */
export type CommandFilter = (text: string, query: string, keywords: readonly string[]) => number;

const fold = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const WORD = /[\p{L}\p{N}]/u;
const SPLIT = /[^\p{L}\p{N}]+/u;

function matchOne(t: string, q: string, fuzzy: boolean): number {
  if (!t || !q) return 0;
  if (t === q) return 1;
  if (t.startsWith(q)) return 0.9;
  let at = t.indexOf(q);
  const inside = at !== -1;
  while (at !== -1) {
    if (!WORD.test(t.charAt(at - 1))) return 0.8;
    at = t.indexOf(q, at + 1);
  }
  if (q.length > 1) {
    const initials = t
      .split(SPLIT)
      .filter(Boolean)
      .map((w) => w.charAt(0))
      .join('');
    if (initials.startsWith(q)) return 0.7;
  }
  if (inside) return 0.6;
  if (!fuzzy || q.length < 2) return 0;
  // A small fuzzy pass: every character, in order, within a tight span.
  let from = 0;
  let start = -1;
  let end = -1;
  for (const ch of q) {
    const k = t.indexOf(ch, from);
    if (k === -1) return 0;
    if (start === -1) start = k;
    end = k;
    from = k + ch.length;
  }
  const span = end - start + 1;
  if (span > q.length * 2 + 1) return 0;
  return 0.1 + (0.3 * q.length) / span;
}

/**
 * hanji's ranking: exact 1 · prefix .9 · word start .8 · initials (“ct” → Change theme) .7 ·
 * substring .6 · in-order fuzzy .1–.4. Keywords count at 90%. A multi-word query that matches
 * nowhere whole still matches when every word lands somewhere (scored under any whole match).
 * Accents and case are ignored.
 */
export function defaultFilter(
  text: string,
  query: string,
  keywords: readonly string[] = [],
): number {
  const q = fold(query);
  if (!q) return 1;
  const t = fold(text);
  const hay = keywords.map(fold);
  let best = matchOne(t, q, true);
  for (const k of hay) best = Math.max(best, matchOne(k, q, true) * 0.9);
  if (best > 0) return best;
  const words = q.split(/\s+/);
  if (words.length < 2) return 0;
  let sum = 0;
  for (const w of words) {
    let s = matchOne(t, w, false);
    for (const k of hay) s = Math.max(s, matchOne(k, w, false) * 0.9);
    if (s === 0) return 0;
    sum += s;
  }
  return (0.5 * sum) / words.length;
}

// ─── State ──────────────────────────────────────────────────────────────────────────────────────

interface Entry {
  text: string;
  keywords: readonly string[];
  group: string | null;
  force: boolean;
  seq: number;
}

interface View {
  /** Rank of each visible item while a query is ranking (absent otherwise). */
  order: ReadonlyMap<string, number>;
  /** Rank of each group's best item. */
  groupOrder: ReadonlyMap<string, number>;
  /** Groups with at least one registered item. */
  known: ReadonlySet<string>;
  /** Groups with at least one visible item. */
  shown: ReadonlySet<string>;
  /** Visible items, not counting `forceMount` ones. */
  count: number;
  /** Visible items, `forceMount` included. */
  total: number;
  /** Visible item values in the order the arrow keys walk them (Base UI's `filteredItems`). */
  values: readonly string[];
}

interface Row {
  id: string;
  text: string;
  key: string;
  group: string | null;
  score: number;
  seq: number;
}

function buildView(
  entries: ReadonlyMap<string, Entry>,
  filter: CommandFilter | null,
  query: string,
): View {
  const known = new Set<string>();
  const shown = new Set<string>();
  const order = new Map<string, number>();
  const groupOrder = new Map<string, number>();
  const rows: Row[] = [];
  let count = 0;
  for (const [id, e] of entries) {
    if (e.group) known.add(e.group);
    const score = filter ? (e.force ? 0 : filter(e.text, query, e.keywords)) : 1;
    if (!e.force && score <= 0) continue;
    if (!e.force) count += 1;
    if (e.group) shown.add(e.group);
    rows.push({ id, text: e.text, key: e.group ?? id, group: e.group, score, seq: e.seq });
  }
  if (filter) {
    // Groups rank by their best item (authored order breaks ties); items rank inside their group.
    const best = new Map<string, { score: number; seq: number }>();
    for (const r of rows) {
      const b = best.get(r.key);
      if (!b) best.set(r.key, { score: r.score, seq: r.seq });
      else {
        b.score = Math.max(b.score, r.score);
        b.seq = Math.min(b.seq, r.seq);
      }
    }
    const none = { score: 0, seq: 0 };
    rows.sort((a, b) => {
      if (a.key !== b.key) {
        const ga = best.get(a.key) ?? none;
        const gb = best.get(b.key) ?? none;
        return gb.score - ga.score || ga.seq - gb.seq;
      }
      return b.score - a.score || a.seq - b.seq;
    });
    rows.forEach((r, i) => {
      order.set(r.id, i);
      if (r.group && !groupOrder.has(r.group)) groupOrder.set(r.group, i);
    });
  }
  return {
    order,
    groupOrder,
    known,
    shown,
    count,
    total: rows.length,
    values: rows.map((r) => r.text),
  };
}

interface CommandContextValue {
  query: string;
  /** A non-empty query with filtering on: items are being scored and ordered. */
  ranking: boolean;
  score: (text: string, keywords: readonly string[]) => number;
  view: View;
  /** The open page: '' at the root. */
  page: string;
  pages: readonly string[];
  /** Whether the open page is declared with <Command.Page>. */
  declared: boolean;
  pageLabel: (id: string) => string;
  pagePlaceholder: (id: string) => string | undefined;
  loading: boolean;
  nav: 'forward' | 'back' | null;
  register: (id: string, entry: Omit<Entry, 'seq'>) => () => void;
  registerPage: (id: string, info: PageInfo) => () => void;
  registerLoading: () => () => void;
  setQuery: (query: string) => void;
  push: (page: string) => void;
  popTo: (depth: number) => void;
  /** A command ran (closes Command.Dialog when it says so). */
  done: () => void;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);
/** Set by a Group for its items. */
const GroupContext = React.createContext<string | null>(null);
/** Set by a Page for its contents; null outside any Page. */
const PageContext = React.createContext<string | null>(null);
/** Set by Command.Dialog: what to do after a command runs. */
const DoneContext = React.createContext<(() => void) | null>(null);

function useCommand(name: string): CommandContextValue {
  const ctx = React.useContext(CommandContext);
  if (!ctx) throw new Error(`hanji: <Command.${name}> must be inside <Command.Root>.`);
  return ctx;
}

/** Content inside a Page shows on that page; content outside any Page shows at the root. */
function useActive(ctx: CommandContextValue): boolean {
  const page = React.useContext(PageContext);
  return page !== null ? page === ctx.page : ctx.page === '' || !ctx.declared;
}

function useControllable<T>(
  value: T | undefined,
  initial: T,
  onChange: ((next: T) => void) | undefined,
): [T, (next: T) => void] {
  const [own, setOwn] = React.useState(initial);
  const controlled = value !== undefined;
  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setOwn(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [controlled ? value : own, set];
}

const NO_STRINGS: readonly string[] = [];
const NO_ENTRIES: ReadonlyMap<string, Entry> = new Map();
interface PageInfo {
  label?: string;
  placeholder?: string;
}
const NO_PAGES: ReadonlyMap<string, PageInfo> = new Map();

type StyleProp<S> =
  | React.CSSProperties
  | ((state: S) => React.CSSProperties | undefined)
  | undefined;

/** Adds the rank as CSS `order`, keeping Base UI's function-style form. */
function useOrder<S>(style: StyleProp<S>, order: number | undefined): StyleProp<S> {
  return React.useMemo(() => {
    if (order === undefined) return style;
    if (typeof style === 'function') return (state: S) => ({ ...style(state), order });
    return { ...style, order };
  }, [style, order]);
}

// ─── Root ───────────────────────────────────────────────────────────────────────────────────────

export interface RootOwnProps {
  /** The search text. Use with `onQueryChange` to control it (e.g. to fetch results). */
  query?: string;
  /** Initial search text when uncontrolled. @default '' */
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /**
   * `true` ranks with `defaultFilter`; a function `(text, query, keywords) => score` ranks your
   * way (0 hides); `false` shows every item as rendered — for async or server-ranked results.
   * @default true
   */
  filter?: boolean | CommandFilter;
  /** The page stack (ids of `Command.Page`s), root first. Use with `onPagesChange`. */
  pages?: readonly string[];
  /** Initial page stack when uncontrolled. @default [] */
  defaultPages?: readonly string[];
  onPagesChange?: (pages: readonly string[]) => void;
  /** Arrow keys wrap from the last command to the first. @default true */
  loop?: boolean;
}
export type RootProps = RootOwnProps & ElementPartProps<'div'>;

/**
 * An inline command palette: a search field over grouped, ranked commands. Holds the query, the
 * page stack and the registry of items; renders a `<div>`.
 */
export function Root(props: RootProps): React.ReactElement {
  const [
    config,
    {
      query: queryProp,
      defaultQuery = '',
      onQueryChange,
      filter = true,
      pages: pagesProp,
      defaultPages = NO_STRINGS,
      onPagesChange,
      loop = true,
      render,
      className,
      children,
      ...rest
    },
  ] = useSlot('Command.Root', props);
  const [query, setQuery] = useControllable(queryProp, defaultQuery, onQueryChange);
  const [pages, setPages] = useControllable(pagesProp, defaultPages, onPagesChange);
  const [entries, setEntries] = React.useState(NO_ENTRIES);
  const [pageInfo, setPageInfo] = React.useState(NO_PAGES);
  const [loadingCount, setLoadingCount] = React.useState(0);
  const [nav, setNav] = React.useState<CommandContextValue['nav']>(null);
  const seqs = React.useRef({ next: 0, ids: new Map<string, number>() });
  const rootRef = React.useRef<HTMLDivElement>(null);
  const refocus = React.useRef(false);
  const done = React.useContext(DoneContext);

  const fn = filter === false ? null : filter === true ? defaultFilter : filter;
  const q = query.trim();
  const ranking = fn !== null && q !== '';
  const page = pages.at(-1) ?? '';

  const view = React.useMemo(
    () => buildView(entries, ranking ? fn : null, q),
    [entries, ranking, fn, q],
  );
  const score = React.useCallback(
    (text: string, keywords: readonly string[]) => (ranking && fn ? fn(text, q, keywords) : 1),
    [ranking, fn, q],
  );

  const register = React.useCallback((id: string, entry: Omit<Entry, 'seq'>) => {
    // Registration order is the authored order; it breaks ties between equal scores.
    const s = seqs.current;
    let seq = s.ids.get(id);
    if (seq === undefined) {
      seq = s.next;
      s.next += 1;
      s.ids.set(id, seq);
    }
    const full: Entry = { ...entry, seq };
    setEntries((m) => new Map(m).set(id, full));
    return () =>
      setEntries((m) => {
        const next = new Map(m);
        next.delete(id);
        return next;
      });
  }, []);
  const registerPage = React.useCallback((id: string, info: PageInfo) => {
    setPageInfo((m) => new Map(m).set(id, info));
    return () =>
      setPageInfo((m) => {
        const next = new Map(m);
        next.delete(id);
        return next;
      });
  }, []);
  const registerLoading = React.useCallback(() => {
    setLoadingCount((n) => n + 1);
    return () => setLoadingCount((n) => n - 1);
  }, []);

  const ctx = React.useMemo<CommandContextValue>(
    () => ({
      query,
      ranking,
      score,
      view,
      page,
      pages,
      declared: pageInfo.has(page),
      pageLabel: (id) => pageInfo.get(id)?.label ?? id,
      pagePlaceholder: (id) => pageInfo.get(id)?.placeholder,
      loading: loadingCount > 0,
      nav,
      register,
      registerPage,
      registerLoading,
      setQuery,
      push: (id) => {
        refocus.current = rootRef.current?.contains(document.activeElement) ?? false;
        setPages([...pages, id]);
        setQuery('');
        setNav('forward');
      },
      popTo: (depth) => {
        if (depth >= pages.length) return;
        refocus.current = rootRef.current?.contains(document.activeElement) ?? false;
        setPages(pages.slice(0, depth));
        setQuery('');
        setNav('back');
      },
      done: () => done?.(),
    }),
    [
      query,
      ranking,
      score,
      view,
      page,
      pages,
      pageInfo,
      loadingCount,
      nav,
      register,
      registerPage,
      registerLoading,
      setQuery,
      setPages,
      done,
    ],
  );

  // A page change remounts Base UI's root under the same outer element: highlight, scroll and
  // registry start fresh on the first command of the new list (Base UI has no public way to
  // move the highlight). Focus follows into the new field.
  const navKey = pages.join('\u0000');
  const lastKey = React.useRef(navKey);
  React.useLayoutEffect(() => {
    if (lastKey.current === navKey) return;
    lastKey.current = navKey;
    if (!refocus.current) return;
    refocus.current = false;
    rootRef.current?.querySelector<HTMLInputElement>('input[role="combobox"]')?.focus({
      preventScroll: true,
    });
  }, [navKey]);

  const element = useRender({
    render,
    ref: rootRef,
    defaultTagName: 'div',
    props: {
      ...rest,
      'data-searching': flag(q !== ''),
      'data-page': page || undefined,
      className: cls(config, 'Command.Root', 'hj-command', className) as string | undefined,
      children: (
        <Base.Root
          key={navKey}
          open
          inline
          autoHighlight="always"
          keepHighlight
          loopFocus={loop}
          filteredItems={view.values}
          value={query}
          onValueChange={(value, details) => {
            // Choosing a command runs it; it never writes the command into the search field.
            if (details.reason === 'item-press') return;
            setQuery(value);
          }}
        >
          {children}
        </Base.Root>
      ),
    },
  });

  return <CommandContext.Provider value={ctx}>{element}</CommandContext.Provider>;
}

// ─── Input ──────────────────────────────────────────────────────────────────────────────────────

export interface InputProps extends Omit<Base.Input.Props, 'value' | 'defaultValue'> {}
type InputKeyEvent = Parameters<NonNullable<Base.Input.Props['onKeyDown']>>[0];

/** Empties the field the way a person would, so Base UI re-highlights the first row and scrolls up. */
function clearLikeTyping(input: HTMLInputElement): void {
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setValue?.call(input, '');
  input.dispatchEvent(
    new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }),
  );
}

/**
 * The search field: glyph, a breadcrumb chip per open page, and the combobox input. Escape
 * clears the text, then leaves the page; Backspace on an empty field leaves the page.
 */
export function Input(props: InputProps): React.ReactElement {
  const [config, { className, onKeyDown, placeholder, ...rest }] = useSlot('Command.Input', props);
  const ctx = useCommand('Input');
  const crumbId = React.useId();
  const { pages } = ctx;

  function handleKeyDown(event: InputKeyEvent): void {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    const empty = event.currentTarget.value === '';
    const plain = !(event.metaKey || event.ctrlKey || event.altKey || event.shiftKey);
    if (event.key === 'Escape' && (!empty || pages.length > 0)) {
      // One step back per press: the text, then the page — then the dialog closes.
      event.preventDefault();
      event.stopPropagation();
      if (!empty) clearLikeTyping(event.currentTarget);
      else ctx.popTo(pages.length - 1);
    } else if (event.key === 'Backspace' && empty && plain && pages.length > 0) {
      event.preventDefault();
      ctx.popTo(pages.length - 1);
    }
  }

  return (
    <div className={config.unstyled ? undefined : 'hj-command-field'}>
      <span className={config.unstyled ? undefined : 'hj-command-field-icon'} aria-hidden>
        {config.icons.search}
      </span>
      {pages.map((id, depth) => {
        const label = ctx.pageLabel(id);
        return (
          <button
            // oxlint-disable-next-line react/no-array-index-key -- a page may repeat in the stack
            key={`${id}:${depth}`}
            type="button"
            tabIndex={-1}
            aria-label={`${config.strings.back} — ${label}`}
            className={config.unstyled ? undefined : 'hj-command-crumb'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => ctx.popTo(depth)}
          >
            {config.icons.chevronLeft}
            <span id={depth === pages.length - 1 ? crumbId : undefined}>{label}</span>
          </button>
        );
      })}
      <Base.Input
        aria-label={config.strings.commandSearch}
        aria-describedby={pages.length > 0 ? crumbId : undefined}
        autoComplete="off"
        spellCheck={false}
        {...rest}
        placeholder={(ctx.page && ctx.pagePlaceholder(ctx.page)) || placeholder}
        onKeyDown={handleKeyDown}
        className={cls(config, 'Command.Input', 'hj-command-input', className)}
      />
    </div>
  );
}

// ─── List, groups, items ────────────────────────────────────────────────────────────────────────

/** The listbox. Scrolls; slides in sideways when a page opens or closes (it remounts then). */
export function List(props: Base.List.Props): React.ReactElement {
  const [config, { className, ...rest }] = useSlot('Command.List', props);
  const { nav } = useCommand('List');
  return (
    <Base.List
      {...rest}
      data-nav={nav ?? undefined}
      className={cls(config, 'Command.List', 'hj-command-list', className)}
    />
  );
}

export const GroupLabel: HanjiPart<typeof Base.GroupLabel> = part(
  Base.GroupLabel,
  'Command.GroupLabel',
  'hj-command-group-label',
);

export interface GroupOwnProps {
  /** Eyebrow heading, rendered as a `GroupLabel` (the group's accessible name). */
  label?: React.ReactNode;
}
export interface GroupProps extends GroupOwnProps, Base.Group.Props {}

/** A labelled run of commands. Hides itself while a query matches none of them. */
export function Group(props: GroupProps): React.ReactElement | null {
  const [config, { label, hidden, style, className, children, ...rest }] = useSlot(
    'Command.Group',
    props,
  );
  const ctx = useCommand('Group');
  const id = React.useId();
  const active = useActive(ctx);
  const ordered = useOrder(style, ctx.view.groupOrder.get(id));
  if (!active) return null;
  const empty = ctx.ranking && ctx.view.known.has(id) && !ctx.view.shown.has(id);
  return (
    <GroupContext.Provider value={id}>
      <Base.Group
        {...rest}
        hidden={empty || hidden}
        style={ordered}
        className={cls(config, 'Command.Group', 'hj-command-group', className)}
      >
        {label != null && label !== false ? <GroupLabel>{label}</GroupLabel> : null}
        {children}
      </Base.Group>
    </GroupContext.Provider>
  );
}

/** Plain text of an item's children, minus its Shortcut and Detail. */
function textOf(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number' || typeof node === 'bigint') return String(node);
  if (Array.isArray(node)) return node.map((n: React.ReactNode) => textOf(n)).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    if (node.type === Shortcut || node.type === Detail) return '';
    return textOf(node.props.children);
  }
  return '';
}

export interface ItemOwnProps {
  /** The text matched by the filter and passed to `onSelect`. Defaults to the item's text. */
  value?: string;
  /** More words that should find this command (synonyms, the old name, a shortcut's name). */
  keywords?: readonly string[];
  /** Runs the command: on click, or Enter while highlighted. Command.Dialog closes after. */
  onSelect?: (value: string) => void;
  /** Open this `Command.Page` instead of closing: the item shows a chevron. */
  page?: string;
  /** Show whatever the query, ranked last in its group — for “Ask hanji about …” rows. */
  forceMount?: boolean;
}
export interface ItemProps
  extends ItemOwnProps, Omit<Base.Item.Props, 'value' | 'index' | 'onSelect'> {}

/** One command row: optional leading Icon, the label, then Detail, Shortcut or a page chevron. */
export function Item(props: ItemProps): React.ReactElement | null {
  const [
    config,
    {
      value,
      keywords,
      onSelect,
      page: target,
      forceMount = false,
      disabled = false,
      onClick,
      style,
      className,
      children,
      ...rest
    },
  ] = useSlot('Command.Item', props);
  const ctx = useCommand('Item');
  const group = React.useContext(GroupContext);
  const id = React.useId();
  const active = useActive(ctx);
  const text = (value ?? textOf(children)).replace(/\s+/g, ' ').trim();
  const kw = keywords ?? NO_STRINGS;
  const kwKey = kw.join('\n');
  const { register } = ctx;

  React.useLayoutEffect(() => {
    if (!active) return undefined;
    return register(id, {
      text,
      keywords: kwKey ? kwKey.split('\n') : NO_STRINGS,
      group,
      force: forceMount,
    });
  }, [register, id, text, kwKey, group, forceMount, active]);

  const order = ctx.view.order.get(id);
  const ordered = useOrder(style, order);
  if (!active) return null;
  if (ctx.ranking && !forceMount && ctx.score(text, kw) <= 0) return null;

  const handleClick: Base.Item.Props['onClick'] = (event) => {
    onClick?.(event);
    if (disabled || event.defaultPrevented) return;
    if (target) ctx.push(target);
    onSelect?.(text);
    if (!target) ctx.done();
  };

  return (
    <Base.Item
      {...rest}
      value={text}
      index={order}
      disabled={disabled}
      aria-posinset={order === undefined ? undefined : order + 1}
      aria-setsize={order === undefined ? undefined : ctx.view.total}
      data-page={target}
      style={ordered}
      onClick={handleClick}
      className={cls(config, 'Command.Item', 'hj-command-item', className)}
    >
      {children}
      {target ? (
        <span className={config.unstyled ? undefined : 'hj-command-chevron'} aria-hidden>
          {config.icons.chevronRight}
        </span>
      ) : null}
    </Base.Item>
  );
}

// ─── Row furniture ──────────────────────────────────────────────────────────────────────────────

const subscribeNever = (): (() => void) => () => {};
const isApple = (): boolean => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
const onServer = (): boolean => false;
/** ⌘ on Apple platforms, Ctrl elsewhere — stable on the server, corrected on hydration. */
function useApple(): boolean {
  return React.useSyncExternalStore(subscribeNever, isApple, onServer);
}

const APPLE_KEYS: Readonly<Record<string, string>> = {
  mod: '⌘',
  cmd: '⌘',
  meta: '⌘',
  ctrl: '⌃',
  alt: '⌥',
  option: '⌥',
  shift: '⇧',
};
const OTHER_KEYS: Readonly<Record<string, string>> = {
  mod: 'Ctrl',
  cmd: 'Ctrl',
  meta: 'Win',
  ctrl: 'Ctrl',
  alt: 'Alt',
  option: 'Alt',
  shift: 'Shift',
};
const NAMED_KEYS: Readonly<Record<string, string>> = {
  enter: '↵',
  return: '↵',
  backspace: '⌫',
  delete: '⌦',
  escape: 'Esc',
  esc: 'Esc',
  tab: '⇥',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  space: 'Space',
};
function keyLabel(key: string, apple: boolean): string {
  const k = key.toLowerCase();
  return (
    (apple ? APPLE_KEYS : OTHER_KEYS)[k] ??
    NAMED_KEYS[k] ??
    (key.length === 1 ? key.toUpperCase() : key)
  );
}

export interface ShortcutOwnProps {
  /**
   * Keys drawn as `Kbd`s, e.g. `['mod', 'K']`. `mod` is ⌘ on Apple and Ctrl elsewhere; shift,
   * alt, ctrl, enter, backspace, esc, tab and arrows get their glyphs. Or pass children.
   */
  keys?: readonly string[];
}
export type ShortcutProps = ShortcutOwnProps & ElementPartProps<'span'>;

/** The keys that run a command without the palette, at the row's end. Not part of the match. */
export function Shortcut(props: ShortcutProps): React.ReactElement {
  const [config, { keys, render, className, children, ...rest }] = useSlot(
    'Command.Shortcut',
    props,
  );
  const apple = useApple();
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      ...rest,
      className: cls(config, 'Command.Shortcut', 'hj-command-shortcut', className) as
        | string
        | undefined,
      children: keys
        ? keys.map((k, i) => (
            // oxlint-disable-next-line react/no-array-index-key -- keys may repeat (G G)
            <Kbd key={`${k}:${i}`} size="sm">
              {keyLabel(k, apple)}
            </Kbd>
          ))
        : children,
    },
  });
}

/** Quiet trailing text — a type, a person, “2h ago”. Tabular numerals; not part of the match. */
export const Detail: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'Command.Detail',
  'hj-command-detail',
);

/** A hairline between groups. Hidden while searching, when groups reorder by relevance. */
export function Separator(props: Base.Separator.Props): React.ReactElement | null {
  const [config, { className, ...rest }] = useSlot('Command.Separator', props);
  const ctx = useCommand('Separator');
  const active = useActive(ctx);
  if (!active || ctx.ranking) return null;
  return (
    <Base.Separator
      {...rest}
      className={cls(config, 'Command.Separator', 'hj-command-separator', className)}
    />
  );
}

// ─── States ─────────────────────────────────────────────────────────────────────────────────────

export interface EmptyOwnProps {
  /** What to say when nothing matches. A function receives the query. Defaults to strings.commandEmpty. */
  children?: React.ReactNode | ((query: string) => React.ReactNode);
}
export type EmptyProps = EmptyOwnProps & Omit<ElementPartProps<'div'>, 'children'>;

/**
 * A polite live region that speaks when nothing matches (and nothing is loading). Stays mounted
 * so screen readers hear the change; place it after the List.
 */
export function Empty(props: EmptyProps): React.ReactElement {
  const [config, { render, className, children, ...rest }] = useSlot('Command.Empty', props);
  const ctx = useCommand('Empty');
  // Items register in their first commit; until then the count is unknown, so say nothing.
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const show = ready && !ctx.loading && ctx.view.count === 0;
  const q = ctx.query.trim();
  const content =
    typeof children === 'function' ? children(q) : (children ?? config.strings.commandEmpty(q));
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'status',
      ...rest,
      'data-empty': flag(show),
      className: cls(config, 'Command.Empty', 'hj-command-empty', className) as string | undefined,
      children: show ? content : null,
    },
  });
}

export interface LoadingOwnProps {
  /** Whether work is in flight. Keep the part mounted and flip this so the change is announced. @default true */
  loading?: boolean;
}
export type LoadingProps = LoadingOwnProps & ElementPartProps<'div'>;

/** “Searching…” with a small ring while results load. Holds back Empty until it finishes. */
export function Loading(props: LoadingProps): React.ReactElement {
  const [config, { loading = true, render, className, children, ...rest }] = useSlot(
    'Command.Loading',
    props,
  );
  const { registerLoading } = useCommand('Loading');
  React.useLayoutEffect(
    () => (loading ? registerLoading() : undefined),
    [loading, registerLoading],
  );
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'status',
      ...rest,
      'data-loading': flag(loading),
      className: cls(config, 'Command.Loading', 'hj-command-loading', className) as
        | string
        | undefined,
      children: loading ? (
        <>
          <Spinner size="sm" aria-hidden />
          <span>{children ?? config.strings.loading}</span>
        </>
      ) : null,
    },
  });
}

// ─── Pages ──────────────────────────────────────────────────────────────────────────────────────

export interface PageOwnProps {
  /** The id an Item opens with `page="…"`. */
  id: string;
  /** Shown in the field's breadcrumb chip. Defaults to the id. */
  label?: string;
  /** The field's placeholder while this page is open (“Pick a theme…”). */
  placeholder?: string;
}
export interface PageProps extends PageOwnProps {
  children?: React.ReactNode;
}

/**
 * A nested list (“Change theme…” → themes). Place Pages directly inside List, as siblings;
 * everything outside a Page belongs to the root.
 */
export function Page({ id, label, placeholder, children }: PageProps): React.ReactElement | null {
  const ctx = useCommand('Page');
  const { registerPage } = ctx;
  React.useLayoutEffect(
    () => registerPage(id, { label, placeholder }),
    [registerPage, id, label, placeholder],
  );
  if (ctx.page !== id) return null;
  return <PageContext.Provider value={id}>{children}</PageContext.Provider>;
}

/** A hairline footer for key hints (“↵ to run · esc to close”) or a status line. */
export const Footer: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Command.Footer',
  'hj-command-footer',
);

// ─── Dialog ─────────────────────────────────────────────────────────────────────────────────────

function matchesHotkey(event: KeyboardEvent, combo: string, apple: boolean): boolean {
  const parts = combo.toLowerCase().split('+');
  const key = parts.at(-1) ?? '';
  const want = { meta: false, ctrl: false, alt: false, shift: false };
  for (const p of parts.slice(0, -1)) {
    if (p === 'mod') want[apple ? 'meta' : 'ctrl'] = true;
    else if (p === 'cmd' || p === 'meta') want.meta = true;
    else if (p === 'ctrl' || p === 'control') want.ctrl = true;
    else if (p === 'alt' || p === 'option') want.alt = true;
    else if (p === 'shift') want.shift = true;
  }
  const pressed =
    event.key.toLowerCase() === key ||
    event.code.toLowerCase() === `key${key}` ||
    event.code.toLowerCase() === `digit${key}`;
  return (
    pressed &&
    event.metaKey === want.meta &&
    event.ctrlKey === want.ctrl &&
    event.altKey === want.alt &&
    event.shiftKey === want.shift
  );
}

export interface DialogOwnProps {
  open?: boolean;
  /** @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Global shortcut that toggles the palette; `false` for none. @default 'mod+k' */
  hotkey?: string | false;
  /** Accessible name of the dialog. Defaults to strings.commandPalette. */
  label?: string;
  /** Close after a command runs (items that open a page never close). @default true */
  closeOnSelect?: boolean;
  /** Where to portal. Defaults to `<body>`. */
  container?: BaseDialog.Portal.Props['container'];
}
export interface DialogProps extends DialogOwnProps, RootOwnProps {
  /** Class for the dialog surface. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * The ⌘K palette: a modal Dialog, top-aligned so results grow downward, holding a Root. Every
 * Root prop is accepted. `hotkey` toggles it from anywhere on the page.
 */
export function Dialog(props: DialogProps): React.ReactElement {
  const [
    config,
    {
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      hotkey = 'mod+k',
      label,
      closeOnSelect = true,
      container,
      className,
      children,
      ...root
    },
  ] = useSlot('Command.Dialog', props);
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const apple = useApple();

  React.useEffect(() => {
    if (!hotkey) return undefined;
    function onKey(event: KeyboardEvent): void {
      if (event.defaultPrevented || event.repeat || !hotkey) return;
      if (!matchesHotkey(event, hotkey, apple)) return;
      event.preventDefault();
      setOpen(!open);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkey, apple, open, setOpen]);

  const close = React.useCallback(() => setOpen(false), [setOpen]);

  return (
    <BaseDialog.Root open={open} onOpenChange={(next) => setOpen(next)}>
      <BaseDialog.Portal container={container}>
        <ThemeScope>
          <DialogBackdrop />
          <BaseDialog.Viewport className={config.unstyled ? undefined : 'hj-command-viewport'}>
            <BaseDialog.Popup
              aria-label={label ?? config.strings.commandPalette}
              className={cls(config, 'Command.Dialog', 'hj-command-dialog', className)}
            >
              <DoneContext.Provider value={closeOnSelect ? close : null}>
                <Root {...root}>{children}</Root>
              </DoneContext.Provider>
            </BaseDialog.Popup>
          </BaseDialog.Viewport>
        </ThemeScope>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
