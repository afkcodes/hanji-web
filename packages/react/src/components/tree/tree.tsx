'use client';
import { Collapsible } from '@base-ui/react/collapsible';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import type { HanjiStrings } from '../../system/config.tsx';
import { msVar } from '../../system/flip.ts';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, flag } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';
import { Spinner } from '../spinner/spinner.tsx';

/*
 * A tree view on the WAI-ARIA APG pattern. Compositional: Root owns expansion, selection and the
 * whole keyboard model; Items describe themselves. The keyboard reads the rendered DOM (role,
 * aria-expanded, closed groups), so it always agrees with what is on screen — however the items
 * were composed, wrapped or mapped. Groups are Base UI Collapsible panels, so the reveal is the
 * same measured height transition as Accordion and Collapsible.
 */

/** Typeahead keystrokes closer together than this extend one search. */
const TYPEAHEAD_MS = 600;
const ITEM = '[role="treeitem"]';
/** An item inside a group that is closed or closing is not on screen for the keyboard. */
const HIDDEN = '[role="group"][data-closed] [role="treeitem"]';

const VISUALLY_HIDDEN: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};
const EMPTY: readonly string[] = [];

export type SelectionMode = 'none' | 'single' | 'multiple';

/** What an item is doing, for `Tree.Icon`'s function children. */
export interface ItemState {
  expanded: boolean;
  selected: boolean;
  disabled: boolean;
  level: number;
}

/* ---------------------------------------------------------------- DOM helpers */

const esc = (s: string): string =>
  typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? CSS.escape(s)
    : s.replace(/["\\]/g, '\\$&');

const childItems = (container: Element | null): HTMLElement[] =>
  container
    ? (Array.from(container.children).filter(
        (c) => c.getAttribute('role') === 'treeitem',
      ) as HTMLElement[])
    : [];

/** Every item a person can see, in reading order. */
function visibleItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(ITEM)).filter((el) => !el.matches(HIDDEN));
}

const isDisabled = (el: Element): boolean => el.getAttribute('aria-disabled') === 'true';

/** The text typeahead matches and announcements read. */
function textOf(el: HTMLElement): string {
  const own = el.getAttribute('data-hj-tree-text');
  if (own) return own;
  const labelledBy = el.getAttribute('aria-labelledby');
  const label = labelledBy ? el.ownerDocument.getElementById(labelledBy) : null;
  return (label ?? el.querySelector('[data-hj-tree-row]') ?? el).textContent?.trim() ?? '';
}

/** aria-setsize / aria-posinset for a level. Written to the DOM so siblings never re-render. */
function numberItems(container: Element | null): void {
  const kids = childItems(container);
  const size = String(kids.length);
  kids.forEach((k, i) => {
    const pos = String(i + 1);
    if (k.getAttribute('aria-setsize') !== size) k.setAttribute('aria-setsize', size);
    if (k.getAttribute('aria-posinset') !== pos) k.setAttribute('aria-posinset', pos);
  });
}

/**
 * Roving tabindex: exactly one visible item is in the tab order. Cheap when it holds (one
 * native query); otherwise the first selected visible item takes it, else the first item.
 */
function heal(root: HTMLElement | null): void {
  if (!root) return;
  const current = root.querySelector<HTMLElement>(`${ITEM}[tabindex="0"]`);
  if (current && !current.matches(HIDDEN)) return;
  if (current) current.tabIndex = -1;
  const items = visibleItems(root);
  const next = items.find((i) => i.getAttribute('aria-selected') === 'true') ?? items[0];
  if (next) next.tabIndex = 0;
}

/** Point a caller's ref at a node (callback or object form). */
function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null): void {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as React.RefObject<T | null>).current = node;
}

/* ---------------------------------------------------------------- contexts */

interface TreeApi {
  /** Open or close several items at once (`*` opens every sibling). */
  setOpen: (ids: readonly string[], open: boolean) => void;
  /** Select per the selection mode: single replaces, multiple toggles. */
  choose: (id: string) => void;
  /** Add these to the selection (multiple). */
  chooseMany: (ids: readonly string[]) => void;
  /** A click or Enter: select, onAction, and open/close a parent when expandOnClick. */
  activate: (id: string) => void;
  announce: (message: string) => void;
}

interface TreeContextValue {
  api: TreeApi;
  mode: SelectionMode;
  expanded: ReadonlySet<string>;
  selected: ReadonlySet<string>;
  rootRef: React.RefObject<HTMLUListElement | null>;
}

