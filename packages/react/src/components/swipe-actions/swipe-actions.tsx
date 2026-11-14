'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import type { HanjiStrings } from '../../system/config.tsx';
import { msVar, useFlip } from '../../system/flip.ts';
import type { IconName } from '../../system/icons.tsx';
import { SpringValue, prefersReducedMotion } from '../../system/motion.ts';
import { cls, flag } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';
import * as Menu from '../menu/menu.tsx';

/*
 * The row follows the finger with no React in the loop: the content's transform, every action's
 * fill and label are written straight to the DOM from two springs (the offset, and the "armed"
 * progress of a full swipe). React only hears about the result — which side is open.
 */

/** Movement before the gesture picks an axis: sideways wins, or the page scrolls. */
const SLOP = 8;
/** A release faster than this (px/s) decides by direction, not by distance. */
const FLING = 360;
/** The velocity a spring inherits from a flick is capped, so a hard flick never flies far. */
const MAX_V = 1600;
/** Velocity is read over the last stretch of the drag (ms)… */
const WINDOW = 90;
/** …and is zero if the finger stopped this long before letting go. */
const STILL = 60;
/** Arming has a little give, so the point of no return never flickers. */
const HYSTERESIS = 16;
/** A side with nothing on it still gives a little, up to about this far. */
const NUDGE = 36;
/** A click this soon after a swipe (or a tap that closed a row) is swallowed. */
const SWALLOW = 800;
/** A trackpad swipe has ended once its wheel events (momentum included) pause this long (ms). */
const WHEEL_IDLE = 120;

const VISUALLY_HIDDEN: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

/** Rubber band (the iOS curve): past a limit, travel e gives at most d. */
const band = (e: number, d: number): number => (e * 0.55 * d) / (e * 0.55 + d);
const unband = (y: number, d: number): number => {
  const c = Math.min(y, d * 0.98);
  return (c * d) / (0.55 * (d - c));
};
const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

/** The side a row opens to. Leading is the start edge (left in LTR), trailing the end edge. */
export type Side = 'leading' | 'trailing';
/** Tint of an action: a tone colour behind a glyph and a verb. */
export type Tone = 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger';
/** Why the open side changed. */
export type OpenChangeReason =
  | 'swipe'
  | 'tap'
  | 'focus'
  | 'outside'
  | 'scroll'
  | 'escape'
  | 'group'
  | 'action';
export interface OpenChangeDetails {
  reason: OpenChangeReason;
}

/** +1 when revealing this side moves the content right (the tray sits on the left). */
const dirOf = (side: Side, rtl: boolean): 1 | -1 => ((side === 'leading') !== rtl ? 1 : -1);
const sideAt = (x: number, rtl: boolean): Side | null =>
  x === 0 ? null : x > 0 !== rtl ? 'leading' : 'trailing';

interface Cell {
  el: HTMLElement;
  fill: HTMLElement | null;
  label: HTMLElement | null;
  /** Natural width. */
  w: number;
  /** Natural distance of its outer side from the row's outer edge. */
  u: number;
}
interface Tray {
  /** Inner (next to the content) → outer (at the row's edge). */
  cells: Cell[];
  /** Total width when open. */
  W: number;
  /** The outermost action commits on a full swipe. */
  full: boolean;
}
interface Geo {
  content: HTMLElement | null;
  width: number;
  rtl: boolean;
  leading: Tray | null;
  trailing: Tray | null;
}
interface Entry {
  onAction: (() => void) | undefined;
  removes: boolean;
  announce: string | undefined;
  tone: Tone;
  icon: React.ReactNode;
  label: React.ReactNode;
}
interface MenuEntry {
  id: string;
  tone: Tone;
  icon: React.ReactNode;
  label: React.ReactNode;
  disabled: boolean;
}
interface Drag {
  id: number;
  el: HTMLElement;
  x0: number;
  y0: number;
  raw0: number;
  locked: boolean;
  wasOpen: boolean;
  consumed: boolean;
  samples: { t: number; x: number }[];
  end: () => void;
}
/** A two-finger trackpad swipe, read from wheel events. */
interface Wheel {
  /** Travel since the gesture locked sideways, before the rubber band. */
  raw: number;
  /** Travel while picking an axis. */
  ax: number;
  ay: number;
  locked: boolean;
  /** It was a scroll: ignore it until it pauses. */
  vertical: boolean;
  samples: { t: number; x: number }[];
  timer: number;
}
interface Latest {
  open: Side | null;
  controlled: boolean;
  disabled: boolean;
  label: string | undefined;
  strings: HanjiStrings;
  group: GroupApi | null;
  setInner: (side: Side | null) => void;
  say: (message: string) => void;
  onOpenChange: ((open: Side | null, details: OpenChangeDetails) => void) | undefined;
}

const own = (root: HTMLElement, el: Element): boolean =>
  el.closest('[data-hj-swipe-root]') === root;
const isDisabled = (el: Element): boolean =>
  el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';
const textOf = (el: Element): string =>
  el.getAttribute('aria-label') ?? el.textContent?.trim() ?? '';

function measureTray(root: HTMLElement, side: Side): Tray | null {
  const tray = Array.from(
    root.querySelectorAll<HTMLElement>(`[data-hj-swipe-tray="${side}"]`),
  ).find((t) => own(root, t));
  if (!tray) return null;
  const els = Array.from(tray.querySelectorAll<HTMLElement>('[data-hj-swipe-action]')).filter((c) =>
    own(root, c),
  );
  // trailing reads inner → outer in DOM order; leading's outermost comes first
  if (side === 'leading') els.reverse();
  let W = 0;
  for (const el of els) W += el.offsetWidth;
  if (W <= 0) return null;
  let outer = W;
  const cells = els.map((el): Cell => {
    const w = el.offsetWidth;
    outer -= w;
    return {
      el,
      w,
      u: outer,
      fill: el.querySelector<HTMLElement>('[data-hj-swipe-fill]'),
      label: el.querySelector<HTMLElement>('[data-hj-swipe-label]'),
    };
  });
  const edge = cells[cells.length - 1];
  return { cells, W, full: tray.hasAttribute('data-full-swipe') && !!edge && !isDisabled(edge.el) };
}

