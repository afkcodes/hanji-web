'use client';
import { Popover as BasePopover } from '@base-ui/react/popover';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import type { HanjiStrings } from '../../system/config.tsx';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';
import { Button } from '../button/button.tsx';

/** What a step points at: a ref, a CSS selector, or a function returning the element. */
export type Target = React.RefObject<Element | null> | string | (() => Element | null);

/** Labels the default footer renders. Override for other languages. */
export interface Labels {
  skip: string;
  done: string;
  next: string;
  back: string;
  /** e.g. (1, 3) → "1 of 3" */
  progress: (step: number, count: number) => string;
}

/** Defaults come from the provider's strings, so one HanjiProvider translates every tour. */
const labelsFrom = (s: HanjiStrings): Labels => ({
  skip: s.skip,
  done: s.done,
  next: s.next,
  back: s.back,
  progress: s.countOf,
});

/** The running tour, from `useCoachMark()`. */
export interface TourState {
  index: number;
  count: number;
  labels: Labels;
  next: () => void;
  back: () => void;
  skip: () => void;
}
const TourContext = React.createContext<TourState | null>(null);

function resolve(target: Target): Element | null {
  if (typeof document === 'undefined') return null;
  if (typeof target === 'string') return document.querySelector(target);
  if (typeof target === 'function') return target();
  return target.current;
}

export interface RootOwnProps {
  /** Controlled: the tour is running. */
  open?: boolean;
  defaultOpen?: boolean;
  /** Called with false when the tour is finished or skipped. */
  onOpenChange?: (open: boolean, reason: 'finish' | 'skip') => void;
  /** Controlled step index. */
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** Footer labels (Skip, Done, Next, Back, “1 of 3”). */
  labels?: Partial<Labels>;
  /** CoachMark.Step children, in order. */
  children?: React.ReactNode;
}

/**
 * A short product tour: one step at a time, each pointing at a real control with a spotlight
 * and a bubble. Keep it to three steps; every step can be skipped.
 */
export function Root(props: RootOwnProps): React.ReactElement | null {
  const {
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    step: stepProp,
    defaultStep = 0,
    onStepChange,
    labels: labelsProp,
    children,
  } = props;
  const strings = useHanjiConfig().strings;
  const labels = React.useMemo(
    () => ({ ...labelsFrom(strings), ...labelsProp }),
    [strings, labelsProp],
  );
  const [openState, setOpenState] = React.useState(defaultOpen);
  const [stepState, setStepState] = React.useState(defaultStep);
  const open = openProp ?? openState;
  const index = stepProp ?? stepState;
  const steps = React.Children.toArray(children).filter(React.isValidElement);
  const count = steps.length;

  const close = React.useCallback(
    (reason: 'finish' | 'skip') => {
      setOpenState(false);
      setStepState(0);
      onOpenChange?.(false, reason);
    },
    [onOpenChange],
  );
  const go = React.useCallback(
    (i: number) => {
      setStepState(i);
      onStepChange?.(i);
    },
    [onStepChange],
  );
  const ctx = React.useMemo<TourState>(
    () => ({
      index,
      count,
      labels,
      next: () => (index + 1 >= count ? close('finish') : go(index + 1)),
      back: () => go(Math.max(0, index - 1)),
      skip: () => close('skip'),
    }),
    [index, count, labels, close, go],
  );
  if (!open || count === 0) return null;
  return (
    <TourContext.Provider value={ctx}>{steps[Math.min(index, count - 1)]}</TourContext.Provider>
  );
}

export interface StepOwnProps {
  /** The control this step explains. If it can't be found, the bubble shows centred, unanchored. */
  target: Target;
  /** Side of the target for the bubble. @default 'bottom' */
  side?: BasePopover.Positioner.Props['side'];
  /** Space around the target inside the spotlight, in px. @default 6 */
  padding?: number;
  /** Render the default footer (progress, Skip, Back, Next/Done). @default true */
  footer?: boolean;
  children?: React.ReactNode;
}

function useRect(el: Element | null): DOMRect | null {
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  React.useLayoutEffect(() => {
    let raf = 0;
    const read = (): void => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setRect(el ? el.getBoundingClientRect() : null));
    };
    el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    read();
    addEventListener('resize', read);
    addEventListener('scroll', read, true);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', read);
      removeEventListener('scroll', read, true);
    };
  }, [el]);
  return rect;
}