type GroupStatus = 'ready' | 'loading' | 'error';

interface ItemContextValue {
  id: string;
  level: number;
  expanded: boolean;
  expandable: boolean;
  selected: boolean;
  disabled: boolean;
  labelId: string;
  metaId: string;
  status: GroupStatus;
  /** Loaded lazily (and done): new rows fade in as the group grows. */
  arrived: boolean;
  retry: () => void;
  /** Item already knows it is a parent (a direct Group child, or `load`). */
  known: boolean;
  /** A Group nested in the caller's component announces itself; returns the cleanup. */
  register: () => () => void;
  /** The mounted group element (or null), so a load can measure it. */
  bindGroup: (el: HTMLElement | null) => void;
  /** The group's height just before its content swapped (loading → rows), once. */
  takeFromHeight: () => number | null;
}

const TreeContext = React.createContext<TreeContextValue | null>(null);
const ItemContext = React.createContext<ItemContextValue | null>(null);
/** The level of the items rendered here: 1 under Root, parent + 1 under a Group. */
const LevelContext = React.createContext(1);

function useTree(part: string): TreeContextValue {
  const ctx = React.useContext(TreeContext);
  if (!ctx) throw new Error(`${part} must be inside Tree.Root.`);
  return ctx;
}
function useItem(part: string): ItemContextValue {
  const ctx = React.useContext(ItemContext);
  if (!ctx) throw new Error(`${part} must be inside Tree.Item.`);
  return ctx;
}

/* ---------------------------------------------------------------- Root */

/** Props hanji adds to the Root. */
export interface RootOwnProps {
  /**
   * none — rows only activate (onAction) · single — one selected row · multiple — click and
   * Space toggle, Shift+↑↓ extend, Ctrl/⌘+A selects everything visible.
   * @default 'single'
   */
  selectionMode?: SelectionMode;
  /** Ids of open items (controlled). */
  expanded?: readonly string[];
  /** Ids open at first (uncontrolled). */
  defaultExpanded?: readonly string[];
  /** Every open or close — click, chevron, ←→, `*`, Enter. */
  onExpandedChange?: (expanded: string[]) => void;
  /** Ids of selected items (controlled). */
  selected?: readonly string[];
  /** Ids selected at first (uncontrolled). */
  defaultSelected?: readonly string[];
  onSelectedChange?: (selected: string[]) => void;
  /** A row was activated: clicked, or Enter. Fires in every selection mode. */
  onAction?: (id: string) => void;
  /**
   * Clicking a parent's row (or Enter on it) also opens or closes it; when false only the
   * chevron and ←→ do.
   * @default true, false when selectionMode is 'multiple'
   */
  expandOnClick?: boolean;
  render?: useRender.RenderProp;
}
export interface RootProps extends RootOwnProps, Omit<React.ComponentProps<'ul'>, 'className'> {
  className?: string;
}

interface Latest {
  expanded: readonly string[];
  selected: readonly string[];
  expandedControlled: boolean;
  selectedControlled: boolean;
  mode: SelectionMode;
  expandOnClick: boolean;
  onExpandedChange: ((expanded: string[]) => void) | undefined;
  onSelectedChange: ((selected: string[]) => void) | undefined;
  onAction: ((id: string) => void) | undefined;
}

/**
 * The tree (`<ul role="tree">`). Owns which items are open and selected, roving focus and the
 * full APG keyboard: ↑↓ Home End move · → opens or enters · ← closes or climbs · `*` opens
 * every sibling · typeahead by label · Enter activates · Space selects.
 *
 * @example
 * <Tree.Root aria-label="Files" defaultExpanded={['src']}>
 *   <Tree.Item id="src">
 *     <Tree.Label>src</Tree.Label>
 *     <Tree.Group>
 *       <Tree.Item id="src/index.ts"><Tree.Label>index.ts</Tree.Label></Tree.Item>
 *     </Tree.Group>
 *   </Tree.Item>
 * </Tree.Root>
 */