/** Where a full swipe commits: a clear way past the actions, about half the row. */
const commitAt = (tray: Tray, width: number): number =>
  Math.min(width - 24, Math.max(tray.W + 56, Math.min(width * 0.5, tray.W + 200)));

function velocity(samples: Drag['samples'], now: number): number {
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (!first || !last || first === last || now - last.t > STILL) return 0;
  // under ~a frame of samples the rate is noise, not a flick
  const dt = last.t - first.t;
  return dt >= 12 ? ((last.x - first.x) / dt) * 1000 : 0;
}

/** After a row leaves with focus inside it, focus lands on the next row (or the previous). */
function successor(root: HTMLElement): HTMLElement | null {
  const find = (dir: 'nextElementSibling' | 'previousElementSibling'): HTMLElement | null => {
    for (let s = root[dir]; s; s = s[dir]) {
      if (s instanceof HTMLElement && s.hasAttribute('data-hj-swipe-root')) return s;
    }
    return null;
  };
  return find('nextElementSibling') ?? find('previousElementSibling');
}
function focusRow(row: HTMLElement): void {
  const target =
    row.querySelector<HTMLElement>('[data-hj-swipe-more]:not([disabled])') ??
    row.querySelector<HTMLElement>(
      '[data-hj-swipe-content] :is(a[href], button:not([disabled]), [tabindex="0"])',
    ) ??
    row.querySelector<HTMLElement>('[data-hj-swipe-content][tabindex], a[data-hj-swipe-content]');
  target?.focus({ preventScroll: false });
}

/* -------------------------------------------------------------------------------------------- */

interface GroupApi {
  el: HTMLElement | null;
  attach(el: HTMLElement | null): void;
  claim(row: RowController): void;
  release(row: RowController): void;
  consume(e: Event): void;
  consumed(e: Event): boolean;
  say(message: string): void;
}

function createGroup(setMessage: (m: string) => void): GroupApi {
  let open: RowController | null = null;
  let eaten: Event | null = null;
  const api: GroupApi = {
    el: null,
    attach(el) {
      api.el = el;
    },
    claim(row) {
      if (open && open !== row) open.close('group');
      open = row;
    },
    release(row) {
      if (open === row) open = null;
    },
    consume(e) {
      eaten = e;
    },
    consumed(e) {
      const hit = eaten === e;
      eaten = null;
      return hit;
    },
    say(message) {
      setMessage('');
      window.setTimeout(() => setMessage(message), 30);
    },
  };
  return api;
}

const GroupContext = React.createContext<GroupApi | null>(null);

/* -------------------------------------------------------------------------------------------- */

class RowController {
  readonly x: SpringValue;
  readonly a: SpringValue;
  readonly registry: Map<string, { current: Entry }> = new Map();
  geo: Geo | null = null;
  goal = 0;
  armed = false;
  armIndex: number | null = null;
  revealing: Side | null = null;
  reduced = false;
  busy = false;
  alive = true;
  synced = false;
  reason: OpenChangeReason = 'swipe';
  swallowUntil = 0;
  drag: Drag | null = null;
  private wheeling: Wheel | null = null;
  private unlisten: (() => void) | null = null;
  private rest: ((v: number) => void) | null = null;
  private timers: Set<number> = new Set();
  private root: HTMLElement | null = null;
  private latest: Latest;

  constructor(latest: Latest) {
    this.latest = latest;
    this.x = new SpringValue(0, {
      spring: 'snappy',
      onUpdate: () => this.paint(),
      onRest: (v) => {
        const then = this.rest;
        this.rest = null;
        then?.(v);
      },
    });
    this.a = new SpringValue(0, {
      spring: 'snappy',
      onUpdate: () => this.paint(),
      onRest: () => {
        if (!this.armed && this.a.x === 0) this.armIndex = null;
      },
    });
  }

  /** Callback ref for the row element. */
  readonly attach = (el: HTMLElement | null): void => {
    this.root = el;
  };

  /** The latest props and setters, handed over after every render. */
  update(latest: Latest): void {
    this.latest = latest;
  }

  mount(): void {
    this.alive = true;
    const root = this.root;
    if (!root) return;
    // not React's onWheel: that listener is passive, and a sideways swipe must stop the page
    const wheel = (e: WheelEvent): void => this.wheel(e);
    root.addEventListener('wheel', wheel, { passive: false });
    this.unlisten = () => root.removeEventListener('wheel', wheel);
  }

  /** A finger or a trackpad is moving the row. */
  private get gesturing(): boolean {
    return !!this.drag?.locked || !!this.wheeling?.locked;
  }

  dispose(): void {
    this.alive = false;
    this.x.stop();
    this.a.stop();
    this.drag?.end();
    this.drag = null;
    this.unlisten?.();
    this.unlisten = null;
    if (this.wheeling) window.clearTimeout(this.wheeling.timer);
    this.wheeling = null;
    for (const t of this.timers) window.clearTimeout(t);
    this.timers.clear();
    this.latest.group?.release(this);
  }

  private later(fn: () => void, ms: number): void {
    const t = window.setTimeout(() => {
      this.timers.delete(t);
      fn();
    }, ms);
    this.timers.add(t);
  }

  register(id: string, entry: { current: Entry }): () => void {
    this.registry.set(id, entry);
    return () => {
      this.registry.delete(id);
    };
  }

