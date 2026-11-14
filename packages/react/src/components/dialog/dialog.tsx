'use client';
import { Dialog as Base } from '@base-ui/react/dialog';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';

export const Root: typeof Base.Root = Base.Root;
export const Trigger: HanjiPart<typeof Base.Trigger> = part(
  Base.Trigger,
  'Dialog.Trigger',
  'hj-dialog-trigger',
);
export const Backdrop: HanjiPart<typeof Base.Backdrop> = part(
  Base.Backdrop,
  'Dialog.Backdrop',
  'hj-dialog-backdrop',
);
export const Title: HanjiPart<typeof Base.Title> = part(
  Base.Title,
  'Dialog.Title',
  'hj-dialog-title',
);
export const Description: HanjiPart<typeof Base.Description> = part(
  Base.Description,
  'Dialog.Description',
  'hj-dialog-description',
);
/** Footer row. Hold at most two actions; the safe one first, the consequence last. */
export const Actions: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Dialog.Actions',
  'hj-dialog-actions',
);
export const createHandle: typeof Base.createHandle = Base.createHandle;

/** Portals to `<body>` but keeps the nearest `<Theme>`'s paper, accent and density. */
export function Portal({ children, ...props }: Base.Portal.Props): React.ReactElement {
  return (
    <Base.Portal {...props}>
      <ThemeScope>{children}</ThemeScope>
    </Base.Portal>
  );
}

export interface PopupOwnProps {
  /** Width: sm 380 (hanji), md 480, lg 640. */
  size?: 'sm' | 'md' | 'lg';
}
export interface PopupProps extends PopupOwnProps, Base.Popup.Props {}

/** The dialog surface: surface-2 on a black scrim, enters from scale .94 on a settled spring. */
export function Popup(props: PopupProps): React.ReactElement {
  const config = useHanjiConfig();
  const { size = 'sm', className, ...rest } = withDefaults(config, 'Dialog.Popup', props);
  return (
    <Base.Popup
      {...rest}
      data-size={size}
      className={cls(config, 'Dialog.Popup', 'hj-dialog-popup', className)}
    />
  );
}

export interface CloseOwnProps {
  /** Render the corner ✕ icon button. Defaults to true when the Close has no children. */
  icon?: boolean;
}
export interface CloseProps extends CloseOwnProps, Base.Close.Props {}

/** Closes the dialog. With no children it renders the corner ✕ with an accessible label. */
export function Close(props: CloseProps): React.ReactElement {
  const config = useHanjiConfig();
  const { icon, className, children, ...rest } = withDefaults(config, 'Dialog.Close', props);
  const asIcon = icon ?? children === undefined;
  return (
    <Base.Close
      aria-label={asIcon ? config.strings.close : undefined}
      {...rest}
      data-icon={flag(asIcon)}
      className={cls(config, 'Dialog.Close', 'hj-dialog-close', className)}
    >
      {asIcon ? config.icons.x : children}
    </Base.Close>
  );
}

export interface ContentProps extends PopupProps {
  /** Draw the scrim. @default true */
  backdrop?: boolean;
  /** Where to portal. Defaults to `<body>`. */
  container?: Base.Portal.Props['container'];
  keepMounted?: boolean;
}

/** Shorthand for Portal + Backdrop + Popup — the common case in one part. */
export function Content({
  backdrop = true,
  container,
  keepMounted,
  ...popup
}: ContentProps): React.ReactElement {
  return (
    <Portal container={container} keepMounted={keepMounted}>
      {backdrop ? <Backdrop /> : null}
      <Popup {...popup} />
    </Portal>
  );
}