/** One stop on the tour. Children: CoachMark.Title, CoachMark.Description, anything else. */
export function Step(props: StepOwnProps): React.ReactElement {
  const config = useHanjiConfig();
  const tour = React.useContext(TourContext);
  const {
    target,
    side = 'bottom',
    padding = 6,
    footer = true,
    children,
  } = withDefaults(config, 'CoachMark.Step', props);
  // undefined = still looking (render no bubble yet, so the centred fallback never flashes)
  const [el, setEl] = React.useState<Element | null | undefined>(undefined);
  React.useLayoutEffect(() => {
    // targets belong to other components; read them once this frame has committed
    const raf = requestAnimationFrame(() => setEl(resolve(target)));
    return () => cancelAnimationFrame(raf);
  }, [target]);
  const rect = useRect(el ?? null);
  const styled = !config.unstyled;
  const index = tour?.index ?? 0;
  const count = tour?.count ?? 1;
  const last = index + 1 >= count;
  const labels = tour?.labels ?? labelsFrom(config.strings);

  const spot = React.useMemo<React.CSSProperties | undefined>(
    () =>
      rect
        ? {
            left: rect.left - padding,
            top: rect.top - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          }
        : undefined,
    [rect, padding],
  );

  const body = (
    <>
      {children}
      {footer ? (
        <div className={styled ? 'hj-coach-mark-footer' : undefined}>
          <span className={styled ? 'hj-coach-mark-progress' : undefined} aria-live="polite">
            {labels.progress(index + 1, count)}
          </span>
          <span className={styled ? 'hj-coach-mark-spacer' : undefined} />
          {last ? null : (
            <Button size="sm" variant="quiet" onClick={tour?.skip}>
              {labels.skip}
            </Button>
          )}
          {index > 0 ? (
            <Button size="sm" variant="secondary" onClick={tour?.back}>
              {labels.back}
            </Button>
          ) : null}
          <Button size="sm" onClick={tour?.next}>
            {last ? labels.done : labels.next}
          </Button>
        </div>
      ) : null}
    </>
  );

  return (
    <BasePopover.Root
      open
      modal={false}
      onOpenChange={(open, details) => {
        // only Escape ends the tour; stray clicks never lose the user's place
        if (!open && details.reason === 'escape-key') tour?.skip();
      }}
    >
      <BasePopover.Portal>
        <ThemeScope>
          <div
            className={styled ? 'hj-coach-mark-overlay' : undefined}
            data-anchored={el ? '' : undefined}
            aria-hidden="true"
          >
            {spot ? (
              <div
                key={index}
                className={styled ? 'hj-coach-mark-spotlight' : undefined}
                style={spot}
              />
            ) : null}
          </div>
          {el === undefined ? null : el ? (
            <BasePopover.Positioner
              anchor={el}
              side={side}
              sideOffset={padding + 10}
              collisionPadding={12}
              className={styled ? 'hj-coach-mark-positioner' : undefined}
            >
              <BasePopover.Popup
                className={cls(config, 'CoachMark.Popup', 'hj-coach-mark-popup', undefined)}
              >
                <BasePopover.Arrow className={styled ? 'hj-coach-mark-arrow' : undefined} />
                {body}
              </BasePopover.Popup>
            </BasePopover.Positioner>
          ) : (
            <Centered
              className={
                cls(config, 'CoachMark.Popup', 'hj-coach-mark-popup', undefined) as
                  | string
                  | undefined
              }
              onEscape={tour?.skip}
            >
              {body}
            </Centered>
          )}
        </ThemeScope>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

/** No target on screen: a centred, non-modal dialog that takes focus and answers Escape. */
function Centered({
  className,
  onEscape,
  children,
}: {
  className: string | undefined;
  onEscape: (() => void) | undefined;
  children: React.ReactNode;
}): React.ReactElement {
  const ref = React.useRef<HTMLDialogElement>(null);
  React.useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onEscape?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onEscape]);
  return (
    <dialog ref={ref} open tabIndex={-1} data-centered="" className={className}>
      {children}
    </dialog>
  );
}

export const Title: (props: ElementPartProps<'h2'>) => React.ReactElement = elementPart(
  'h2',
  'CoachMark.Title',
  'hj-coach-mark-title',
);
export const Description: (props: ElementPartProps<'p'>) => React.ReactElement = elementPart(
  'p',
  'CoachMark.Description',
  'hj-coach-mark-description',
);

/** The running tour's controls, for custom footers. */
export function useCoachMark(): TourState | null {
  return React.useContext(TourContext);
}