  /** The actions in DOM order (danger last), for the More menu. */
  items(): MenuEntry[] {
    const root = this.root;
    if (!root) return [];
    const list = Array.from(root.querySelectorAll<HTMLElement>('[data-hj-swipe-action]'))
      .filter((el) => own(root, el))
      .flatMap((el): MenuEntry[] => {
        const id = el.getAttribute('data-hj-swipe-action') ?? '';
        const e = this.registry.get(id)?.current;
        if (!e) return [];
        return [{ id, tone: e.tone, icon: e.icon, label: e.label, disabled: isDisabled(el) }];
      });
    return [...list.filter((i) => i.tone !== 'danger'), ...list.filter((i) => i.tone === 'danger')];
  }

  private measure(): Geo | null {
    const root = this.root;
    if (!root) return null;
    const content =
      Array.from(root.querySelectorAll<HTMLElement>('[data-hj-swipe-content]')).find((c) =>
        own(root, c),
      ) ?? null;
    this.geo = {
      content,
      width: root.offsetWidth,
      rtl: getComputedStyle(root).direction === 'rtl',
      leading: measureTray(root, 'leading'),
      trailing: measureTray(root, 'trailing'),
    };
    return this.geo;
  }

  private sense(): void {
    const reduced = prefersReducedMotion(this.root);
    this.reduced = reduced;
    this.x.reduced = reduced;
    this.a.reduced = reduced;
  }

  private limits(side: Side, geo: Geo): { limit: number; d: number } {
    const tray = geo[side];
    if (!tray) return { limit: 0, d: NUDGE };
    if (tray.full) return { limit: geo.width, d: 48 };
    return { limit: tray.W, d: Math.min(120, Math.max(48, geo.width - tray.W)) };
  }

  /** Finger travel → row offset: 1:1 within reach, a rubber band past it (a wall when reduced). */
  private resist(raw: number): number {
    const geo = this.geo;
    const side = geo ? sideAt(raw, geo.rtl) : null;
    if (!geo || !side) return raw;
    const { limit, d } = this.limits(side, geo);
    const r = Math.abs(raw);
    if (r <= limit) return raw;
    const s = Math.sign(raw);
    return this.reduced ? s * limit : s * (limit + band(r - limit, d));
  }

  private unresist(x: number): number {
    const geo = this.geo;
    const side = geo ? sideAt(x, geo.rtl) : null;
    if (!geo || !side) return x;
    const { limit, d } = this.limits(side, geo);
    const r = Math.abs(x);
    return r <= limit ? x : Math.sign(x) * (limit + unband(r - limit, d));
  }

  /** Write the frame: the content's offset, then every revealed action's fill and label. */
  paint(): void {
    const root = this.root;
    const geo = this.geo;
    if (!root || !geo?.content) return;
    const x = Math.abs(this.x.x) < 0.01 ? 0 : this.x.x;
    const a = this.a.x;
    geo.content.style.transform = x ? `translate3d(${x.toFixed(2)}px, 0, 0)` : '';
    const side = sideAt(x, geo.rtl);
    if (side !== this.revealing) {
      this.revealing = side;
      if (side) root.setAttribute('data-revealing', side);
      else root.removeAttribute('data-revealing');
    }
    const tray = side ? geo[side] : null;
    if (!side || !tray) return;
    const r = Math.abs(x);
    const dir = dirOf(side, geo.rtl);
    const n = tray.cells.length;
    const k0 = this.armIndex ?? n - 1;
    // iOS spreads the actions out of the gap; reduced motion lays them still under the row
    const spread = !(this.reduced && r <= tray.W);
    const s = r / tray.W;
    tray.cells.forEach((c, k) => {
      // u-space: distance in from the row's outer edge; the content's edge sits at r
      const ulo = spread ? c.u * s : c.u;
      const uhi = spread ? (c.u + c.w) * s : c.u + c.w;
      // armed: the chosen action takes the whole gap, the others fold away from it
      const alo = k < k0 ? r : 0;
      const ahi = k === k0 ? r : k < k0 ? r : 0;
      let lo = ulo + (alo - ulo) * a;
      const hi = uhi + (ahi - uhi) * a;
      const h = hi - lo;
      if (spread && h > 0.5) lo -= 1; // overlap the outer neighbour by a pixel: no seam
      const home = c.u + c.w / 2;
      if (c.fill) {
        const dx = ((lo + hi) / 2 - home) * dir;
        c.fill.style.transform = `translate3d(${dx.toFixed(2)}px, 0, 0) scaleX(${((hi - lo) / c.w).toFixed(4)})`;
      }
      if (c.label) {
        const umid = (ulo + uhi) / 2;
        // the committing glyph rides the content's edge, so the gesture says what it will do
        const armedMid = k === k0 ? Math.max(c.w / 2, r - c.w / 2) : (alo + ahi) / 2;
        const mid = umid + (armedMid - umid) * a;
        const lift = k === k0 && a > 0.001 ? ` scale(${(1 + 0.08 * a).toFixed(3)})` : '';
        c.label.style.transform = `translate3d(${((mid - home) * dir).toFixed(2)}px, 0, 0)${lift}`;
        c.label.style.opacity = clamp01((h / c.w - 0.35) / 0.45).toFixed(3);
      }
    });
  }

  private go(target: number, v: number, clamp: boolean, then?: (v: number) => void): void {
    this.goal = target;
    this.rest = then ?? null;
    this.x.configure({ clamp }).to(target, Math.max(-MAX_V, Math.min(MAX_V, v)));
  }