export function Root(props: RootProps): React.ReactElement {
  const [
    config,
    {
      selectionMode = 'single',
      expanded: expandedProp,
      defaultExpanded,
      onExpandedChange,
      selected: selectedProp,
      defaultSelected,
      onSelectedChange,
      onAction,
      expandOnClick,
      render,
      className,
      children,
      onKeyDown,
      onFocus,
      ref,
      ...rest
    },
  ] = useSlot('Tree.Root', props);
  const rootRef = React.useRef<HTMLUListElement | null>(null);
  const [innerExpanded, setInnerExpanded] = React.useState(defaultExpanded ?? EMPTY);
  const [innerSelected, setInnerSelected] = React.useState(defaultSelected ?? EMPTY);
  const [message, setMessage] = React.useState('');
  const expanded = expandedProp ?? innerExpanded;
  const selected = selectedProp ?? innerSelected;
  const expandedSet = React.useMemo(() => new Set(expanded), [expanded]);
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);
  const clickExpands = expandOnClick ?? selectionMode !== 'multiple';

  const latest = React.useRef<Latest>({
    expanded,
    selected,
    expandedControlled: expandedProp !== undefined,
    selectedControlled: selectedProp !== undefined,
    mode: selectionMode,
    expandOnClick: clickExpands,
    onExpandedChange,
    onSelectedChange,
    onAction,
  });
  React.useLayoutEffect(() => {
    latest.current = {
      expanded,
      selected,
      expandedControlled: expandedProp !== undefined,
      selectedControlled: selectedProp !== undefined,
      mode: selectionMode,
      expandOnClick: clickExpands,
      onExpandedChange,
      onSelectedChange,
      onAction,
    };
  });

  // Top-level aria-setsize/posinset and the one tabbable item, after every render.
  React.useLayoutEffect(() => {
    numberItems(rootRef.current);
    heal(rootRef.current);
  });

  const [api] = React.useState<TreeApi>(() => {
    const itemEl = (id: string): HTMLElement | null =>
      rootRef.current?.querySelector<HTMLElement>(`[data-hj-tree-id="${esc(id)}"]`) ?? null;
    const commitSelected = (next: string[]): void => {
      const l = latest.current;
      // Uncontrolled: take it now so a second call before the re-render builds on it.
      if (!l.selectedControlled) {
        l.selected = next;
        setInnerSelected(next);
      }
      l.onSelectedChange?.(next);
    };
    const setOpen = (ids: readonly string[], open: boolean): void => {
      const l = latest.current;
      const next = new Set(l.expanded);
      let changed = false;
      for (const id of ids) {
        if (next.has(id) === open) continue;
        changed = true;
        if (open) next.add(id);
        else next.delete(id);
      }
      if (!changed) return;
      const list = [...next];
      if (!l.expandedControlled) {
        l.expanded = list;
        setInnerExpanded(list);
      }
      l.onExpandedChange?.(list);
      if (open) return;
      // Closing over the focused row: focus climbs to the item that closed (APG).
      const active = document.activeElement;
      for (const id of ids) {
        const el = itemEl(id);
        if (el && active && active !== el && el.contains(active)) el.focus();
      }
    };
    const choose = (id: string): void => {
      const l = latest.current;
      if (l.mode === 'none') return;
      const has = l.selected.includes(id);
      if (l.mode === 'single') {
        if (has && l.selected.length === 1) return;
        commitSelected([id]);
      } else commitSelected(has ? l.selected.filter((s) => s !== id) : [...l.selected, id]);
    };
    const chooseMany = (ids: readonly string[]): void => {
      const l = latest.current;
      if (l.mode !== 'multiple') return;
      const next = new Set(l.selected);
      for (const id of ids) next.add(id);
      if (next.size !== l.selected.length) commitSelected([...next]);
    };
    const activate = (id: string): void => {
      const el = itemEl(id);
      if (!el || isDisabled(el)) return;
      const l = latest.current;
      choose(id);
      l.onAction?.(id);
      const state = el.getAttribute('aria-expanded');
      if (l.expandOnClick && state !== null) setOpen([id], state !== 'true');
    };
    const announce = (m: string): void => {
      setMessage('');
      window.setTimeout(() => setMessage(m), 30);
    };
    return { setOpen, choose, chooseMany, activate, announce };
  });

  const typeahead = React.useRef({ buffer: '', at: 0 });

  const handleFocus = (e: React.FocusEvent<HTMLUListElement>): void => {
    onFocus?.(e);
    const root = rootRef.current;
    const el = e.target as HTMLElement;
    if (!root || el.getAttribute('role') !== 'treeitem' || el.tabIndex === 0) return;
    for (const t of root.querySelectorAll<HTMLElement>(`${ITEM}[tabindex="0"]`)) t.tabIndex = -1;
    el.tabIndex = 0;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>): void => {
    onKeyDown?.(e);
    const root = rootRef.current;
    const el = e.target as HTMLElement;
    if (e.defaultPrevented || !root || el.getAttribute('role') !== 'treeitem') return;
    if (el.closest('[role="tree"]') !== root) return;
    const items = visibleItems(root);
    const i = items.indexOf(el);
    if (i < 0) return;
    const id = el.getAttribute('data-hj-tree-id');
    const multi = selectionMode === 'multiple';
    const mod = e.ctrlKey || e.metaKey;
    const rtl = getComputedStyle(root).direction === 'rtl';
    let key = e.key;
    // Leave browser and OS shortcuts (⌥←, ⌘↑, Ctrl+F…) alone; only Ctrl/⌘+A is the tree's.
    if (e.altKey || (mod && key.toLowerCase() !== 'a')) return;
    if (rtl && key === 'ArrowLeft') key = 'ArrowRight';
    else if (rtl && key === 'ArrowRight') key = 'ArrowLeft';
    const ta = typeahead.current;
    const now = Date.now();
    const typing = ta.buffer !== '' && now - ta.at < TYPEAHEAD_MS;

    const go = (target: HTMLElement | undefined | null, extend = false): void => {
      if (!target) return;
      target.focus();
      const tid = target.getAttribute('data-hj-tree-id');
      if (extend && multi && tid && !isDisabled(target)) api.choose(tid);
    };
    const search = (ch: string): void => {
      ta.buffer = now - ta.at < TYPEAHEAD_MS ? ta.buffer + ch : ch;
      ta.at = now;
      const q = ta.buffer.toLocaleLowerCase();
      // "bbb" cycles through items starting with b; "bri" narrows from the current item.
      const repeat = [...q].every((c) => c === q[0]);
      const needle = repeat ? q.slice(0, 1) : q;
      const from = repeat ? i + 1 : i;
      for (let k = 0; k < items.length; k++) {
        const candidate = items[(from + k) % items.length];
        if (candidate && textOf(candidate).toLocaleLowerCase().startsWith(needle)) {
          go(candidate);
          return;
        }
      }
    };

    let handled = true;
    if (key === 'ArrowDown') go(items[i + 1], e.shiftKey);
    else if (key === 'ArrowUp') go(items[i - 1], e.shiftKey);
    else if (key === 'Home') go(items[0]);
    else if (key === 'End') go(items.at(-1));
    else if (key === 'ArrowRight') {
      const state = el.getAttribute('aria-expanded');
      if (state === 'false' && id && !isDisabled(el)) api.setOpen([id], true);
      else if (state === 'true')
        go(el.querySelector<HTMLElement>(`:scope > [role="group"] > ${ITEM}`));
    } else if (key === 'ArrowLeft') {
      if (el.getAttribute('aria-expanded') === 'true' && id && !isDisabled(el))
        api.setOpen([id], false);
      else go(el.parentElement?.closest<HTMLElement>(ITEM));
    } else if (key === 'Enter') {
      if (id) api.activate(id);
    } else if (key === ' ' && typing) search(' ');
    else if (key === ' ') {
      if (id && selectionMode === 'none') api.activate(id);
      else if (id && !isDisabled(el)) api.choose(id);
    } else if (key === '*') {
      const ids = childItems(el.parentElement)
        .filter((s) => s.getAttribute('aria-expanded') === 'false' && !isDisabled(s))
        .map((s) => s.getAttribute('data-hj-tree-id'))
        .filter((s): s is string => s !== null);
      api.setOpen(ids, true);
    } else if (mod && multi && key.toLowerCase() === 'a') {
      api.chooseMany(
        items
          .filter((s) => !isDisabled(s))
          .map((s) => s.getAttribute('data-hj-tree-id'))
          .filter((s): s is string => s !== null),
      );
    } else if (key.length === 1 && !mod) search(key);
    else handled = false;
    if (handled) e.preventDefault();
  };

  const ctx = React.useMemo<TreeContextValue>(
    () => ({ api, mode: selectionMode, expanded: expandedSet, selected: selectedSet, rootRef }),
    [api, selectionMode, expandedSet, selectedSet],
  );

  const element = useRender({
    render,
    ref: ref ? [rootRef, ref] : rootRef,
    defaultTagName: 'ul',
    props: {
      ...rest,
      role: 'tree',
      'aria-multiselectable': selectionMode === 'multiple' ? true : undefined,
      'data-selection-mode': selectionMode,
      onKeyDown: handleKeyDown,
      onFocus: handleFocus,
      className: cls(config, 'Tree.Root', 'hj-tree', className) as string | undefined,
      children,
    },
  });
  return (
    <TreeContext.Provider value={ctx}>
      <LevelContext.Provider value={1}>{element}</LevelContext.Provider>
      <span style={VISUALLY_HIDDEN} aria-live="polite">
        {message}
      </span>
    </TreeContext.Provider>
  );
}

