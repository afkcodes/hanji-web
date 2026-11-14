'use client';
import { Drawer as Base } from '@base-ui/react/drawer';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { elementPart, part } from '../../system/part.tsx';
import type { ElementPartProps, HanjiPart } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';

export type Side = 'bottom' | 'top' | 'left' | 'right';
const SWIPE: Readonly<Record<Side, 'down' | 'up' | 'left' | 'right'>> = {
  bottom: 'down',
  top: 'up',
  left: 'left',
  right: 'right',
};

interface SheetState {
  side: Side;
  /** The entrance has finished; heavy content may mount. */
  entered: boolean;
}
const SheetContext = React.createContext<SheetState>({ side: 'bottom', entered: true });

export interface RootOwnProps {
  /** Edge the sheet lives on; swiping toward it dismisses. @default 'bottom' */
  side?: Side;
}
export interface RootProps extends RootOwnProps, Omit<Base.Root.Props, 'swipeDirection'> {}

/** State owner: open, snap points (detents), modal. Swipe to dismiss comes with it. */
export function Root(props: RootProps): React.ReactElement {
  const { side = 'bottom', onOpenChange, onOpenChangeComplete, ...rest } = props;
  const [entered, setEntered] = React.useState(false);
  const ctx = React.useMemo<SheetState>(() => ({ side, entered }), [side, entered]);
  return (
    <SheetContext.Provider value={ctx}>
      <Base.Root
        {...rest}
        swipeDirection={SWIPE[side]}
        onOpenChange={(open, details) => {
          if (!open) setEntered(false);
          onOpenChange?.(open, details);
        }}
        onOpenChangeComplete={(open) => {
          setEntered(open);
          onOpenChangeComplete?.(open);
        }}
      />
    </SheetContext.Provider>
  );
}

export const Trigger: HanjiPart<typeof Base.Trigger> = part(
  Base.Trigger,
  'Sheet.Trigger',
  'hj-sheet-trigger',
);
export const Backdrop: HanjiPart<typeof Base.Backdrop> = part(
  Base.Backdrop,
  'Sheet.Backdrop',
  'hj-sheet-backdrop',
);
export const Title: HanjiPart<typeof Base.Title> = part(
  Base.Title,
  'Sheet.Title',
  'hj-sheet-title',
);
export const Description: HanjiPart<typeof Base.Description> = part(
  Base.Description,
  'Sheet.Description',
  'hj-sheet-description',
);
/** An edge strip that opens the sheet with a swipe (for side sheets on touch). */
export const SwipeArea: HanjiPart<typeof Base.SwipeArea> = part(
  Base.SwipeArea,
  'Sheet.SwipeArea',
  'hj-sheet-swipe-area',
);
/** The grab bar. Decorative: the whole sheet can be swiped. */
export const Handle: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Sheet.Handle',
  'hj-sheet-handle',
);
/** Title row: title, description and the corner ✕. */
export const Header: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Sheet.Header',
  'hj-sheet-header',
);
/** Pinned action row at the bottom of the sheet. */
export const Footer: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'Sheet.Footer',
  'hj-sheet-footer',
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

/** Lays the sheet against its edge, 8px in (hanji edge inset). */
export function Viewport(props: Base.Viewport.Props): React.ReactElement {
  const config = useHanjiConfig();
  const { side } = React.useContext(SheetContext);
  const { className, ...rest } = withDefaults(config, 'Sheet.Viewport', props);
  return (
    <Base.Viewport
      {...rest}
      data-side={side}
      className={cls(config, 'Sheet.Viewport', 'hj-sheet-viewport', className)}
    />
  );
}

export interface PopupOwnProps {
  /** Width of side sheets (sm 320, md 400, lg 520) or max width of bottom/top sheets (sm 420, md 560, lg 720). */
  size?: 'sm' | 'md' | 'lg';
}
export interface PopupProps extends PopupOwnProps, Base.Popup.Props {}

/** The sheet: surface-2, hairline, radius xl. Follows the finger, settles on gentle. */
export function Popup(props: PopupProps): React.ReactElement {
  const config = useHanjiConfig();
  const { side } = React.useContext(SheetContext);
  const { size = 'md', className, ...rest } = withDefaults(config, 'Sheet.Popup', props);
  return (
    <Base.Popup
      {...rest}
      data-side={side}
      data-size={size}
      className={cls(config, 'Sheet.Popup', 'hj-sheet-popup', className)}
    />
  );
}

export interface BodyOwnProps {
  /**
   * Mount children only after the entrance has landed, holding the room with quiet lines.
   * Use for heavy lists: mounting during an entrance is a jerk (hanji PRINCIPLES §12).
   */
  defer?: boolean;
  /** What to show while deferred. Defaults to three quiet lines. */
  placeholder?: React.ReactNode;
}
export interface BodyProps extends BodyOwnProps, Base.Content.Props {}

/** The scrolling content area. */
export function Body(props: BodyProps): React.ReactElement {
  const config = useHanjiConfig();
  const { entered } = React.useContext(SheetContext);
  const {
    defer = false,
    placeholder,
    className,
    children,
    ...rest
  } = withDefaults(config, 'Sheet.Body', props);
  const show = !defer || entered;
  return (
    <Base.Content
      {...rest}
      data-pending={flag(!show)}
      aria-busy={show ? undefined : true}
      className={cls(config, 'Sheet.Body', 'hj-sheet-body', className)}
    >
      {show
        ? children
        : (placeholder ?? (
            <span
              className={config.unstyled ? undefined : 'hj-sheet-placeholder'}
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
            </span>
          ))}
    </Base.Content>
  );
}

export interface CloseOwnProps {
  /** Render the corner ✕ icon button. Defaults to true when the Close has no children. */
  icon?: boolean;
}
export interface CloseProps extends CloseOwnProps, Base.Close.Props {}

/** Closes. With no children it renders the corner ✕ with an accessible label. */
export function Close(props: CloseProps): React.ReactElement {
  const config = useHanjiConfig();
  const { icon, className, children, ...rest } = withDefaults(config, 'Sheet.Close', props);
  const asIcon = icon ?? children === undefined;
  return (
    <Base.Close
      aria-label={asIcon ? config.strings.close : undefined}
      {...rest}
      data-icon={flag(asIcon)}
      className={cls(config, 'Sheet.Close', 'hj-sheet-close', className)}
    >
      {asIcon ? config.icons.x : children}
    </Base.Close>
  );
}

export interface ContentOwnProps {
  /** Draw the scrim. @default true */
  backdrop?: boolean;
  /** Draw the grab bar. @default true for bottom and top sheets */
  handle?: boolean;
  container?: Base.Portal.Props['container'];
  keepMounted?: boolean;
}
export interface ContentProps extends ContentOwnProps, PopupProps {}

/** Shorthand for Portal + Backdrop + Viewport + Popup (+ Handle). */
export function Content(props: ContentProps): React.ReactElement {
  const config = useHanjiConfig();
  const { side } = React.useContext(SheetContext);
  const {
    backdrop = true,
    handle,
    container,
    keepMounted,
    children,
    ...popup
  } = withDefaults(config, 'Sheet.Content', props);
  const showHandle = handle ?? (side === 'bottom' || side === 'top');
  return (
    <Portal container={container} keepMounted={keepMounted}>
      {backdrop ? <Backdrop /> : null}
      <Viewport>
        <Popup {...popup}>
          {showHandle && side === 'bottom' ? <Handle aria-hidden="true" /> : null}
          {children}
          {showHandle && side === 'top' ? <Handle aria-hidden="true" /> : null}
        </Popup>
      </Viewport>
    </Portal>
  );
}
