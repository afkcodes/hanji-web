'use client';
import { Collapsible as Base } from '@base-ui/react/collapsible';
import * as React from 'react';

import { cls, flag } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';

interface ReasoningContextValue {
  thinking: boolean;
  duration: number | undefined;
}
const ReasoningContext = React.createContext<ReasoningContextValue>({
  thinking: false,
  duration: undefined,
});

/** Props hanji adds to the Root. */
export interface RootOwnProps {
  /** The model is still thinking: the panel is open and the label shimmers. When it turns false the panel collapses. */
  thinking?: boolean;
  /** Seconds spent thinking, for the “Thought for 12 s” label. */
  duration?: number;
}
export interface RootProps extends RootOwnProps, Base.Root.Props {}

/**
 * The model’s visible reasoning: open while it thinks, folded to “Thought for 12 s” when done.
 * Pass `open`/`onOpenChange` to control it yourself.
 */
export function Root(props: RootProps): React.ReactElement {
  const [config, { thinking = false, duration, open: openProp, onOpenChange, className, ...rest }] =
    useSlot('Reasoning.Root', props);
  const [inner, setInner] = React.useState(thinking);
  const [prevThinking, setPrevThinking] = React.useState(thinking);
  // Follow `thinking` (open while it thinks, fold when done) during render — no effect needed.
  if (thinking !== prevThinking) {
    setPrevThinking(thinking);
    setInner(thinking);
  }
  const open = openProp ?? inner;
  const ctx = React.useMemo(() => ({ thinking, duration }), [thinking, duration]);
  return (
    <ReasoningContext.Provider value={ctx}>
      <Base.Root
        {...rest}
        open={open}
        onOpenChange={(next, details) => {
          setInner(next);
          onOpenChange?.(next, details);
        }}
        data-thinking={flag(thinking)}
        className={cls(config, 'Reasoning.Root', 'hj-reasoning', className)}
      />
    </ReasoningContext.Provider>
  );
}

const formatSeconds = (s: number): string =>
  s < 60 ? `${Math.max(1, Math.round(s))} s` : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`;

export interface TriggerOwnProps {
  /** Label while thinking. @default 'Thinking' */
  thinkingLabel?: React.ReactNode;
  /** Label when done. @default “Thought for {duration}” or “Reasoning” */
  doneLabel?: React.ReactNode;
}
export interface TriggerProps extends TriggerOwnProps, Base.Trigger.Props {}

/** “Thinking…” (shimmering) while the model works; “Thought for 12 s” after. Children override. */
export function Trigger(props: TriggerProps): React.ReactElement {
  const [config, { thinkingLabel = 'Thinking', doneLabel, className, children, ...rest }] = useSlot(
    'Reasoning.Trigger',
    props,
  );
  const { thinking, duration } = React.useContext(ReasoningContext);
  const styled = !config.unstyled;
  const label =
    children ??
    (thinking
      ? thinkingLabel
      : (doneLabel ??
        (duration === undefined ? 'Reasoning' : `Thought for ${formatSeconds(duration)}`)));
  return (
    <Base.Trigger
      {...rest}
      className={cls(config, 'Reasoning.Trigger', 'hj-reasoning-trigger', className)}
    >
      <span className={styled ? 'hj-reasoning-glyph' : undefined} aria-hidden="true">
        {config.icons.sparkle}
      </span>
      <span className={styled ? 'hj-reasoning-label' : undefined} data-thinking={flag(thinking)}>
        {label}
      </span>
      <span className={styled ? 'hj-reasoning-chevron' : undefined} aria-hidden="true">
        {config.icons.chevronDown}
      </span>
    </Base.Trigger>
  );
}

/** The reasoning text: smaller, muted, behind a hairline rule. */
export function Panel(props: Base.Panel.Props): React.ReactElement {
  const [config, { className, children, ...rest }] = useSlot('Reasoning.Panel', props);
  const { thinking } = React.useContext(ReasoningContext);
  return (
    <Base.Panel
      {...rest}
      aria-busy={thinking || undefined}
      className={cls(config, 'Reasoning.Panel', 'hj-reasoning-panel', className)}
    >
      <div className={config.unstyled ? undefined : 'hj-reasoning-body'}>{children}</div>
    </Base.Panel>
  );
}
