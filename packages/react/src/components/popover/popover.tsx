'use client';
import { Popover as Base } from '@base-ui/react/popover';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';

export const Root: typeof Base.Root = Base.Root;
export const Trigger: HanjiPart<typeof Base.Trigger> = part(
  Base.Trigger,
  'Popover.Trigger',
  'hj-popover-trigger',
);
export const Backdrop: HanjiPart<typeof Base.Backdrop> = part(
  Base.Backdrop,
  'Popover.Backdrop',
  'hj-popover-backdrop',
);
export const Positioner: HanjiPart<typeof Base.Positioner> = part(
  Base.Positioner,
  'Popover.Positioner',
  'hj-popover-positioner',
);
export const Popup: HanjiPart<typeof Base.Popup> = part(
  Base.Popup,
  'Popover.Popup',
  'hj-popover-popup',
);
export const Arrow: HanjiPart<typeof Base.Arrow> = part(
  Base.Arrow,
  'Popover.Arrow',
  'hj-popover-arrow',
);
export const Viewport: HanjiPart<typeof Base.Viewport> = part(
  Base.Viewport,
  'Popover.Viewport',
  'hj-popover-viewport',
);
export const Title: HanjiPart<typeof Base.Title> = part(
  Base.Title,
  'Popover.Title',
  'hj-popover-title',
);
export const Description: HanjiPart<typeof Base.Description> = part(
  Base.Description,
  'Popover.Description',
  'hj-popover-description',
);
/** Footer row for a popover that asks something (a small form, a confirm). */
export const Actions: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Popover.Actions',
  'hj-popover-actions',
);
export const createHandle: typeof Base.createHandle = Base.createHandle;

/** Portals to `<body>` but keeps the nearest `<Theme>`. */
export function Portal({ children, ...props }: Base.Portal.Props): React.ReactElement {
  return (
    <Base.Portal {...props}>
      <ThemeScope>{children}</ThemeScope>
    </Base.Portal>
  );
}

export interface CloseOwnProps {
  /** Render the corner ✕ icon button. Defaults to true when the Close has no children. */
  icon?: boolean;
}
export interface CloseProps extends CloseOwnProps, Base.Close.Props {}

/** Closes the popover. With no children it renders the corner ✕ with an accessible label. */
export function Close(props: CloseProps): React.ReactElement {
  const config = useHanjiConfig();
  const { icon, className, children, ...rest } = withDefaults(config, 'Popover.Close', props);
  const asIcon = icon ?? children === undefined;
  return (
    <Base.Close
      aria-label={asIcon ? config.strings.close : undefined}
      {...rest}
      data-icon={flag(asIcon)}
      className={cls(config, 'Popover.Close', 'hj-popover-close', className)}
    >
      {asIcon ? config.icons.x : children}
    </Base.Close>
  );
}

/** Placement for the shorthand Content parts. */
export interface PlacementProps {
  /** Which side of the anchor to open on. */
  side?: Base.Positioner.Props['side'];
  align?: Base.Positioner.Props['align'];
  /** Gap from the anchor in px. @default 6 (hanji menu gap) */
  sideOffset?: Base.Positioner.Props['sideOffset'];
  alignOffset?: Base.Positioner.Props['alignOffset'];
  /** Keep this far from the viewport edge in px. @default 8 */
  collisionPadding?: Base.Positioner.Props['collisionPadding'];
}

export interface ContentOwnProps extends PlacementProps {
  /** Draw the arrow pointing at the anchor. @default false */
  arrow?: boolean;
  /** Where to portal. Defaults to `<body>`. */
  container?: Base.Portal.Props['container'];
  keepMounted?: boolean;
}
export interface ContentProps extends ContentOwnProps, Base.Popup.Props {}

/** Shorthand for Portal + Positioner + Popup (+ Arrow) — the common case in one part. */
export function Content(props: ContentProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    side,
    align,
    sideOffset = 6,
    alignOffset,
    collisionPadding = 8,
    arrow = false,
    container,
    keepMounted,
    children,
    ...popup
  } = withDefaults(config, 'Popover.Content', props);
  return (
    <Portal container={container} keepMounted={keepMounted}>
      <Positioner
        side={side}
        align={align}
        sideOffset={arrow && typeof sideOffset === 'number' ? Math.max(sideOffset, 10) : sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
      >
        <Popup {...popup}>
          {arrow ? <Arrow /> : null}
          {children}
        </Popup>
      </Positioner>
    </Portal>
  );
}
