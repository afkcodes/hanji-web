'use client';
import { Toast as Base } from '@base-ui/react/toast';
import type {
  ToastManager,
  ToastManagerAddOptions,
  ToastManagerUpdateOptions,
  ToastObject,
} from '@base-ui/react/toast';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { part } from '../../system/part.tsx';
import type { HanjiPart } from '../../system/part.tsx';
import { cls, flag, withDefaults } from '../../system/slot.ts';
import { ThemeScope } from '../../system/theme.tsx';

/** hanji toast timing: 3.2 s to read, +1.8 s when there is an action to reach, never under 1.2 s. */
export const TOAST_MS = 3200;
export const TOAST_ACTION_BONUS_MS = 1800;
export const TOAST_MIN_MS = 1200;
/** At most three toasts at once; older ones step back behind the newest. */
export const TOAST_LIMIT = 3;

export type Tone = 'neutral' | 'success' | 'danger';

export const Root: HanjiPart<typeof Base.Root> = part(Base.Root, 'Toast.Root', 'hj-toast');
export const Content: HanjiPart<typeof Base.Content> = part(
  Base.Content,
  'Toast.Content',
  'hj-toast-content',
);
export const Title: HanjiPart<typeof Base.Title> = part(
  Base.Title,
  'Toast.Title',
  'hj-toast-title',
);
export const Description: HanjiPart<typeof Base.Description> = part(
  Base.Description,
  'Toast.Description',
  'hj-toast-description',
);
export const Action: HanjiPart<typeof Base.Action> = part(
  Base.Action,
  'Toast.Action',
  'hj-toast-action',
);
export const createToastManager: typeof Base.createToastManager = Base.createToastManager;
export const useToastManager: typeof Base.useToastManager = Base.useToastManager;

/** Holds the queue. Defaults: 3 visible, 3.2 s each. Wrap your app once. */
export function Provider({
  limit = TOAST_LIMIT,
  timeout = TOAST_MS,
  ...props
}: Base.Provider.Props): React.ReactElement {
  return <Base.Provider limit={limit} timeout={timeout} {...props} />;
}

/** Portals to `<body>` but keeps the nearest `<Theme>`. */
export function Portal({ children, ...props }: Base.Portal.Props): React.ReactElement {
  return (
    <Base.Portal {...props}>
      <ThemeScope>{children}</ThemeScope>
    </Base.Portal>
  );
}

export interface CloseOwnProps {
  /** Render the ✕ icon button. Defaults to true when the Close has no children. */
  icon?: boolean;
}
export interface CloseProps extends CloseOwnProps, Base.Close.Props {}

export function Close(props: CloseProps): React.ReactElement {
  const config = useHanjiConfig();
  const { icon, className, children, ...rest } = withDefaults(config, 'Toast.Close', props);
  const asIcon = icon ?? children === undefined;
  return (
    <Base.Close
      aria-label={asIcon ? config.strings.dismiss : undefined}
      {...rest}
      data-icon={flag(asIcon)}
      className={cls(config, 'Toast.Close', 'hj-toast-close', className)}
    >
      {asIcon ? config.icons.x : children}
    </Base.Close>
  );
}

export interface ItemOwnProps {
  /** The toast object from `useToastManager().toasts`. */
  toast: ToastObject<object>;
}

/** hanji's default toast: tone glyph, title, description, an optional action and a dismiss ✕. */
export function Item({ toast }: ItemOwnProps): React.ReactElement {
  const config = useHanjiConfig();
  const styled = !config.unstyled;
  const tone = (toast.type as Tone | undefined) ?? 'neutral';
  const glyph =
    tone === 'success' ? config.icons.checkCircle : tone === 'danger' ? config.icons.xCircle : null;
  return (
    <Root toast={toast} data-tone={tone}>
      <Content>
        {glyph ? (
          <span className={styled ? 'hj-toast-glyph' : undefined} aria-hidden="true">
            {glyph}
          </span>
        ) : null}
        <span className={styled ? 'hj-toast-text' : undefined}>
          <Title />
          <Description />
        </span>
        {toast.actionProps ? <Action /> : null}
        <Close />
      </Content>
    </Root>
  );
}

export interface ViewportOwnProps {
  /** Where the stack sits. @default 'bottom' */
  placement?: 'bottom' | 'bottom-end';
}
export interface ViewportProps extends ViewportOwnProps, Base.Viewport.Props {}