/* ---------------------------------------------------------------- Item */

/** Props hanji adds to an Item. */
export interface ItemOwnProps {
  /** The item's key in `expanded` / `selected` and the id onAction reports. Not written to the DOM `id`. */
  id: string;
  /** What typeahead matches and announcements read, when the label is not plain text. */
  textValue?: string;
  /** Focusable (so it can be found) but not selectable, openable or activatable. */
  disabled?: boolean;
  /**
   * Load the children on first open. While it runs the group shows a loading row; if it
   * rejects, a failed row whose Enter or click calls it again. Render the loaded children in a
   * Tree.Group as usual.
   */
  load?: () => Promise<unknown>;
  render?: useRender.RenderProp;
}
export interface ItemProps
  extends ItemOwnProps, Omit<React.ComponentProps<'li'>, 'id' | 'className' | 'children'> {
  className?: string;
  /**
   * The row's content — Icon, Label, Meta, text, plain elements — or a Tree.Row; then a
   * Tree.Group (or your component that renders one). Any other component renders after the row,
   * so put custom row content inside Tree.Row or Tree.Meta.
   */
  children?: React.ReactNode;
}

interface Parts {
  /** A Tree.Row the caller wrote. */
  row: React.ReactElement | null;
  /** A direct Tree.Group child. */
  group: React.ReactElement | null;
  /** Loose row content, wrapped in a Row for you. */
  content: React.ReactNode[];
  /** Other components (one may render a Tree.Group): after the row. */
  after: React.ReactNode[];
  hasMeta: boolean;
}