  private mark(side: Side | null): void {
    const root = this.root;
    const geo = this.geo;
    if (!root) return;
    root.toggleAttribute('data-armed', side !== null);
    for (const s of ['leading', 'trailing'] as const) {
      const cells = geo?.[s]?.cells ?? [];
      const k0 = this.armIndex ?? cells.length - 1;
      cells.forEach((c, k) => c.el.toggleAttribute('data-armed', s === side && k === k0));
    }
  }

  private disarm(): void {
    if (this.armed) {
      this.armed = false;
      this.mark(null);
    }
    if (this.a.x !== 0) this.a.to(0);
  }

  /** The point of no return: past it, letting go commits the outermost action. */
  private track(x: number): void {
    const geo = this.geo;
    if (!geo) return;
    const side = sideAt(x, geo.rtl);
    const tray = side ? geo[side] : null;
    const at = tray?.full ? commitAt(tray, geo.width) : Infinity;
    const r = Math.abs(x);
    const on = this.armed ? r > at - HYSTERESIS : r > at;
    if (on === this.armed) return;
    this.armed = on;
    this.armIndex = null;
    this.mark(on ? side : null);
    this.a.to(on ? 1 : 0);
  }

  request(side: Side | null, reason: OpenChangeReason): void {
    const L = this.latest;
    this.reason = reason;
    if (side) L.group?.claim(this);
    else L.group?.release(this);
    if (side === L.open) return;
    if (!L.controlled) L.setInner(side);
    L.onOpenChange?.(side, { reason });
    // a controlled parent that keeps `open` gets the row put back where it says
    if (L.controlled) {
      requestAnimationFrame(() => {
        if (this.alive && this.latest.open !== side) this.sync(this.latest.open);
      });
    }
  }

  /** Bring the row to the open side React holds (after a prop change or a refused request). */
  sync(side: Side | null): void {
    if (this.gesturing || this.busy) return;
    const geo = this.measure();
    const tray = side && geo ? geo[side] : null;
    const target = side && tray && geo ? dirOf(side, geo.rtl) * tray.W : 0;
    const group = this.latest.group;
    if (!this.synced) {
      this.synced = true;
      if (target) {
        this.goal = target;
        this.x.set(target);
        group?.claim(this);
      }
      return;
    }
    if (Math.abs(target - this.goal) < 0.5) return;
    this.sense();
    if (target) {
      group?.claim(this);
      this.go(target, 0, false);
    } else {
      group?.release(this);
      this.disarm();
      this.go(0, 0, true);
    }
  }

  reveal(side: Side, reason: OpenChangeReason): void {
    if (this.busy || this.gesturing || this.latest.disabled) return;
    if (this.latest.open === side && this.goal !== 0) return;
    const geo = this.measure();
    const tray = geo?.[side];
    if (!geo || !tray) return;
    this.sense();
    this.go(dirOf(side, geo.rtl) * tray.W, 0, false);
    this.request(side, reason);
  }

  close(reason: OpenChangeReason, v = 0): void {
    if (this.busy || this.gesturing) return;
    this.sense();
    this.disarm();
    if (this.goal !== 0 || this.x.x !== 0) this.go(0, v, true);
    this.request(null, reason);
  }

  /** Run an action: tapped in the tray, picked from the menu, or committed by a full swipe. */
  run(id: string, via: 'tap' | 'menu' | 'swipe', v = 0): void {
    const root = this.root;
    const entry = this.registry.get(id)?.current;
    if (!root || !entry || this.busy || this.latest.disabled) return;
    const el = Array.from(root.querySelectorAll<HTMLElement>('[data-hj-swipe-action]')).find(
      (e) => e.getAttribute('data-hj-swipe-action') === id,
    );
    if (!el || isDisabled(el)) return;
    this.sense();
    const fire = (): void => {
      const L = this.latest;
      if (via === 'swipe' && entry.announce !== '') {
        L.say(entry.announce ?? L.strings.swipeActionDone(textOf(el), L.label));
      }
      entry.onAction?.();
    };
    if (!entry.removes) {
      fire();
      this.close('action', v);
      return;
    }
    // a removal: slide the row out (the action takes the gap), fade, then let the item go
    this.busy = true;
    const geo = this.measure();
    const side = el.closest('[data-hj-swipe-tray]')?.getAttribute('data-hj-swipe-tray');
    const tray = geo && (side === 'leading' || side === 'trailing') ? geo[side] : null;
    const k = tray ? tray.cells.findIndex((c) => c.el === el) : -1;
    if (geo && tray && k >= 0 && (side === 'leading' || side === 'trailing') && !this.reduced) {
      this.armIndex = k;
      this.armed = true;
      this.mark(side);
      this.a.to(1);
      this.go(dirOf(side, geo.rtl) * (geo.width + 2), v, true, () => this.leave(fire));
    } else this.leave(fire);
  }

  private leave(fire: () => void): void {
    const root = this.root;
    if (!root) return;
    root.setAttribute('data-removing', '');
    const ms = msVar(getComputedStyle(root), '--hj-dur-fast', 120);
    let done = false;
    const finish = (): void => {
      if (done) return;
      done = true;
      root.removeEventListener('transitionend', onEnd);
      const next = root.contains(document.activeElement) ? successor(root) : null;
      fire();
      // not a tracked timer: it must outlive this row
      if (next) {
        window.setTimeout(() => {
          if (!root.isConnected && next.isConnected) focusRow(next);
        }, 60);
      }
      this.later(() => this.restore(), 160);
    };
    const onEnd = (e: TransitionEvent): void => {
      if (e.target === root && e.propertyName === 'opacity') finish();
    };
    root.addEventListener('transitionend', onEnd);
    this.later(finish, ms + 60);
  }

