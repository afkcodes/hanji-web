'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { cls, withDefaults } from '../../system/slot.ts';

/** Where a step stands relative to the current one. */
export type StepState = 'complete' | 'current' | 'upcoming';

interface StepsContextValue {
  value: number;
  total: number;
}
const StepsContext = React.createContext<StepsContextValue>({ value: 0, total: 0 });
const IndexContext = React.createContext(0);

const stateOf = (index: number, value: number): StepState =>
  index < value ? 'complete' : index === value ? 'current' : 'upcoming';

export interface RootOwnProps {
  /** The current step, 0-based. Equal to `total` when every step is done. */
  value: number;
  /** How many steps there are. */
  total: number;
}
export interface RootProps extends RootOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
  render?: useRender.RenderProp;
}

/** Progress through a short, ordered task: onboarding, checkout, an export. */
export function Root(props: RootProps): React.ReactElement {
  const config = useHanjiConfig();
  const { value, total, render, className, ...rest } = withDefaults(config, 'Steps.Root', props);
  const v = Math.min(Math.max(0, value), total);
  const ctx = React.useMemo<StepsContextValue>(() => ({ value: v, total }), [v, total]);
  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'group',
      ...rest,
      'data-complete': v >= total ? '' : undefined,
      className: cls(config, 'Steps.Root', 'hj-steps-root', className) as string | undefined,
    },
  });
  return <StepsContext.Provider value={ctx}>{element}</StepsContext.Provider>;
}

export interface TrackOwnProps {
  /** Accessible text for the progress bar. @default (value, total) => `Step ${value + 1} of ${total}` */
  valueText?: (value: number, total: number) => string;
}
export interface TrackProps extends TrackOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
}

/**
 * One segment per step, over a visually hidden native <progress>. A segment fills — by scaleX, on a settled spring — when its step is
 * reached, so moving on fills exactly one segment.
 */
export function Track(props: TrackProps): React.ReactElement {
  const config = useHanjiConfig();
  const { value, total } = React.useContext(StepsContext);
  const {
    valueText = (v: number, t: number) =>
      v >= t ? config.strings.allStepsDone(t) : config.strings.stepOf(v + 1, t),
    className,
    ...rest
  } = withDefaults(config, 'Steps.Track', props);
  const styled = !config.unstyled;
  return (
    <div
      {...rest}
      className={cls(config, 'Steps.Track', 'hj-steps-track', className) as string | undefined}
    >
      {/* Native semantics for assistive tech; the segments below are the drawing. */}
      <progress
        className="hj-sr-only"
        max={total}
        value={Math.min(value + 1, total)}
        aria-valuetext={valueText(value, total)}
      />
      {Array.from({ length: total }, (_, i) => (
        <span
          key={`segment-${i + 1}`}
          aria-hidden="true"
          className={styled ? 'hj-steps-segment' : undefined}
          data-state={stateOf(i, value)}
        >
          <span className={styled ? 'hj-steps-fill' : undefined} />
        </span>
      ))}
    </div>
  );
}

export interface ListProps extends Omit<React.ComponentProps<'ol'>, 'className'> {
  className?: string;
}

/** The step labels, aligned to the Track's segments. Children are Steps.Item. */
export function List(props: ListProps): React.ReactElement {
  const config = useHanjiConfig();
  const { className, children, ...rest } = withDefaults(config, 'Steps.List', props);
  const items = React.Children.toArray(children).filter(React.isValidElement);
  return (
    <ol
      {...rest}
      className={cls(config, 'Steps.List', 'hj-steps-list', className) as string | undefined}
    >
      {items.map((child, i) => (
        <IndexContext.Provider key={child.key ?? i} value={i}>
          {child}
        </IndexContext.Provider>
      ))}
    </ol>
  );
}

export interface ItemOwnProps {
  /** A short line under the label. */
  description?: React.ReactNode;
}
export interface ItemProps extends ItemOwnProps, Omit<React.ComponentProps<'li'>, 'className'> {
  className?: string;
}

/** One step: a marker (number, or a check once done), its label and an optional description. */
export function Item(props: ItemProps): React.ReactElement {
  const config = useHanjiConfig();
  const { value } = React.useContext(StepsContext);
  const index = React.useContext(IndexContext);
  const { description, className, children, ...rest } = withDefaults(config, 'Steps.Item', props);
  const state = stateOf(index, value);
  const styled = !config.unstyled;
  return (
    <li
      {...rest}
      aria-current={state === 'current' ? 'step' : undefined}
      data-state={state}
      className={cls(config, 'Steps.Item', 'hj-steps-item', className) as string | undefined}
    >
      <span className={styled ? 'hj-steps-marker' : undefined} aria-hidden="true">
        {state === 'complete' ? config.icons.check : index + 1}
      </span>
      <span className={styled ? 'hj-steps-text' : undefined}>
        <span className={styled ? 'hj-steps-label' : undefined}>{children}</span>
        {description ? (
          <span className={styled ? 'hj-steps-description' : undefined}>{description}</span>
        ) : null}
        {state === 'complete' ? <span className="hj-sr-only">, done</span> : null}
      </span>
    </li>
  );
}

export interface CountOwnProps {
  /** @default strings.allStepsDone / strings.stepOf — “All 4 steps done”, “Step 2 of 4” */
  format?: (value: number, total: number) => React.ReactNode;
}
export interface CountProps extends CountOwnProps, Omit<React.ComponentProps<'span'>, 'className'> {
  className?: string;
}

/** “Step 2 of 4” — the eyebrow above the track. */
export function Count(props: CountProps): React.ReactElement {
  const config = useHanjiConfig();
  const { value, total } = React.useContext(StepsContext);
  const {
    format = (v: number, t: number) =>
      v >= t ? config.strings.allStepsDone(t) : config.strings.stepOf(v + 1, t),
    className,
    ...rest
  } = withDefaults(config, 'Steps.Count', props);
  return (
    <span
      {...rest}
      className={cls(config, 'Steps.Count', 'hj-steps-count', className) as string | undefined}
    >
      {format(value, total)}
    </span>
  );
}