const isRowContent = (child: React.ReactNode): boolean =>
  !React.isValidElement(child) ||
  typeof child.type === 'string' ||
  child.type === React.Fragment ||
  child.type === Icon ||
  child.type === Label ||
  child.type === Meta;

/** Sorts an Item's children into its row (given, or built from loose content), group and the rest. */
function split(children: React.ReactNode): Parts {
  let row: React.ReactElement | null = null;
  let group: React.ReactElement | null = null;
  const content: React.ReactNode[] = [];
  const after: React.ReactNode[] = [];
  for (const child of React.Children.toArray(children)) {
    if (React.isValidElement(child) && child.type === Group && !group) group = child;
    else if (React.isValidElement(child) && child.type === Row && !row) row = child;
    else if (isRowContent(child)) content.push(child);
    else after.push(child);
  }
  const rowChildren = row
    ? React.Children.toArray((row.props as { children?: React.ReactNode }).children)
    : content;
  const hasMeta = rowChildren.some((c) => React.isValidElement(c) && c.type === Meta);
  return { row, group, content, after, hasMeta };
}

type Load = 'idle' | 'done' | 'error';

/**
 * One node (`<li role="treeitem">`). Its row is built from the loose children (Icon, Label,
 * Meta); a Tree.Group child makes it a parent. Focus lives here; the row draws the ring.
 */
