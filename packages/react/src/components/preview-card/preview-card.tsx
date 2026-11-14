'use client';
import { PreviewCard as Base } from '@base-ui/react/preview-card';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';

export const Root: typeof Base.Root = Base.Root;
/** A link that previews where it goes on hover or focus. Renders an `<a>`. */
export const Trigger: HanjiPart<typeof Base.Trigger> = part(
  Base.Trigger,
  'PreviewCard.Trigger',
  'hj-preview-card-trigger',
);
export const Positioner: HanjiPart<typeof Base.Positioner> = part(
  Base.Positioner,
  'PreviewCard.Positioner',
  'hj-preview-card-positioner',
);
export const Popup: HanjiPart<typeof Base.Popup> = part(
  Base.Popup,
  'PreviewCard.Popup',
  'hj-preview-card-popup',
);
export const Arrow: HanjiPart<typeof Base.Arrow> = part(
  Base.Arrow,
  'PreviewCard.Arrow',
  'hj-preview-card-arrow',
);
export const Backdrop: HanjiPart<typeof Base.Backdrop> = part(
  Base.Backdrop,
  'PreviewCard.Backdrop',
  'hj-preview-card-backdrop',
);
export const Viewport: HanjiPart<typeof Base.Viewport> = part(
  Base.Viewport,
  'PreviewCard.Viewport',
  'hj-preview-card-viewport',
);
/** Full-bleed image or art at the top of the card. */
export const Media: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'PreviewCard.Media',
  'hj-preview-card-media',
);
/** The padded text area under the media. */
export const Body: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'PreviewCard.Body',
  'hj-preview-card-body',
);
export const Title: (props: ElementPartProps<'p'>) => React.ReactElement = elementPart(
  'p',
  'PreviewCard.Title',
  'hj-preview-card-title',
);
export const Description: (props: ElementPartProps<'p'>) => React.ReactElement = elementPart(
  'p',
  'PreviewCard.Description',
  'hj-preview-card-description',
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

export interface ContentOwnProps {
  side?: Base.Positioner.Props['side'];
  align?: Base.Positioner.Props['align'];
  /** Gap from the link in px. @default 8 */
  sideOffset?: Base.Positioner.Props['sideOffset'];
  /** Draw the arrow. @default false */
  arrow?: boolean;
  container?: Base.Portal.Props['container'];
}
export interface ContentProps extends ContentOwnProps, Base.Popup.Props {}

/** Shorthand for Portal + Positioner + Popup (+ Arrow). */
export function Content(props: ContentProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    side = 'bottom',
    align,
    sideOffset = 8,
    arrow = false,
    container,
    children,
    ...popup
  } = withDefaults(config, 'PreviewCard.Content', props);
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