/**
 * The stack, portalled. With no children it renders every queued toast as `Toast.Item`;
 * pass children to render your own.
 */
export function Viewport(props: ViewportProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    placement = 'bottom',
    className,
    children,
    ...rest
  } = withDefaults(config, 'Toast.Viewport', props);
  return (
    <Portal>
      <Base.Viewport
        {...rest}
        data-placement={placement}
        className={cls(config, 'Toast.Viewport', 'hj-toast-viewport', className)}
      >
        {children ?? <List />}
      </Base.Viewport>
    </Portal>
  );
}

function List(): React.ReactElement {
  const { toasts } = Base.useToastManager();
  return (
    <>
      {toasts.map((t) => (
        <Item key={t.id} toast={t} />
      ))}
    </>
  );
}

/** What to say in a toast. */
export interface ShowOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** neutral (no glyph) · success (check) · danger (cross, announced urgently). */
  tone?: Tone;
  /** One action, usually Undo. Adds 1.8 s so there is time to reach it. */
  action?: { label: React.ReactNode; onClick: () => void };
  /** Override the timing in ms; 0 keeps it until dismissed. */
  timeout?: number;
  /** Re-using an id updates that toast in place. */
  id?: string;
  onClose?: () => void;
}

/** The hanji toast API — returned by `useToast()` and `createToaster()`. */
export interface Toaster {
  show(options: ShowOptions): string;
  success(title: React.ReactNode, options?: Omit<ShowOptions, 'title' | 'tone'>): string;
  danger(title: React.ReactNode, options?: Omit<ShowOptions, 'title' | 'tone'>): string;
  update(id: string, options: Partial<ShowOptions>): void;
  close(id?: string): void;
}

function timeoutFor(o: Pick<ShowOptions, 'timeout' | 'action'>): number {
  if (o.timeout !== undefined) return o.timeout === 0 ? 0 : Math.max(TOAST_MIN_MS, o.timeout);
  return TOAST_MS + (o.action ? TOAST_ACTION_BONUS_MS : 0);
}

/** Translate hanji options into Base UI's toast object. */
export function toToastOptions(o: ShowOptions): ToastManagerAddOptions<object> {
  return {
    id: o.id,
    title: o.title,
    description: o.description,
    type: o.tone ?? 'neutral',
    timeout: timeoutFor(o),
    priority: o.tone === 'danger' ? 'high' : 'low',
    onClose: o.onClose,
    actionProps: o.action ? { children: o.action.label, onClick: o.action.onClick } : undefined,
  };
}

function toUpdate(o: Partial<ShowOptions>): ToastManagerUpdateOptions<object> {
  const u: ToastManagerUpdateOptions<object> = {};
  if (o.title !== undefined) u.title = o.title;
  if (o.description !== undefined) u.description = o.description;
  if (o.tone !== undefined) u.type = o.tone;
  if (o.action !== undefined)
    u.actionProps = { children: o.action.label, onClick: o.action.onClick };
  if (o.timeout !== undefined || o.action !== undefined) u.timeout = timeoutFor(o);
  return u;
}

function toaster(m: Pick<ToastManager, 'add' | 'update' | 'close'>): Toaster {
  return {
    show: (o) => m.add(toToastOptions(o)),
    success: (title, o) => m.add(toToastOptions({ ...o, title, tone: 'success' })),
    danger: (title, o) => m.add(toToastOptions({ ...o, title, tone: 'danger' })),
    update: (id, o) => m.update(id, toUpdate(o)),
    close: (id) => m.close(id),
  };
}

/**
 * Show toasts from a component under `Toast.Provider`.
 *
 * @example
 * const toast = useToast();
 * toast.success('Saved offline', { action: { label: 'Undo', onClick: undo } });
 */
export function useToast(): Toaster {
  const m = Base.useToastManager();
  return React.useMemo(() => toaster(m), [m]);
}

/**
 * Show toasts from anywhere (a fetch wrapper, a store). Pass `manager` to `Toast.Provider`.
 *
 * @example
 * export const toast = createToaster();
 * <Toast.Provider toastManager={toast.manager}>…
 * toast.danger('Couldn’t sync 3 tracks');
 */
export function createToaster(): Toaster & { manager: ToastManager } {
  const manager = Base.createToastManager();
  return { manager, ...toaster(manager) };
}