export function Item(props: ItemProps): React.ReactElement {
  const [
    config,
    {
      id,
      textValue,
      disabled = false,
      load,
      render,
      className,
      style,
      children,
      ref,
      'aria-label': ariaLabel,
      ...rest
    },
  ] = useSlot('Tree.Item', props);
  const tree = useTree('Tree.Item');
  const level = React.useContext(LevelContext);
  const labelId = React.useId();
  const metaId = React.useId();
  const liRef = React.useRef<HTMLElement | null>(null);
  const mergedRef = React.useCallback(
    (node: HTMLElement | null) => {
      liRef.current = node;
      assignRef(ref as React.Ref<HTMLElement> | undefined, node);
    },
    [ref],
  );
  const groupRef = React.useRef<HTMLElement | null>(null);
  const fromHeight = React.useRef<number | null>(null);
  const bindGroup = React.useCallback((el: HTMLElement | null) => {
    groupRef.current = el;
  }, []);
  const takeFromHeight = React.useCallback(() => {
    const h = fromHeight.current;
    fromHeight.current = null;
    return h;
  }, []);
  const parts = React.useMemo(() => split(children), [children]);

  const lazy = load !== undefined;
  // A Tree.Group inside your own component can't be seen here; it registers when it mounts.
  const known = parts.group !== null || lazy;
  const [registered, setRegistered] = React.useState(0);
  const register = React.useCallback(() => {
    setRegistered((n) => n + 1);
    return () => setRegistered((n) => n - 1);
  }, []);
  const expandable = known || registered > 0;
  const expanded = expandable && tree.expanded.has(id);
  const selected = tree.selected.has(id);

  // Lazy children: start on first open; a failure waits for retry.
  const [loaded, setLoaded] = React.useState<Load>('idle');
  const inflight = React.useRef(false);
  const loadRef = React.useRef(load);
  React.useLayoutEffect(() => {
    loadRef.current = load;
  });
  const wantsLoad = lazy && expanded && loaded === 'idle';
  React.useEffect(() => {
    const run = loadRef.current;
    if (!wantsLoad || inflight.current || !run) return;
    inflight.current = true;
    const settle = (result: Load): void => {
      inflight.current = false;
      // Measure before the rows swap in, so the group can grow from here instead of jumping.
      const g = groupRef.current;
      fromHeight.current = g ? g.getBoundingClientRect().height : null;
      setLoaded(result);
    };
    Promise.resolve()
      .then(run)
      .then(
        () => settle('done'),
        () => settle('error'),
      );
  }, [wantsLoad]);

  // Say how a load ended, if the person is in the tree to hear it.
  const strings: HanjiStrings = config.strings;
  const announced = React.useRef<Load>('idle');
  React.useEffect(() => {
    if (announced.current === loaded) return;
    announced.current = loaded;
    const el = liRef.current;
    const root = tree.rootRef.current;
    if (loaded === 'idle' || !el || !root || !root.contains(document.activeElement)) return;
    const name = textOf(el);
    const count = el.querySelectorAll(`:scope > [role="group"] > ${ITEM}`).length;
    tree.api.announce(
      loaded === 'done' ? strings.treeLoaded(name, count) : strings.treeLoadFailedOf(name),
    );
  }, [loaded, strings, tree]);

  const retry = React.useCallback(() => {
    // The failed row is about to become the loading row: keep focus on the parent.
    liRef.current?.focus();
    setLoaded('idle');
  }, []);

  const status: GroupStatus =
    !lazy || loaded === 'done' ? 'ready' : loaded === 'error' ? 'error' : 'loading';

  const ctx = React.useMemo<ItemContextValue>(
    () => ({
      id,
      level,
      expanded,
      expandable,
      selected,
      disabled,
      labelId,
      metaId,
      status,
      arrived: lazy && loaded === 'done',
      retry,
      known,
      register,
      bindGroup,
      takeFromHeight,
    }),
    [
      id,
      level,
      expanded,
      expandable,
      selected,
      disabled,
      labelId,
      metaId,
      status,
      lazy,
      loaded,
      retry,
      known,
      register,
      bindGroup,
      takeFromHeight,
    ],
  );

  const levelStyle = React.useMemo(
    () => ({ ...style, '--_level': level }) as React.CSSProperties,
    [style, level],
  );

  let ariaSelected: boolean | undefined;
  if (tree.mode === 'multiple') ariaSelected = selected;
  else if (tree.mode === 'single' && selected) ariaSelected = true;

  const row = parts.row ?? <Row>{parts.content}</Row>;
  // A lazy item draws its own group for the loading / failed / empty rows until your Group
  // (direct, or inside your component) takes over.
  const group =
    parts.group ?? (lazy && (status !== 'ready' || parts.after.length === 0) ? <Group /> : null);

  return (
    <ItemContext.Provider value={ctx}>
      <Collapsible.Root
        {...(rest as Collapsible.Root.Props)}
        ref={mergedRef}
        open={expanded}
        disabled={disabled}
        render={(render ?? <li />) as Collapsible.Root.Props['render']}
        role="treeitem"
        tabIndex={-1}
        aria-level={level}
        aria-expanded={expandable ? expanded : undefined}
        aria-selected={ariaSelected}
        aria-disabled={disabled ? true : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : labelId}
        aria-describedby={parts.hasMeta ? metaId : undefined}
        data-hj-tree-id={id}
        data-hj-tree-text={textValue}
        data-expanded={flag(expanded)}
        data-selected={flag(selected)}
        data-level={level}
        style={levelStyle}
        className={cls(config, 'Tree.Item', 'hj-tree-item', className)}
      >
        {row}
        {group}
        {parts.after}
      </Collapsible.Root>
    </ItemContext.Provider>
  );
}

