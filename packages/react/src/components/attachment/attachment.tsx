'use client';
import { Button as BaseButton } from '@base-ui/react/button';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { msVar, useFlip } from '../../system/flip.ts';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';

export type AttachmentKind =
  | 'image'
  | 'pdf'
  | 'audio'
  | 'video'
  | 'code'
  | 'archive'
  | 'text'
  | 'file';
export type AttachmentStatus = 'uploading' | 'ready' | 'error';

const KIND_PATH: Record<AttachmentKind, string> = {
  image:
    'M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5ZM9 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM20 15l-4.5-4.5L6 20',
  pdf: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8ZM14 3v5h5M8.5 13h7M8.5 17h5',
  audio: 'M9 18V6l11-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  video:
    'M4 6.5A1.5 1.5 0 0 1 5.5 5h9A1.5 1.5 0 0 1 16 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 17.5ZM16 10l5-3v10l-5-3',
  code: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8ZM14 3v5h5M10 12l-2 2 2 2M14 12l2 2-2 2',
  archive: 'M4 4h16v4H4ZM5.5 8V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V8M10 12h4',
  text: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8ZM14 3v5h5M8.5 12h7M8.5 16h7',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8ZM14 3v5h5',
};

/** Guess a kind from a file name or MIME type. */
export function kindOf(nameOrType: string): AttachmentKind {
  const s = nameOrType.toLowerCase();
  if (/^image\/|\.(png|jpe?g|gif|webp|avif|heic|svg)$/.test(s)) return 'image';
  if (s.endsWith('pdf')) return 'pdf';
  if (/^audio\/|\.(mp3|wav|flac|m4a|aac|ogg)$/.test(s)) return 'audio';
  if (/^video\/|\.(mp4|mov|webm|mkv)$/.test(s)) return 'video';
  if (/\.(zip|tar|gz|rar|7z)$/.test(s)) return 'archive';
  if (/\.(tsx?|jsx?|py|rs|go|json|css|html|sh|ya?ml)$/.test(s)) return 'code';
  if (/^text\/|\.(txt|md|csv|rtf)$/.test(s)) return 'text';
  return 'file';
}

/** 1536 → “1.5 KB”. Binary units, one decimal under 10. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${i === 0 || n >= 10 ? Math.round(n) : n.toFixed(1)} ${units[i]}`;
}

interface AttachmentContextValue {
  name: string;
  status: AttachmentStatus;
  /** Fade this attachment out, then run `then` (Remove's onRemove). */
  leave: (then?: () => void) => void;
}
const AttachmentContext = React.createContext<AttachmentContextValue>({
  name: '',
  status: 'ready',
  leave: (then) => then?.(),
});

/** Props hanji adds to the chip. */
export interface RootOwnProps {
  /** The file name — used for the label of Remove and to guess the kind. */
  name: string;
  /** uploading (shows Progress) · ready · error (danger tint; put the reason in Meta). @default 'ready' */
  status?: AttachmentStatus;
  /** Upload progress, 0–1. Without it, uploading shows an indeterminate bar. */
  progress?: number;
  /** File kind for the glyph. Default: guessed from name. */
  kind?: AttachmentKind;
}
export interface RootProps extends RootOwnProps, Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * One attached file: type glyph, name, size or error, remove — with an upload bar under it.
 *
 * @example
 * <Attachment.Root name="setlist.pdf" status="uploading" progress={0.42}>
 *   <Attachment.Icon /><Attachment.Name /><Attachment.Meta>212 KB</Attachment.Meta><Attachment.Remove onClick={remove} />
 *   <Attachment.Progress />
 * </Attachment.Root>
 */
export function Root(props: RootProps): React.ReactElement {
  const [
    config,
    { name, status = 'ready', progress, kind, className, render, style, children, ref, ...rest },
  ] = useSlot('Attachment.Root', props);
  const own = React.useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = React.useState(false);
  const leave = React.useCallback((then?: () => void) => {
    const el = own.current;
    if (!el) {
      then?.();
      return;
    }
    // Hand focus to a neighbour's ✕ before this one goes.
    const all = [
      ...(el.parentElement?.querySelectorAll<HTMLElement>('[data-attachment-remove]') ?? []),
    ];
    const mine = el.querySelector<HTMLElement>('[data-attachment-remove]');
    const i = mine ? all.indexOf(mine) : -1;
    const next = all[i + 1] ?? all[i - 1] ?? null;
    setLeaving(true);
    window.setTimeout(
      () => {
        if (mine && document.activeElement === mine) next?.focus();
        then?.();
      },
      msVar(getComputedStyle(el), '--hj-dur-fast', 180),
    );
  }, []);
  const ctx = React.useMemo(() => ({ name, status, leave }), [name, status, leave]);
  const p = progress === undefined ? undefined : Math.min(1, Math.max(0, progress));
  const merged = React.useMemo(
    () => (p === undefined ? style : ({ ...style, '--_p': String(p) } as React.CSSProperties)),
    [p, style],
  );
  return useRender({
    render,
    ref: ref ? [own, ref] : own,
    defaultTagName: 'div',
    props: {
      role: 'group',
      'aria-label': name,
      ...rest,
      style: merged,
      'data-leaving': leaving ? '' : undefined,
      'data-status': status,
      'data-kind': kind ?? kindOf(name),
      'data-indeterminate': status === 'uploading' && p === undefined ? '' : undefined,
      'aria-busy': status === 'uploading' || undefined,
      className: cls(config, 'Attachment.Root', 'hj-attachment', className) as string | undefined,
      children: <AttachmentContext.Provider value={ctx}>{children}</AttachmentContext.Provider>,
    },
  });
}

