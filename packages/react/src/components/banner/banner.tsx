'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface BannerState {
  dismiss: () => void;
}
const BannerContext = React.createContext<BannerState>({ dismiss: () => {} });

/* ---------- motion helpers ---------- */

/** Split a computed list at top-level commas (`linear(0, .5, 1)` stays whole). */
function splitList(value: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = '';
  for (const c of value) {
    if (c === '(') depth++;
    else if (c === ')') depth--;
    if (c === ',' && depth === 0) {
      out.push(current.trim());
      current = '';
    } else current += c;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

const toMs = (v: string | undefined): number => {
  const n = Number.parseFloat(v ?? '');
  if (!Number.isFinite(n)) return 0;
  return v?.trim().endsWith('ms') ? n : n * 1000;
};

interface Timing {
  duration: number;
  delay: number;
  easing: string;
}

/** The transition the stylesheet gives `property` on `el` right now. */
function timingOf(el: Element, property: string): Timing {
  const cs = getComputedStyle(el);
  const props = splitList(cs.transitionProperty);
  const i = props.indexOf(property);
  const at = (list: string): string | undefined => {
    const parts = splitList(list);
    return i < 0 ? undefined : parts[i % parts.length];
  };
  return {
    duration: toMs(at(cs.transitionDuration)),
    delay: toMs(at(cs.transitionDelay)),
    easing: at(cs.transitionTimingFunction) ?? 'ease',
  };
}

/** How long every transition on `els` takes to settle. */
function settleMs(els: readonly (Element | null)[]): number {
  let longest = 0;
  for (const el of els) {
    if (!el) continue;
    const cs = getComputedStyle(el);
    const durations = splitList(cs.transitionDuration);
    const delays = splitList(cs.transitionDelay);
    durations.forEach((d, i) => {
      longest = Math.max(longest, toMs(d) + toMs(delays[i % delays.length]));
    });
  }
  return longest;
}

/**
 * A banner in a flex column or grid with a row gap would leave that gap behind when it goes (and
 * bring it back in one jump). Animate the neighbour's margin by the gap, in step with the rows, so
 * the space opens and closes in one motion. Web Animations only — nothing is written to the
 * neighbour's style, and the effect is cancelled the moment the banner settles or unmounts.
 */
interface GapState {
  el: HTMLElement;
  prop: 'marginBlockStart' | 'marginBlockEnd';
  base: number;
  gap: number;
  anim: Animation | null;
  phase: 'enter' | 'exit' | null;
}

function findGap(banner: HTMLElement): GapState | null {
  const parent = banner.parentElement;
  if (!parent || typeof banner.animate !== 'function') return null;
  const ps = getComputedStyle(parent);
  const stacked =
    ps.display.includes('grid') ||
    (ps.display.includes('flex') && ps.flexDirection.startsWith('column'));
  const gap = stacked ? Number.parseFloat(ps.rowGap) : 0;
  if (!(gap > 0)) return null;
  const next = banner.nextElementSibling;
  const el = next ?? banner.previousElementSibling;
  if (!(el instanceof HTMLElement)) return null;
  const cs = getComputedStyle(el);
  if (cs.position === 'absolute' || cs.position === 'fixed' || cs.display === 'none') return null;
  const prop = next ? 'marginBlockStart' : 'marginBlockEnd';
  return { el, prop, base: Number.parseFloat(cs[prop]) || 0, gap, anim: null, phase: null };
}

function runGap(state: GapState, phase: 'enter' | 'exit', t: Timing): void {
  if (state.phase === phase) return;
  const open = state.base;
  const closed = state.base - state.gap;
  // Interrupted mid-flight: carry on from where the margin is now.
  const from = state.anim
    ? Number.parseFloat(getComputedStyle(state.el)[state.prop]) || 0
    : phase === 'enter'
      ? closed
      : open;
  state.anim?.cancel();
  const frames = { [state.prop]: [`${from}px`, `${phase === 'enter' ? open : closed}px`] };
  const options: KeyframeAnimationOptions = {
    duration: t.duration,
    delay: t.delay,
    fill: 'both',
  };
  try {
    state.anim = state.el.animate(frames, { ...options, easing: t.easing });
  } catch {
    state.anim = state.el.animate(frames, options); // an easing this engine can't parse
  }
  state.phase = phase;
}

/* ---------- parts ---------- */

type Status = 'idle' | 'starting' | 'entering' | 'ending';

export interface RootOwnProps {
  /** Glyph and tint. Status is always word + glyph + tint, never colour alone. @default 'neutral' */
  tone?: Tone;
  /** Lead with the tone's glyph. @default true */
  icon?: boolean;
  /** Controlled visibility. Showing and hiding animate either way. */
  open?: boolean;
  /** Uncontrolled initial visibility. @default true */
  defaultOpen?: boolean;
  /** Called as soon as Banner.Dismiss is pressed (the exit then plays). */
  onOpenChange?: (open: boolean) => void;
  /** Called once the banner has finished opening or closing. */
  onOpenChangeComplete?: (open: boolean) => void;
}
export interface RootProps extends RootOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * An inline notice that stays until it is resolved or dismissed: a sync problem, a plan limit,
 * an update. Danger and warning are announced as alerts; the rest as status. Showing opens the
 * space and the notice rises into it; hiding fades it and closes the space, gap included.
 */
export function Root(props: RootProps): React.ReactElement | null {
  const [
    config,
    {
      tone = 'neutral',
      icon = true,
      open: openProp,
      defaultOpen = true,
      onOpenChange,
      onOpenChangeComplete,
      render,
      className,
      children,
      ...rest
    },
  ] = useSlot('Banner.Root', props);
  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = openProp ?? openState;
  const [mounted, setMounted] = React.useState(open);
  const [status, setStatus] = React.useState<Status>('idle');
  // Follow `open` during render (React's “adjust state when a prop changes” pattern).
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      // Re-opened mid-exit: reverse from where it is rather than starting over.
      setStatus(mounted && status === 'ending' ? 'entering' : 'starting');
      setMounted(true);
    } else if (mounted) setStatus('ending');
  }

  const ref = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const gapRef = React.useRef<GapState | null>(null);
  const completeRef = React.useRef(onOpenChangeComplete);
  React.useLayoutEffect(() => {
    completeRef.current = onOpenChangeComplete;
  });

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (status === 'idle' || !el) return;
    if (!gapRef.current) gapRef.current = findGap(el);
    const gap = gapRef.current;
    if (gap)
      runGap(gap, status === 'ending' ? 'exit' : 'enter', timingOf(el, 'grid-template-rows'));

    if (status === 'starting') {
      // Make the browser compute the collapsed starting style now, so dropping it next render
      // starts the transitions. No frame wait: it works in background tabs too.
      void el.offsetHeight;
      let live = true;
      queueMicrotask(() => {
        if (live) setStatus('entering');
      });
      return () => {
        live = false;
      };
    }

    let done = false;
    const finish = (): void => {
      if (done) return;
      done = true;
      if (status === 'ending') {
        setMounted(false);
        setStatus('idle');
      } else {
        gapRef.current?.anim?.cancel();
        gapRef.current = null;
        setStatus('idle');
        completeRef.current?.(true);
      }
    };
    const onEnd = (e: TransitionEvent): void => {
      if (e.target === el && e.propertyName === 'grid-template-rows') finish();
    };
    el.addEventListener('transitionend', onEnd);
    const timer = window.setTimeout(finish, settleMs([el, innerRef.current]) + 80);
    return () => {
      el.removeEventListener('transitionend', onEnd);
      window.clearTimeout(timer);
    };
  }, [status]);

  // Gone: drop the neighbour's margin in the same frame the banner and its gap leave.
  const wasMounted = React.useRef(mounted);
  React.useLayoutEffect(() => {
    if (mounted) {
      wasMounted.current = true;
      return;
    }
    if (!wasMounted.current) return;
    wasMounted.current = false;
    gapRef.current?.anim?.cancel();
    gapRef.current = null;
    completeRef.current?.(false);
  }, [mounted]);

  const dismiss = React.useCallback(() => {
    if (openProp === undefined) setOpenState(false);
    onOpenChange?.(false);
  }, [openProp, onOpenChange]);
  const ctx = React.useMemo(() => ({ dismiss }), [dismiss]);

  const urgent = tone === 'danger' || tone === 'warning';
  const glyph =
    tone === 'success'
      ? config.icons.checkCircle
      : tone === 'danger'
        ? config.icons.xCircle
        : tone === 'warning'
          ? config.icons.alert
          : config.icons.info;
  const s = !config.unstyled;

  const element = useRender({
    render,
    ref,
    defaultTagName: 'div',
    props: {
      role: urgent ? 'alert' : 'status',
      ...rest,
      'data-tone': tone,
      'data-starting-style': status === 'starting' ? '' : undefined,
      'data-ending-style': status === 'ending' ? '' : undefined,
      'data-animating': status === 'idle' ? undefined : '',
      className: cls(config, 'Banner.Root', 'hj-banner', className) as string | undefined,
      children: (
        <div className={s ? 'hj-banner-clip' : undefined}>
          <div ref={innerRef} className={s ? 'hj-banner-inner' : undefined}>
            {icon ? (
              <span className={s ? 'hj-banner-glyph' : undefined} aria-hidden="true">
                {glyph}
              </span>
            ) : null}
            {children}
          </div>
        </div>
      ),
    },
  });
  if (!mounted) return null;
  return <BannerContext.Provider value={ctx}>{element}</BannerContext.Provider>;
}

/** Holds the title and the sentence. */
export const Content: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Banner.Content',
  'hj-banner-content',
);
export const Title: (props: ElementPartProps<'p'>) => React.ReactElement = elementPart(
  'p',
  'Banner.Title',
  'hj-banner-title',
);
export const Description: (props: ElementPartProps<'p'>) => React.ReactElement = elementPart(
  'p',
  'Banner.Description',
  'hj-banner-description',
);
/** One or two actions (render Buttons inside). */
export const Actions: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Banner.Actions',
  'hj-banner-actions',
);

export interface DismissProps extends Omit<React.ComponentProps<'button'>, 'className'> {
  className?: string;
}

/** The ✕. Fades the banner out while the space it held closes. */
export function Dismiss(props: DismissProps): React.ReactElement {
  const config = useHanjiConfig();
  const { dismiss } = React.useContext(BannerContext);
  const { className, onClick, children, ...rest } = withDefaults(config, 'Banner.Dismiss', props);
  return (
    <button
      type="button"
      aria-label={children ? undefined : config.strings.dismiss}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) dismiss();
      }}
      className={
        cls(config, 'Banner.Dismiss', 'hj-banner-dismiss', className) as string | undefined
      }
    >
      {children ?? config.icons.x}
    </button>
  );
}