  /** The item stayed (a confirm, a failure): put the row back, closed, and fade it in. */
  private restore(): void {
    const root = this.root;
    if (!this.alive || !root?.isConnected) return;
    this.busy = false;
    this.armed = false;
    this.mark(null);
    this.armIndex = null;
    this.a.set(0);
    this.goal = 0;
    this.x.set(0);
    root.removeAttribute('data-removing');
    this.request(null, 'action');
  }

  /* -- gesture -------------------------------------------------------------------------------- */

  down(e: React.PointerEvent<HTMLElement>): void {
    const root = this.root;
    const content = e.currentTarget;
    // events from the More menu's portal bubble here through React; they aren't ours
    if (!root || !content.contains(e.target as Node)) return;
    const L = this.latest;
    const consumed = L.group?.consumed(e.nativeEvent) ?? false;
    if (
      L.disabled ||
      this.busy ||
      this.drag ||
      this.wheeling?.locked ||
      e.button !== 0 ||
      !e.isPrimary
    ) {
      if (consumed) this.swallowUntil = performance.now() + SWALLOW;
      return;
    }
    const move = (ev: PointerEvent): void => this.move(d, ev);
    const up = (ev: PointerEvent): void => this.up(d, ev);
    const d: Drag = {
      id: e.pointerId,
      el: content,
      x0: e.clientX,
      y0: e.clientY,
      raw0: 0,
      locked: false,
      wasOpen: this.goal !== 0 || Math.abs(this.x.x) > 0.5,
      consumed,
      samples: [],
      end: () => {
        removeEventListener('pointermove', move);
        removeEventListener('pointerup', up);
        removeEventListener('pointercancel', up);
      },
    };
    this.drag = d;
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
  }

  private lock(d: Drag, ev: PointerEvent): void {
    const root = this.root;
    if (!root) return;
    d.locked = true;
    // re-anchor: the row starts from where the finger is now, so it never jumps the slop
    d.x0 = ev.clientX;
    this.x.stop();
    this.rest = null;
    this.sense();
    this.measure();
    d.raw0 = this.unresist(this.x.x);
    root.setAttribute('data-dragging', '');
    try {
      d.el.setPointerCapture(d.id);
    } catch {
      // the pointer may already be gone
    }
    this.latest.group?.claim(this);
  }

  private move(d: Drag, ev: PointerEvent): void {
    if (ev.pointerId !== d.id) return;
    if (!d.locked) {
      const dx = ev.clientX - d.x0;
      const dy = ev.clientY - d.y0;
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        // vertical: a scroll. Let the page have it.
        d.end();
        this.drag = null;
        return;
      }
      this.lock(d, ev);
    }
    const x = this.resist(d.raw0 + ev.clientX - d.x0);
    this.goal = x;
    this.x.set(x);
    const t = ev.timeStamp || performance.now();
    d.samples.push({ t, x });
    while (d.samples.length > 2 && t - (d.samples[0]?.t ?? t) > WINDOW) d.samples.shift();
    this.track(x);
  }

  private up(d: Drag, ev: PointerEvent): void {
    if (ev.pointerId !== d.id) return;
    d.end();
    this.drag = null;
    const cancelled = ev.type === 'pointercancel';
    if (!d.locked) {
      if (cancelled) return;
      // a tap on an open row (or on a row while another was open) only closes
      if (d.wasOpen || d.consumed) this.swallowUntil = performance.now() + SWALLOW;
      if (d.wasOpen) this.close('tap');
      return;
    }
    this.swallowUntil = performance.now() + SWALLOW;
    this.root?.removeAttribute('data-dragging');
    try {
      d.el.releasePointerCapture(d.id);
    } catch {
      // already released
    }
    this.release(cancelled ? 0 : velocity(d.samples, ev.timeStamp || performance.now()), cancelled);
  }

  private release(v: number, cancelled: boolean): void {
    const geo = this.geo;
    if (!geo) return;
    const x = this.x.x;
    const side = sideAt(x, geo.rtl);
    const tray = side ? geo[side] : null;
    if (this.armed && !cancelled && tray) {
      const id = tray.cells[tray.cells.length - 1]?.el.getAttribute('data-hj-swipe-action');
      if (id) {
        this.run(id, 'swipe', v);
        return;
      }
    }
    this.disarm();
    let next: Side | null = null;
    if (side && tray) {
      const outward = v * Math.sign(x);
      if (Math.abs(v) > FLING) next = outward > 0 ? side : null;
      else next = Math.abs(x) > tray.W / 2 ? side : null;
    }
    if (next && tray) this.go(dirOf(next, geo.rtl) * tray.W, v, false);
    else this.go(0, v, true);
    this.request(next, 'swipe');
  }

  /*
   * Trackpad: a two-finger sideways swipe arrives as wheel events. It moves the row exactly like a
   * finger — same rubber band, same point of no return — and is released when the events pause.
   * Momentum after the fingers lift keeps it gliding, the way a native list does. Vertical
   * scrolls, pinch-zoom (ctrlKey) and anything mid-drag pass through untouched.
   */
  private wheel(e: WheelEvent): void {
    const root = this.root;
    const L = this.latest;
    if (!root || L.disabled || this.busy || this.drag || e.ctrlKey) return;
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? root.offsetWidth : 1;
    const dx = e.deltaX * unit;
    const dy = e.deltaY * unit;
    let w = this.wheeling;
    if (!w) {
      w = { raw: 0, ax: 0, ay: 0, locked: false, vertical: false, samples: [], timer: 0 };
      this.wheeling = w;
    }
    window.clearTimeout(w.timer);
    w.timer = window.setTimeout(() => this.wheelEnd(), WHEEL_IDLE);
    if (w.vertical) return;
    if (!w.locked) {
      w.ax += dx;
      w.ay += dy;
      const ax = Math.abs(w.ax);
      const ay = Math.abs(w.ay);
      if (ay >= SLOP && ay >= ax) {
        // a scroll: the page has it until the gesture pauses
        w.vertical = true;
        return;
      }
      if (ax < SLOP || ax < ay * 1.2) {
        // sideways but undecided: keep it from the page (and its history swipe) meanwhile
        if (Math.abs(dx) > Math.abs(dy)) e.preventDefault();
        return;
      }
      w.locked = true;
      this.x.stop();
      this.rest = null;
      this.sense();
      this.measure();
      // re-anchor, as a finger does: the row starts from where it is, never jumping the slop
      w.raw = this.unresist(this.x.x);
      root.setAttribute('data-dragging', '');
      L.group?.claim(this);
    }
    e.preventDefault();
    // fingers moving left scroll content left (natural scrolling): deltaX is positive
    w.raw -= dx;
    const x = this.resist(w.raw);
    this.goal = x;
    this.x.set(x);
    const t = e.timeStamp || performance.now();
    w.samples.push({ t, x });
    while (w.samples.length > 2 && t - (w.samples[0]?.t ?? t) > WINDOW) w.samples.shift();
    this.track(x);
  }

  private wheelEnd(): void {
    const w = this.wheeling;
    this.wheeling = null;
    if (!w?.locked || !this.alive) return;
    this.root?.removeAttribute('data-dragging');
    // the events have paused, so the row has stopped: it settles by where it is
    this.release(velocity(w.samples, performance.now()), false);
  }

  click(e: React.MouseEvent<HTMLElement>): void {
    if (!e.currentTarget.contains(e.target as Node)) return;
    // keyboard clicks (detail 0) are never swallowed
    if (e.detail > 0 && performance.now() < this.swallowUntil) {
      e.preventDefault();
      e.stopPropagation();
      this.swallowUntil = 0;
    }
  }

  /** While open: a press outside, or a scroll of anything holding the row, closes it. */
  watch(): () => void {
    const root = this.root;
    if (!root) return () => {};
    const down = (e: PointerEvent): void => {
      const t = e.target;
      if (!(t instanceof Node) || root.contains(t)) return;
      const group = this.latest.group;
      // a tap on another row of the group only closes this one
      if (group?.el?.contains(t)) group.consume(e);
      this.close('outside');
    };
    const scroll = (e: Event): void => {
      if (this.reason === 'focus' || this.gesturing || this.busy) return;
      const t = e.target;
      if (t instanceof Node && !t.contains(root)) return;
      this.close('scroll');
    };
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('scroll', scroll, true);
    return () => {
      document.removeEventListener('pointerdown', down, true);
      document.removeEventListener('scroll', scroll, true);
    };
  }

  keyDown(e: React.KeyboardEvent<HTMLElement>): void {
    const root = this.root;
    if (e.key !== 'Escape' || !root || !this.latest.open || this.busy) return;
    e.preventDefault();
    e.stopPropagation();
    const fromTray = !!(e.target as HTMLElement).closest?.('[data-hj-swipe-tray]');
    this.close('escape');
    if (fromTray) focusRow(root);
  }

  blur(e: React.FocusEvent<HTMLElement>): void {
    const root = this.root;
    const to = e.relatedTarget;
    if (!root || !this.latest.open || !(to instanceof Node) || root.contains(to)) return;
    this.close('outside');
  }
}