/* ---------------------------------------------------------------- Row */

/** Props hanji adds to the Row. */
export interface RowOwnProps {
  render?: useRender.RenderProp;
}
export interface RowProps extends RowOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
}

/**
 * The visible line: chevron (or its spacer), then your Icon · Label · Meta. Item builds one
 * for you; write it yourself to put handlers on the line alone (a context menu, a drag source)
 * — events on Item would also fire for every nested child.
 */
export function Row(props: RowProps): React.ReactElement {
  const [config, { render, className, children, onClick, ...rest }] = useSlot('Tree.Row', props);
  const tree = useTree('Tree.Row');
  const item = useItem('Tree.Row');
  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    onClick?.(e);
    if (e.defaultPrevented || item.disabled) return;
    if (item.expandable && (e.target as Element).closest('[data-hj-tree-chevron]')) {
      tree.api.setOpen([item.id], !item.expanded);
      return;
    }
    tree.api.activate(item.id);
  };
  const c = (name: string): string | undefined => (config.unstyled ? undefined : name);
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...rest,
      'data-hj-tree-row': '',
      onClick: handleClick,
      className: cls(config, 'Tree.Row', 'hj-tree-row', className) as string | undefined,
      children: (
        <>
          <span
            className={c('hj-tree-chevron')}
            data-hj-tree-chevron={item.expandable ? '' : undefined}
            aria-hidden="true"
          >
            {item.expandable ? config.icons.chevronRight : null}
          </span>
          {children}
          {tree.mode === 'multiple' ? (
            <span className={c('hj-tree-check')} aria-hidden="true">
              {config.icons.check}
            </span>
          ) : null}
        </>
      ),
    },
  });
}

/* ---------------------------------------------------------------- Label · Icon · Meta */

/** The item's name. Required (or give Item an aria-label): it names the treeitem. */
export function Label(props: ElementPartProps<'span'>): React.ReactElement {
  const [config, { render, className, ...rest }] = useSlot('Tree.Label', props);
  const item = useItem('Tree.Label');
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      ...rest,
      id: item.labelId,
      'data-hj-tree-label': '',
      className: cls(config, 'Tree.Label', 'hj-tree-label', className) as string | undefined,
    },
  });
}

/** Props hanji adds to the Icon. */
export interface IconOwnProps {
  /** A glyph, or a function of the item's state — an open folder while expanded. */
  children?: React.ReactNode | ((state: ItemState) => React.ReactNode);
  render?: useRender.RenderProp;
}
export interface IconProps
  extends IconOwnProps, Omit<React.ComponentProps<'span'>, 'className' | 'children'> {
  className?: string;
}

/** The leading glyph, 18px in a fixed column. Decorative. */
export function Icon(props: IconProps): React.ReactElement {
  const [config, { render, className, children, ...rest }] = useSlot('Tree.Icon', props);
  const item = useItem('Tree.Icon');
  const glyph =
    typeof children === 'function'
      ? children({
          expanded: item.expanded,
          selected: item.selected,
          disabled: item.disabled,
          level: item.level,
        })
      : children;
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      'aria-hidden': true,
      ...rest,
      className: cls(config, 'Tree.Icon', 'hj-tree-icon', className) as string | undefined,
      children: glyph,
    },
  });
}

/**
 * Trailing detail — a count, a size, a Badge. Tabular numerals, muted. Read as the item's
 * description when it is a direct child of Item or Row.
 */
export function Meta(props: ElementPartProps<'span'>): React.ReactElement {
  const [config, { render, className, ...rest }] = useSlot('Tree.Meta', props);
  const item = useItem('Tree.Meta');
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      ...rest,
      id: item.metaId,
      className: cls(config, 'Tree.Meta', 'hj-tree-meta', className) as string | undefined,
    },
  });
}

/* ---------------------------------------------------------------- Group */