export interface IconOwnProps {
  /** Override the glyph's kind. */
  kind?: AttachmentKind;
}
export interface IconProps extends IconOwnProps, Omit<React.ComponentProps<'span'>, 'children'> {}

/** The file-type glyph in a small tile. */
export function Icon(props: IconProps): React.ReactElement {
  const [config, { kind, className, ...rest }] = useSlot('Attachment.Icon', props);
  const { name, status } = React.useContext(AttachmentContext);
  const k = kind ?? kindOf(name);
  return (
    <span
      aria-hidden="true"
      {...rest}
      data-kind={k}
      className={
        cls(config, 'Attachment.Icon', 'hj-attachment-icon', className) as string | undefined
      }
    >
      {status === 'error' ? (
        config.icons.alert
      ) : (
        <svg
          viewBox="0 0 24 24"
          width="1em"
          height="1em"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={KIND_PATH[k]} />
        </svg>
      )}
    </span>
  );
}

/** The file name, ellipsised. Defaults to the Root's name. */
export function Name(props: React.ComponentProps<'span'>): React.ReactElement {
  const [config, { className, children, ...rest }] = useSlot('Attachment.Name', props);
  const { name } = React.useContext(AttachmentContext);
  return (
    <span
      title={name}
      {...rest}
      className={
        cls(config, 'Attachment.Name', 'hj-attachment-name', className) as string | undefined
      }
    >
      {children ?? name}
    </span>
  );
}

/** Size, page count, or the error in words. */
export const Meta: (props: ElementPartProps<'span'>) => React.ReactElement = elementPart(
  'span',
  'Attachment.Meta',
  'hj-attachment-meta',
);

export interface RemoveOwnProps {
  /** @default `Remove ${name}` */
  label?: string;
  /**
   * Called after the attachment has faded out (180 ms; quicker under reduced motion) and focus
   * has moved to a neighbour's ✕. Remove it from your state here; the rest of an Attachment.List
   * then glides into place.
   */
  onRemove?: () => void;
}
export interface RemoveProps extends RemoveOwnProps, Omit<BaseButton.Props, 'children'> {}

/** Removes (or cancels the upload of) this file. */
export function Remove(props: RemoveProps): React.ReactElement {
  const [config, { label, onRemove, onClick, className, ...rest }] = useSlot(
    'Attachment.Remove',
    props,
  );
  const { name, leave } = React.useContext(AttachmentContext);
  return (
    <BaseButton
      type="button"
      aria-label={label ?? `Remove ${name}`}
      data-attachment-remove=""
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (onRemove && !e.defaultPrevented) leave(onRemove);
      }}
      className={cls(config, 'Attachment.Remove', 'hj-attachment-remove', className)}
    >
      {config.icons.x}
    </BaseButton>
  );
}

/** The upload bar along the chip's bottom edge: a scaleX fill (never width). */
export function Progress(
  props: Omit<React.ComponentProps<'span'>, 'children'>,
): React.ReactElement | null {
  const [config, { className, ...rest }] = useSlot('Attachment.Progress', props);
  const { status } = React.useContext(AttachmentContext);
  if (status !== 'uploading') return null;
  return (
    <span
      aria-hidden="true"
      {...rest}
      className={
        cls(config, 'Attachment.Progress', 'hj-attachment-progress', className) as
          | string
          | undefined
      }
    />
  );
}

const LIST_ATTRS = ['data-leaving'] as const;

/**
 * A wrapping row of attachments (in a composer or under a message). When one leaves, the rest
 * glide into place on the settled snappy spring.
 */
export function List(props: ElementPartProps<'div'>): React.ReactElement {
  const [config, { render, className, ref, ...rest }] = useSlot('Attachment.List', props);
  const own = React.useRef<HTMLDivElement>(null);
  useFlip(own, LIST_ATTRS);
  return useRender({
    render,
    ref: ref ? [own, ref] : own,
    defaultTagName: 'div',
    props: {
      ...rest,
      className: cls(config, 'Attachment.List', 'hj-attachment-list', className) as
        | string
        | undefined,
    },
  });
}