/* -------------------------------------------------------------------------------------------- */

interface RowContextValue {
  row: RowController;
  open: Side | null;
  disabled: boolean;
  label: string | undefined;
}
const RowContext = React.createContext<RowContextValue | null>(null);
const SideContext = React.createContext<Side | null>(null);

function useRow(part: string): RowContextValue {
  const ctx = React.useContext(RowContext);
  if (!ctx) throw new Error(`${part} must be inside SwipeActions.Root.`);
  return ctx;
}

/* -------------------------------------------------------------------------------------------- */

export interface GroupOwnProps {
  /** Hairlines between rows, inset to the text column. @default true */
  divided?: boolean;
  render?: useRender.RenderProp;
}
export interface GroupProps extends GroupOwnProps, Omit<React.ComponentProps<'ul'>, 'className'> {
  className?: string;
}

/**
 * A list of swipeable rows: opening one closes the others, a tap on another row only closes the
 * open one, and when a row leaves the ones below glide up. Announcements live here, so they
 * survive the row that made them.
 */
export function Group(props: GroupProps): React.ReactElement {
  const [config, { divided = true, render, className, children, ...rest }] = useSlot(
    'SwipeActions.Group',
    props,
  );
  const ref = React.useRef<HTMLElement | null>(null);
  const [message, setMessage] = React.useState('');
  const [group] = React.useState(() => createGroup(setMessage));
  useFlip(ref);
  const element = useRender({
    render,
    ref: [ref, group.attach],
    defaultTagName: 'ul',
    props: {
      ...rest,
      'data-divided': flag(divided),
      className: cls(config, 'SwipeActions.Group', 'hj-swipe-actions-group', className) as
        | string
        | undefined,
      children: <GroupContext.Provider value={group}>{children}</GroupContext.Provider>,
    },
  });
  return (
    <>
      {element}
      <span style={VISUALLY_HIDDEN} aria-live="polite">
        {message}
      </span>
    </>
  );
}

export interface RootOwnProps {
  /** The open side (controlled). `null` = closed. */
  open?: Side | null;
  /** The open side to start with (uncontrolled). @default null */
  defaultOpen?: Side | null;
  /** The open side changed: a swipe settled, a tap or scroll closed it, another row opened. */
  onOpenChange?: (open: Side | null, details: OpenChangeDetails) => void;
  /** Locked: no swipe, and every action (and the More menu) is off. */
  disabled?: boolean;
  /** What the row is, for the More button’s name and announcements: “Quarterly numbers, Ilse Brandt”. */
  label?: string;
  render?: useRender.RenderProp;
}
export interface RootProps extends RootOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
}

