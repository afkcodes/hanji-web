'use client';
import { Tooltip as Base } from '@base-ui/react/tooltip';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';

/** hanji waits half a second before explaining: long enough to never flash, short enough to help. */
const HANJI_DELAY = 500;

export const Root: typeof Base.Root = Base.Root;
export const Positioner: HanjiPart<typeof Base.Positioner> = part(
  Base.Positioner,
  'Tooltip.Positioner',
  'hj-tooltip-positioner',
);
export const Popup: HanjiPart<typeof Base.Popup> = part(
  Base.Popup,
  'Tooltip.Popup',
  'hj-tooltip-popup',
);
export const Arrow: HanjiPart<typeof Base.Arrow> = part(
  Base.Arrow,
  'Tooltip.Arrow',
  'hj-tooltip-arrow',
);
export const Viewport: HanjiPart<typeof Base.Viewport> = part(
  Base.Viewport,
  'Tooltip.Viewport',
  'hj-tooltip-viewport',
);
export const createHandle: typeof Base.createHandle = Base.createHandle;

const TriggerPart = part(Base.Trigger, 'Tooltip.Trigger', 'hj-tooltip-trigger');

/** The element being explained. Opens after 500 ms of hover or on keyboard focus. */
export function Trigger({ delay = HANJI_DELAY, ...props }: Base.Trigger.Props): React.ReactElement {
  return <TriggerPart delay={delay} {...props} />;
}

/**
 * Groups tooltips so moving between them opens the next instantly instead of waiting again.
 * Wrap a toolbar or the whole app.
 */
export function Provider({
  delay = HANJI_DELAY,
  ...props
}: Base.Provider.Props): React.ReactElement {
  return <Base.Provider delay={delay} {...props} />;
}

/** Portals to `<body>` but keeps the nearest `<Theme>`. */
export function Portal({ children, ...props }: Base.Portal.Props): React.ReactElement {
  return (
    <Base.Portal {...props}>
      <ThemeScope>{children}</ThemeScope>
    </Base.Portal>
  );
}

export interface ContentOwnProps {
  side?: Base.Positioner.Props['side'];
  align?: Base.Positioner.Props['align'];
  /** Gap from the anchor in px. @default 8 */
  sideOffset?: Base.Positioner.Props['sideOffset'];
  /** Draw the arrow. @default true */
  arrow?: boolean;
  container?: Base.Portal.Props['container'];
}
export interface ContentProps extends ContentOwnProps, Base.Popup.Props {}

/** Shorthand for Portal + Positioner + Popup + Arrow. */
export function Content(props: ContentProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    side = 'top',
    align,
    sideOffset = 8,
    arrow = true,
    container,
    children,
    ...popup
  } = withDefaults(config, 'Tooltip.Content', props);
  return (
    <Portal container={container}>
      <Positioner side={side} align={align} sideOffset={sideOffset} collisionPadding={8}>
        <Popup {...popup}>
          {arrow ? <Arrow /> : null}
          {children}
        </Popup>
      </Positioner>
    </Portal>
  );
}

export interface HintOwnProps {
  /** The tooltip text. */
  label: React.ReactNode;
  /** The one element to explain. It must accept a ref and spread props. */
  children: React.ReactElement;
  side?: Base.Positioner.Props['side'];
  delay?: number;
  disabled?: boolean;
}

/**
 * One-line tooltip: `<Tooltip.Hint label="Copy link"><Button iconOnly … /></Tooltip.Hint>`.
 * The label is supplementary — icon-only controls still need their own `aria-label`.
 */
export function Hint({ label, children, side, delay, disabled }: HintOwnProps): React.ReactElement {
  return (
    <Root disabled={disabled}>
      <Trigger delay={delay} render={children} />
      <Content side={side}>{label}</Content>
    </Root>
  );
}