export type GroupProps = Collapsible.Panel.Props;

/**
 * An item's children (`<ul role="group">`), revealed with Base UI's measured height. Mounted
 * only while open. Shows the loading, failed and empty rows itself.
 */
export function Group(props: GroupProps): React.ReactElement {
  const [config, { render, className, children, ref, ...rest }] = useSlot('Tree.Group', props);
  const tree = useTree('Tree.Group');
  const item = useItem('Tree.Group');
  const { status, level, retry, known, register, bindGroup, takeFromHeight } = item;
  const own = React.useRef<HTMLElement | null>(null);
  const mergedRef = React.useCallback(
    (node: HTMLElement | null) => {
      own.current = node;
      bindGroup(node);
      assignRef(ref as React.Ref<HTMLElement> | undefined, node);
    },
    [ref, bindGroup],
  );

  // Inside your own component, Item can't see this Group: tell it it has children.
  React.useLayoutEffect(() => (known ? undefined : register()), [known, register]);
  const strings = config.strings;

  // This level's aria-setsize/posinset, and the tabbable item if it was just hidden or removed.
  React.useLayoutEffect(() => {
    numberItems(own.current);
    heal(tree.rootRef.current);
  });

  // Rows replacing the loading row: the group keeps growing from where it was instead of
  // jumping — the same reveal, continued (gentle-settle, so reduced motion shortens it too).
  // A height is only waiting right after a load settles, so checking every commit is free.
  React.useLayoutEffect(() => {
    const from = takeFromHeight();
    const g = own.current;
    if (from === null || !g || typeof g.animate !== 'function') return;
    const to = g.scrollHeight;
    if (Math.abs(to - from) < 1) return;
    const cs = getComputedStyle(g);
    g.animate([{ height: `${from}px` }, { height: `${to}px` }], {
      duration: msVar(cs, '--hj-dur-gentle-settle', 360),
      easing: cs.getPropertyValue('--hj-ease-gentle-settle').trim() || 'ease-out',
    });
  });

  const c = (name: string): string | undefined => (config.unstyled ? undefined : name);
  const failId = React.useId();
  const retryId = React.useId();
  const childLevel = level + 1;
  const statusStyle = React.useMemo(
    () => ({ '--_level': childLevel }) as React.CSSProperties,
    [childLevel],
  );
  const empty = status === 'ready' && React.Children.toArray(children).length === 0;

  let content: React.ReactNode = children;
  if (status === 'loading' || empty) {
    content = (
      <li
        role="none"
        className={c('hj-tree-item')}
        data-status={empty ? 'empty' : 'loading'}
        style={statusStyle}
      >
        <div className={c('hj-tree-row')}>
          <span className={c('hj-tree-chevron')} aria-hidden="true" />
          {empty ? null : (
            <span className={c('hj-tree-icon')} aria-hidden="true">
              <Spinner size="sm" tone="current" aria-hidden />
            </span>
          )}
          <span className={c('hj-tree-label')}>{empty ? strings.treeEmpty : strings.loading}</span>
        </div>
      </li>
    );
  } else if (status === 'error') {
    content = (
      <li
        role="treeitem"
        tabIndex={-1}
        aria-level={childLevel}
        className={c('hj-tree-item')}
        data-status="error"
        aria-labelledby={`${failId} ${retryId}`}
        style={statusStyle}
        onClick={retry}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          retry();
        }}
      >
        <div className={c('hj-tree-row')} data-hj-tree-row="">
          <span className={c('hj-tree-chevron')} aria-hidden="true" />
          <span className={c('hj-tree-icon')} aria-hidden="true">
            {config.icons.alert}
          </span>
          <span id={failId} className={c('hj-tree-label')}>
            {strings.treeLoadFailed}
          </span>
          <span id={retryId} className={c('hj-tree-retry')}>
            {strings.treeRetry}
          </span>
        </div>
      </li>
    );
  }

  return (
    <LevelContext.Provider value={childLevel}>
      <Collapsible.Panel
        {...rest}
        ref={mergedRef}
        render={render ?? <ul />}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- APG tree: an item's children are role="group"
        role="group"
        aria-busy={status === 'loading' ? true : undefined}
        data-arrived={flag(item.arrived)}
        className={cls(config, 'Tree.Group', 'hj-tree-group', className)}
      >
        {content}
      </Collapsible.Panel>
    </LevelContext.Provider>
  );
}