/**
 * One swipeable row: Content on top, Leading and Trailing trays beneath. Renders `<li>` inside a
 * Group, `<div>` on its own.
 *
 * @example
 * <SwipeActions.Root label="Quarterly numbers, Ilse Brandt">
 *   <SwipeActions.Leading>
 *     <SwipeActions.Action tone="info" icon="check" onAction={markRead}>Read</SwipeActions.Action>
 *   </SwipeActions.Leading>
 *   <SwipeActions.Content>…</SwipeActions.Content>
 *   <SwipeActions.Trailing fullSwipe>
 *     <SwipeActions.Action tone="success" icon={<ArchiveGlyph />} removes onAction={archive}>Archive</SwipeActions.Action>
 *   </SwipeActions.Trailing>
 * </SwipeActions.Root>
 */
export function Root(props: RootProps): React.ReactElement {
  const [
    config,
    {
      open,
      defaultOpen = null,
      onOpenChange,
      disabled = false,
      label,
      render,
      className,
      children,
      onKeyDown,
      onBlur,
      ...rest
    },
  ] = useSlot('SwipeActions.Root', props);
  const group = React.useContext(GroupContext);
  const [inner, setInner] = React.useState<Side | null>(defaultOpen);
  const [message, setMessage] = React.useState('');
  const controlled = open !== undefined;
  const current = controlled ? open : inner;
  const sayHere = React.useCallback((m: string) => {
    setMessage('');
    window.setTimeout(() => setMessage(m), 30);
  }, []);
  const latest: Latest = {
    open: current,
    controlled,
    disabled,
    label,
    strings: config.strings,
    group,
    setInner,
    say: group ? group.say : sayHere,
    onOpenChange,
  };
  const [row] = React.useState(() => new RowController(latest));
  // the controller reads props from event handlers and springs, never during render
  React.useLayoutEffect(() => {
    row.update(latest);
  });
  React.useEffect(() => {
    row.mount();
    return () => row.dispose();
  }, [row]);
  React.useLayoutEffect(() => {
    row.sync(current);
  }, [row, current]);
  React.useEffect(() => (current ? row.watch() : undefined), [row, current]);

  const ctx = React.useMemo<RowContextValue>(
    () => ({ row, open: current, disabled, label }),
    [row, current, disabled, label],
  );

  return useRender({
    render,
    ref: row.attach,
    defaultTagName: group ? 'li' : 'div',
    props: {
      ...rest,
      'data-hj-swipe-root': '',
      'data-open': current ?? undefined,
      'data-disabled': flag(disabled),
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(e as React.KeyboardEvent<HTMLDivElement>);
        row.keyDown(e);
      },
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        onBlur?.(e as React.FocusEvent<HTMLDivElement>);
        row.blur(e);
      },
      className: cls(config, 'SwipeActions.Root', 'hj-swipe-actions', className) as
        | string
        | undefined,
      children: (
        <RowContext.Provider value={ctx}>
          {children}
          {group ? null : (
            <span style={VISUALLY_HIDDEN} aria-live="polite">
              {message}
            </span>
          )}
        </RowContext.Provider>
      ),
    },
  });
}

export interface ContentOwnProps {
  /** Render the More button at the end of the row: the twin of every swipe. @default true */
  more?: boolean;
  render?: useRender.RenderProp;
}
export interface ContentProps
  extends ContentOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
}

/**
 * The row itself, on top: follows the finger, and swallows the tap that closes an open row.
 * `render={<a href="…" />}` makes the whole row a link.
 */
export function Content(props: ContentProps): React.ReactElement {
  const [
    config,
    {
      more = true,
      render,
      className,
      children,
      onPointerDown,
      onClickCapture,
      onDragStart,
      ...rest
    },
  ] = useSlot('SwipeActions.Content', props);
  const { row } = useRow('SwipeActions.Content');
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...rest,
      'data-hj-swipe-content': '',
      onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
        onPointerDown?.(e);
        if (!e.defaultPrevented) row.down(e);
      },
      onClickCapture: (e: React.MouseEvent<HTMLDivElement>) => {
        row.click(e);
        if (!e.isPropagationStopped()) onClickCapture?.(e);
      },
      // a dragged link or image would start the browser's own drag and cancel the swipe
      onDragStart: (e: React.DragEvent<HTMLDivElement>) => {
        onDragStart?.(e);
        e.preventDefault();
      },
      className: cls(config, 'SwipeActions.Content', 'hj-swipe-actions-content', className) as
        | string
        | undefined,
      children: more ? (
        <>
          {children}
          <More />
        </>
      ) : (
        children
      ),
    },
  });
}

export interface TrayOwnProps {
  /**
   * A full swipe past the point of no return commits the outermost action (first in Leading,
   * last in Trailing): it takes the whole gap, then fires. @default false
   */
  fullSwipe?: boolean;
  render?: useRender.RenderProp;
}
export interface TrayProps extends TrayOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
}

function TrayPart({ side, slot, ...props }: TrayProps & { side: Side; slot: string }) {
  const [config, { fullSwipe = false, render, className, children, ...rest }] = useSlot(
    slot,
    props,
  );
  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...rest,
      'data-hj-swipe-tray': side,
      'data-side': side,
      'data-full-swipe': flag(fullSwipe),
      className: cls(config, slot, 'hj-swipe-actions-tray', className) as string | undefined,
      children,
    },
  });
  return <SideContext.Provider value={side}>{element}</SideContext.Provider>;
}

/** Actions revealed by swiping toward the end edge (right in LTR). The first is outermost. */
export function Leading(props: TrayProps): React.ReactElement {
  return <TrayPart {...props} side="leading" slot="SwipeActions.Leading" />;
}

