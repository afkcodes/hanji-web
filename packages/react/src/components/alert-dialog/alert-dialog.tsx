'use client';
import { AlertDialog as Base } from '@base-ui/react/alert-dialog';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';

export const Root: typeof Base.Root = Base.Root;
export const Trigger: HanjiPart<typeof Base.Trigger> = part(
  Base.Trigger,
  'AlertDialog.Trigger',
  'hj-alert-dialog-trigger',
);
export const Backdrop: HanjiPart<typeof Base.Backdrop> = part(
  Base.Backdrop,
  'AlertDialog.Backdrop',
  'hj-alert-dialog-backdrop',
);
export const Title: HanjiPart<typeof Base.Title> = part(
  Base.Title,
  'AlertDialog.Title',
  'hj-alert-dialog-title',
);
export const Description: HanjiPart<typeof Base.Description> = part(
  Base.Description,
  'AlertDialog.Description',
  'hj-alert-dialog-description',
);
/** Closes. Use with `render={<Button … />}` for each of the (at most two) choices. */
export const Close: HanjiPart<typeof Base.Close> = part(
  Base.Close,
  'AlertDialog.Close',
  'hj-alert-dialog-close',
);
/** Footer row: the safe choice first, the consequence last. Never more than two. */
export const Actions: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'AlertDialog.Actions',
  'hj-alert-dialog-actions',
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

export interface PopupOwnProps {
  /** Width: sm 380 (hanji), md 480. */
  size?: 'sm' | 'md';
  /** danger leads with the alert glyph in a danger tint, so the consequence is never colour alone. */
  tone?: 'default' | 'danger';
}
export interface PopupProps extends PopupOwnProps, Base.Popup.Props {}

/** The surface. An alert dialog has no corner ✕ and ignores outside presses: it must be answered. */
export function Popup(props: PopupProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    size = 'sm',
    tone = 'default',
    className,
    children,
    ...rest
  } = withDefaults(config, 'AlertDialog.Popup', props);
  return (
    <Base.Popup
      {...rest}
      data-size={size}
      data-tone={tone === 'default' ? undefined : tone}
      className={cls(config, 'AlertDialog.Popup', 'hj-alert-dialog-popup', className)}
    >
      {tone === 'danger' ? (
        <span className={config.unstyled ? undefined : 'hj-alert-dialog-glyph'} aria-hidden="true">
          {config.icons.alert}
        </span>
      ) : null}
      {children}
    </Base.Popup>
  );
}

export interface ContentOwnProps {
  container?: Base.Portal.Props['container'];
  keepMounted?: boolean;
}
export interface ContentProps extends ContentOwnProps, PopupProps {}

/** Shorthand for Portal + Backdrop + Popup. */
export function Content({ container, keepMounted, ...popup }: ContentProps): React.ReactElement {
  return (
    <Portal container={container} keepMounted={keepMounted}>
      <Backdrop />
      <Popup {...popup} />
    </Portal>
  );
}