/** Actions revealed by swiping toward the start edge (left in LTR). The last is outermost. */
export function Trailing(props: TrayProps): React.ReactElement {
  return <TrayPart {...props} side="trailing" slot="SwipeActions.Trailing" />;
}

export interface ActionOwnProps {
  /** Runs when chosen: tapped in the tray, picked from More, or committed by a full swipe. */
  onAction?: () => void;
  /** The tint behind the glyph and verb. Danger stays a tint — never solid. @default 'neutral' */
  tone?: Tone;
  /** An icon name from the adapter (`'check'`) or an `<svg>` on a 24 grid. */
  icon?: IconName | React.ReactNode;
  /**
   * The action takes the row away (archive, delete): the row slides out and fades before
   * `onAction` fires, so drop the item from state right there. @default false
   */
  removes?: boolean;
  /** Said after a full swipe commits this action. `''` says nothing. Default: `HanjiStrings.swipeActionDone`. */
  announce?: string;
  render?: useRender.RenderProp;
}
export interface ActionProps
  extends ActionOwnProps, Omit<React.ComponentProps<'button'>, 'className'> {
  className?: string;
}

/**
 * One action: a real button under the row, glyph over verb. Out of the tab order while its side
 * is closed; focusing it (a screen reader can) opens its side.
 */
export function Action(props: ActionProps): React.ReactElement {
  const [
    config,
    {
      onAction,
      tone = 'neutral',
      icon,
      removes = false,
      announce,
      render,
      className,
      children,
      disabled = false,
      onClick,
      onFocus,
      ...rest
    },
  ] = useSlot('SwipeActions.Action', props);
  const { row, open, disabled: rowDisabled } = useRow('SwipeActions.Action');
  const side = React.useContext(SideContext);
  const id = React.useId();
  const glyph: React.ReactNode =
    typeof icon === 'string' && icon in config.icons ? config.icons[icon as IconName] : icon;
  const entry = React.useRef<Entry>({
    onAction,
    removes,
    announce,
    tone,
    icon: glyph,
    label: children,
  });
  React.useLayoutEffect(() => {
    entry.current = { onAction, removes, announce, tone, icon: glyph, label: children };
  });
  React.useLayoutEffect(() => row.register(id, entry), [row, id]);
  const styled = !config.unstyled;
  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      tabIndex: side && open === side ? 0 : -1,
      ...rest,
      disabled: disabled || rowDisabled,
      'data-hj-swipe-action': id,
      'data-tone': tone,
      'data-removes': flag(removes),
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) row.run(id, 'tap');
      },
      onFocus: (e: React.FocusEvent<HTMLButtonElement>) => {
        onFocus?.(e);
        if (side) row.reveal(side, 'focus');
      },
      className: cls(config, 'SwipeActions.Action', 'hj-swipe-actions-action', className) as
        | string
        | undefined,
      children: (
        <>
          <span
            data-hj-swipe-fill=""
            className={styled ? 'hj-swipe-actions-fill' : undefined}
            aria-hidden="true"
          />
          <span data-hj-swipe-label="" className={styled ? 'hj-swipe-actions-label' : undefined}>
            {glyph ? (
              <span className={styled ? 'hj-swipe-actions-glyph' : undefined} aria-hidden="true">
                {glyph}
              </span>
            ) : null}
            <span className={styled ? 'hj-swipe-actions-verb' : undefined}>{children}</span>
          </span>
        </>
      ),
    },
  });
}

export interface MoreProps extends Omit<React.ComponentProps<typeof Menu.Trigger>, 'children'> {
  /** Replace the ⋯ glyph. */
  children?: React.ReactNode;
}

/**
 * The row's every action in a menu — the keyboard, mouse and screen-reader twin of the swipe.
 * Content renders one at its end; set `more={false}` there to place your own. Shows on hover
 * and focus where there is a pointer that hovers, and only on focus on touch screens.
 */
export function More(props: MoreProps): React.ReactElement {
  const [config, { className, children, disabled, onPointerDown, onMouseDown, ...rest }] = useSlot(
    'SwipeActions.More',
    props,
  );
  const { row, disabled: rowDisabled, label } = useRow('SwipeActions.More');
  const [items, setItems] = React.useState<MenuEntry[]>([]);
  const name = label ? config.strings.moreActionsFor(label) : config.strings.moreActions;
  return (
    <Menu.Root
      onOpenChange={(isOpen) => {
        if (isOpen) setItems(row.items());
      }}
    >
      <Menu.Trigger
        aria-label={name}
        {...rest}
        // A menu opens on press, but a press on the row's end is as likely the start of a swipe:
        // open on the click instead, which the row swallows when the press became a drag.
        onPointerDown={(e) => {
          onPointerDown?.(e);
          e.preventBaseUIHandler();
        }}
        onMouseDown={(e) => {
          onMouseDown?.(e);
          e.preventBaseUIHandler();
        }}
        disabled={disabled || rowDisabled}
        data-hj-swipe-more=""
        className={cls(config, 'SwipeActions.More', 'hj-swipe-actions-more', className)}
      >
        {children ?? config.icons.more}
      </Menu.Trigger>
      <Menu.Content align="end">
        {items.map((it) => (
          <Menu.Item
            key={it.id}
            tone={it.tone === 'danger' ? 'danger' : 'default'}
            disabled={it.disabled}
            onClick={() => row.run(it.id, 'menu')}
          >
            {it.icon ? (
              <span className={config.unstyled ? undefined : 'hj-icon'} aria-hidden="true">
                {it.icon}
              </span>
            ) : null}
            {it.label}
          </Menu.Item>
        ))}
      </Menu.Content>
    </Menu.Root>
  );
}
