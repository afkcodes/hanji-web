'use client';
import { Field as BaseField } from '@base-ui/react/field';
import type { HTMLProps } from '@base-ui/react/types';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import type { HanjiConfig } from '../../system/config.tsx';
import { msVar, useFlip } from '../../system/flip.ts';
import { elementPart } from '../../system/part.tsx';
import type { ElementPartProps } from '../../system/part.tsx';
import { cls, flag } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';
import { formatBytes } from '../attachment/attachment.tsx';
import { Button } from '../button/button.tsx';
import type { ButtonProps } from '../button/button.tsx';
import * as Progress from '../progress/progress.tsx';

/** The DOM's File — this module exports a part called `File`. */
type DomFile = globalThis.File;

export type DropZoneRejectReason = 'type' | 'size' | 'count';

/** A file the zone turned away, and why — `message` comes from HanjiStrings. */
export interface DropZoneRejection {
  file: DomFile;
  /** type: not in `accept` · size: over `maxSize` · count: past `maxFiles`. */
  reason: DropZoneRejectReason;
  /** “File type not accepted”, “Over 10 MB”, “Over the 5-file limit”. */
  message: string;
}

export type DropZoneChangeReason = 'pick' | 'drop' | 'paste' | 'remove';

export interface DropZoneChangeDetails {
  /** How the files changed. */
  reason: DropZoneChangeReason;
  /** Files that came in (empty on remove). */
  added: DomFile[];
  /** Files that went out: removed, or replaced in a single-file zone. */
  removed: DomFile[];
}

export type DropZoneFileStatus = 'ready' | 'uploading' | 'done' | 'error';

const EMPTY: DomFile[] = [];

const VISUALLY_HIDDEN: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/** Clicks on these inside an Area belong to them, not to the zone. */
const INTERACTIVE = 'button, a[href], input, select, textarea, label, [role="button"]';

// Inline glyphs (24 grid, 1.5 stroke): the icon adapter has no upload, document or picture.
const TRAY = 'M4.5 14.5v2.25A2.75 2.75 0 0 0 7.25 19.5h9.5a2.75 2.75 0 0 0 2.75-2.75V14.5';
const ARROW = 'M12 15V4.75M7.75 9 12 4.75 16.25 9';
const DOCUMENT =
  'M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8ZM14 3.5V8h4.5M9 13h6M9 16.5h4';
const PICTURE =
  'M5.5 4.5h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1ZM9.5 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM19.5 15l-4.5-4.5-9 9';

function Glyph({ d, children }: { d?: string; children?: React.ReactNode }): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {d ? <path d={d} /> : children}
    </svg>
  );
}

function parseAccept(accept: string | undefined): string[] {
  if (!accept) return [];
  return accept
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** `accept` rules, as the native input reads them: `.ext`, `type/*` or an exact MIME type. */
function accepts(rules: readonly string[], name: string, type: string): boolean {
  if (rules.length === 0) return true;
  const n = name.toLowerCase();
  const t = type.toLowerCase();
  return rules.some((r) => {
    if (r.startsWith('.')) return n.endsWith(r);
    if (r.endsWith('/*')) return t.startsWith(r.slice(0, -1));
    return t === r;
  });
}

function sameFile(a: DomFile, b: DomFile): boolean {
  return (
    a === b ||
    (a.name === b.name &&
      a.size === b.size &&
      a.type === b.type &&
      a.lastModified === b.lastModified)
  );
}

function sameList(a: readonly DomFile[], b: readonly DomFile[]): boolean {
  return a.length === b.length && a.every((f, i) => f === b[i]);
}

/** Mirror the zone's files into the hidden input, so a plain form post sends them. */
function writeFiles(input: HTMLInputElement, files: readonly DomFile[]): void {
  if (typeof DataTransfer === 'undefined') return;
  const current = input.files ? [...input.files] : [];
  if (sameList(current, files)) return;
  try {
    const dt = new DataTransfer();
    for (const f of files) dt.items.add(f);
    input.files = dt.files;
  } catch {
    // Older engines can't assign a FileList; the picker's own selection stays.
  }
}

function carriesFiles(dt: DataTransfer | null): dt is DataTransfer {
  return !!dt && Array.from(dt.types).includes('Files');
}

/**
 * A stable function that always runs the latest render's closure — so the context value and the
 * drag handlers only change when the zone's state does. (Local helper: src/system has none.)
 */
function useEvent<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const latest = React.useRef(fn);
  React.useLayoutEffect(() => {
    latest.current = fn;
  });
  return React.useCallback((...args: A) => latest.current(...args), []);
}

interface DropZoneContextValue {
  files: readonly DomFile[];
  multiple: boolean;
  disabled: boolean;
  invalid: boolean;
  dragging: boolean;
  /** While a drag the zone can't take hovers: why, in words. */
  refusal: string | undefined;
  open: () => void;
  remove: (file: DomFile) => void;
  /** Field wiring for the Trigger. */
  triggerId: string | undefined;
  labelId: string | undefined;
  describedBy: string | undefined;
  hintId: string;
  setHint: (on: boolean) => void;
  areaHandlers: Pick<
    React.HTMLAttributes<HTMLElement>,
    'onDragEnter' | 'onDragOver' | 'onDragLeave' | 'onDrop'
  >;
}

const DropZoneContext = React.createContext<DropZoneContextValue | null>(null);

function useDropZone(part: string): DropZoneContextValue {
  const ctx = React.useContext(DropZoneContext);
  if (!ctx) throw new Error(`<DropZone.${part}> must be inside <DropZone.Root>.`);
  return ctx;
}

/** Props hanji adds to the zone. */
export interface RootOwnProps {
  /** Types to take, as the input's `accept`: MIME types, `type/*` or extensions — `'application/pdf,.pdf'`. Checked on drop and paste too. */
  accept?: string;
  /** Take several files; new ones are added to the list. Without it, a new file replaces the old. @default false */
  multiple?: boolean;
  /** Largest file in bytes. Bigger files are rejected “Over 10 MB”. */
  maxSize?: number;
  /** Most files the zone holds (with `multiple`). Extra files are rejected. */
  maxFiles?: number;
  /** Ignore drops, pastes and clicks. A Field's `disabled` wins too. @default false */
  disabled?: boolean;
  /** Draw the error hairline. A Field's invalid state sets it too. @default false */
  invalid?: boolean;
  /** Needs at least one file to submit (native constraint validation, read by Field). */
  required?: boolean;
  /** Submits the files under this name in a form. A Field's `name` wins. */
  name?: string;
  /** The files, controlled. */
  files?: DomFile[];
  /** The files to start with, uncontrolled. */
  defaultFiles?: DomFile[];
  /** The accepted files changed: the whole list, then how it changed. */
  onFilesChange?: (files: DomFile[], details: DropZoneChangeDetails) => void;
  /** Some files were turned away — each with a reason and a message to show. */
  onReject?: (rejections: DropZoneRejection[]) => void;
}

export interface RootProps
  extends RootOwnProps, Omit<React.ComponentProps<'div'>, 'className' | 'onChange'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * Takes files by drop, by the native picker (click the zone, or its Browse button with Enter or
 * Space) and by paste while focus is inside. Holds the accepted files in a hidden file input, so
 * it submits with a form and reads label, description, error, disabled and invalid from a Field.
 * With no children it renders an Area and a List of its files.
 *
 * @example
 * <Field.Root name="documents">
 *   <Field.Label>Supporting documents</Field.Label>
 *   <DropZone.Root accept="application/pdf" multiple maxSize={10 * 2 ** 20} onReject={show} />
 * </Field.Root>
 */
export function Root(props: RootProps): React.ReactElement {
  const [config, { name, disabled = false, required, ...own }] = useSlot('DropZone.Root', props);
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <BaseField.Control
      ref={inputRef}
      name={name}
      disabled={disabled}
      required={required}
      render={(control, field) => (
        <Frame config={config} own={own} control={control} field={field} inputRef={inputRef} />
      )}
    />
  );
}

interface FrameProps {
  config: HanjiConfig;
  own: Omit<RootProps, 'name' | 'disabled' | 'required'>;
  control: HTMLProps;
  field: BaseField.Control.State;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

/** The zone itself, rendered through Field.Control so Field's ids, name and validity reach it. */
function Frame({ config, own, control, field, inputRef }: FrameProps): React.ReactElement {
  const {
    accept,
    multiple = false,
    maxSize,
    maxFiles,
    invalid: invalidProp = false,
    files: filesProp,
    defaultFiles,
    onFilesChange,
    onReject,
    onPaste,
    render,
    className,
    children,
    ref,
    ...rest
  } = own;
  const {
    id: controlId,
    'aria-labelledby': labelId,
    'aria-describedby': fieldDescribedBy,
    onChange: fieldChange,
    className: _className,
    style: _style,
    ...controlRest
  } = control as HTMLProps<HTMLInputElement> & React.InputHTMLAttributes<HTMLInputElement>;
  const fieldData: Record<string, unknown> = {};
  const inputProps: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(controlRest)) {
    if (k.startsWith('data-')) fieldData[k] = v;
    else inputProps[k] = v;
  }

  const strings = config.strings;
  const [inner, setInner] = React.useState<DomFile[]>(defaultFiles ?? EMPTY);
  const controlled = filesProp !== undefined;
  const files = controlled ? filesProp : inner;
  const disabled = field.disabled;
  const invalid = invalidProp || field.valid === false;
  const limit = multiple ? (maxFiles ?? Number.POSITIVE_INFINITY) : 1;
  const rules = React.useMemo(() => parseAccept(accept), [accept]);
  const mimeOnly = rules.length > 0 && rules.every((r) => !r.startsWith('.'));

  const [drag, setDrag] = React.useState<'accept' | DropZoneRejectReason | null>(null);
  const depth = React.useRef(0);
  const [live, setLive] = React.useState({ n: 0, text: '' });
  const [hint, setHint] = React.useState(false);
  const hintId = React.useId();
  const syncing = React.useRef(false);
  const synced = React.useRef(files);

  const messageFor = (reason: DropZoneRejectReason): string =>
    reason === 'type'
      ? strings.fileTypeRejected
      : reason === 'size'
        ? strings.fileTooLarge(formatBytes(maxSize ?? 0))
        : strings.tooManyFiles(limit);

  const commit = (next: DomFile[], details: DropZoneChangeDetails): void => {
    if (!controlled) setInner(next);
    onFilesChange?.(next, details);
  };

  const take = useEvent((incoming: readonly DomFile[], reason: 'pick' | 'drop' | 'paste'): void => {
    if (disabled || incoming.length === 0) return;
    const added: DomFile[] = [];
    const rejected: DropZoneRejection[] = [];
    const room = multiple ? Math.max(0, limit - files.length) : 1;
    for (const file of incoming) {
      // the same file twice is already here: skip it quietly
      if (multiple && [...files, ...added].some((f) => sameFile(f, file))) continue;
      const why: DropZoneRejectReason | null = !accepts(rules, file.name, file.type)
        ? 'type'
        : maxSize !== undefined && file.size > maxSize
          ? 'size'
          : added.length >= room
            ? 'count'
            : null;
      if (why) rejected.push({ file, reason: why, message: messageFor(why) });
      else added.push(file);
    }
    if (added.length > 0) {
      commit(multiple ? [...files, ...added] : added, {
        reason,
        added,
        removed: multiple ? [] : [...files],
      });
    }
    if (rejected.length > 0) onReject?.(rejected);
    const said = [
      added.length > 0 ? strings.filesAdded(added.length) : '',
      ...rejected.map((r) => `${r.file.name}: ${r.message}`),
    ].filter(Boolean);
    if (said.length > 0) setLive((l) => ({ n: l.n + 1, text: said.join('. ') }));
  });

  // Stable, and always reads the files as they are when called — rows remove after a fade.
  const remove = useEvent((file: DomFile): void => {
    if (!files.includes(file)) return;
    commit(
      files.filter((f) => f !== file),
      { reason: 'remove', added: [], removed: [file] },
    );
  });

  const open = useEvent((): void => {
    if (!disabled) inputRef.current?.click();
  });

  // Keep the input's FileList equal to the files, and tell the Field when they change.
  React.useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    writeFiles(input, files);
    if (sameList(synced.current, files)) return;
    synced.current = files;
    syncing.current = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    syncing.current = false;
  }, [files, inputRef]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (syncing.current) {
      fieldChange?.(e);
      return;
    }
    const picked = e.currentTarget.files ? [...e.currentTarget.files] : [];
    // The picker replaced the whole FileList: put ours back; the effect writes the new list.
    writeFiles(e.currentTarget, files);
    take(picked, 'pick');
  };

  /** During a drag only MIME types and the count are known — refuse only when sure. */
  const dragEnter = useEvent((e: React.DragEvent<HTMLElement>): void => {
    if (!carriesFiles(e.dataTransfer)) return;
    e.preventDefault();
    depth.current += 1;
    if (disabled) return;
    const items = e.dataTransfer.items
      ? Array.from(e.dataTransfer.items).filter((i) => i.kind === 'file')
      : [];
    const room = multiple ? limit - files.length : 1;
    setDrag(
      mimeOnly && items.some((i) => i.type !== '' && !accepts(rules, '', i.type))
        ? 'type'
        : items.length > room
          ? 'count'
          : 'accept',
    );
  });
  const dragOver = useEvent((e: React.DragEvent<HTMLElement>): void => {
    if (!carriesFiles(e.dataTransfer)) return;
    // Always claim the drop, so a file let go here never opens in the tab.
    e.preventDefault();
    e.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
  });
  const dragLeave = useEvent((e: React.DragEvent<HTMLElement>): void => {
    if (!carriesFiles(e.dataTransfer)) return;
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setDrag(null);
  });
  const dropped = useEvent((e: React.DragEvent<HTMLElement>): void => {
    if (!carriesFiles(e.dataTransfer)) return;
    e.preventDefault();
    depth.current = 0;
    setDrag(null);
    take([...e.dataTransfer.files], 'drop');
  });
  const areaHandlers = React.useMemo(
    () => ({
      onDragEnter: dragEnter,
      onDragOver: dragOver,
      onDragLeave: dragLeave,
      onDrop: dropped,
    }),
    [dragEnter, dragOver, dragLeave, dropped],
  );

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>): void => {
    onPaste?.(e);
    if (e.defaultPrevented || disabled) return;
    const pasted = [...e.clipboardData.files];
    if (pasted.length === 0) return;
    e.preventDefault();
    take(pasted, 'paste');
  };

  const refusal = drag && drag !== 'accept' ? messageFor(drag) : undefined;
  const describedBy =
    [fieldDescribedBy, hint ? hintId : undefined].filter(Boolean).join(' ') || undefined;
  const dragging = drag !== null;
  const ctx = React.useMemo<DropZoneContextValue>(
    () => ({
      files,
      multiple,
      disabled,
      invalid,
      dragging,
      refusal,
      open,
      remove,
      triggerId: controlId,
      labelId,
      describedBy,
      hintId,
      setHint,
      areaHandlers,
    }),
    [
      files,
      multiple,
      disabled,
      invalid,
      dragging,
      refusal,
      open,
      remove,
      controlId,
      labelId,
      describedBy,
      hintId,
      areaHandlers,
    ],
  );

  const element = useRender({
    render,
    ref,
    defaultTagName: 'div',
    props: {
      ...fieldData,
      ...rest,
      onPaste: handlePaste,
      'data-drop-zone-root': '',
      'data-disabled': flag(disabled),
      'data-invalid': flag(invalid),
      'data-dragging': flag(drag !== null),
      'data-reject': flag(refusal !== undefined),
      'data-filled': flag(files.length > 0),
      className: cls(config, 'DropZone.Root', 'hj-drop-zone', className) as string | undefined,
      children: (
        <>
          <input
            {...inputProps}
            type="file"
            accept={accept}
            multiple={multiple}
            tabIndex={-1}
            aria-hidden="true"
            style={VISUALLY_HIDDEN}
            onChange={onInputChange}
            // Form validation focuses the input; the Browse button stands in for it.
            onFocus={(e) => {
              (inputProps.onFocus as React.FocusEventHandler<HTMLInputElement> | undefined)?.(e);
              e.currentTarget
                .closest('[data-drop-zone-root]')
                ?.querySelector<HTMLElement>('[data-drop-zone-trigger]')
                ?.focus();
            }}
          />
          <span aria-live="polite" data-drop-zone-live="" style={VISUALLY_HIDDEN}>
            <span key={live.n}>{live.text}</span>
          </span>
          {children ?? <DefaultBody files={files} />}
        </>
      ),
    },
  });
  return <DropZoneContext.Provider value={ctx}>{element}</DropZoneContext.Provider>;
}

function DefaultBody({ files }: { files: readonly DomFile[] }): React.ReactElement {
  return (
    <>
      <Area />
      {files.length > 0 ? (
        <List>
          {files.map((f) => (
            <File key={`${f.name}:${f.size}:${f.lastModified}`} file={f} />
          ))}
        </List>
      ) : null}
    </>
  );
}

export interface AreaOwnProps {
  /** stack: glyph, prompt and button centred in a tall box · inline: one compact row, for a Field. @default 'stack' */
  layout?: 'stack' | 'inline';
}
export interface AreaProps extends AreaOwnProps, ElementPartProps<'div'> {}

/**
 * The drop target. Tints and turns its hairline accent while files hover; tints danger when it
 * can tell they won't be taken. A click anywhere on it opens the picker. With no children it
 * renders Icon, Prompt and Trigger.
 */
export function Area(props: AreaProps): React.ReactElement {
  const [config, { layout = 'stack', render, className, children, onClick, ...rest }] = useSlot(
    'DropZone.Area',
    props,
  );
  const ctx = useDropZone('Area');
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...rest,
      ...ctx.areaHandlers,
      onClick(e: React.MouseEvent<HTMLDivElement>) {
        onClick?.(e);
        if (e.defaultPrevented || ctx.disabled) return;
        const hit = (e.target as Element).closest(INTERACTIVE);
        if (hit && hit !== e.currentTarget && e.currentTarget.contains(hit)) return;
        ctx.open();
      },
      'data-layout': layout,
      'data-disabled': flag(ctx.disabled),
      'data-invalid': flag(ctx.invalid),
      'data-dragging': flag(ctx.dragging),
      'data-reject': flag(ctx.refusal !== undefined),
      className: cls(config, 'DropZone.Area', 'hj-drop-zone-area', className) as string | undefined,
      children: children ?? (
        <>
          <Icon />
          <Content>
            <Prompt />
          </Content>
          <Trigger />
        </>
      ),
    },
  });
}

/**
 * The upload glyph in a tile. Rises a little while files hover; turns to the alert glyph when it
 * refuses them, so refusal is never colour alone. Pass children for your own glyph.
 */
export function Icon(props: React.ComponentProps<'span'>): React.ReactElement {
  const [config, { className, children, ...rest }] = useSlot('DropZone.Icon', props);
  const refused = React.useContext(DropZoneContext)?.refusal !== undefined;
  const styled = !config.unstyled;
  return (
    <span
      aria-hidden="true"
      {...rest}
      className={cls(config, 'DropZone.Icon', 'hj-drop-zone-icon', className) as string | undefined}
    >
      {children ??
        (refused ? (
          config.icons.alert
        ) : (
          <Glyph>
            <path d={TRAY} />
            <path d={ARROW} className={styled ? 'hj-drop-zone-arrow' : undefined} />
          </Glyph>
        ))}
    </span>
  );
}

/** Stacks the Prompt over the Hint. */
export const Content: (props: ElementPartProps<'div'>) => React.ReactElement = elementPart(
  'div',
  'DropZone.Content',
  'hj-drop-zone-content',
);

/**
 * “Drop files here” (or “Drop a file here”). While a drag the zone can't take hovers, it says
 * why instead: “File type not accepted”.
 */
export function Prompt(props: ElementPartProps<'p'>): React.ReactElement {
  const [config, { render, className, children, ...rest }] = useSlot('DropZone.Prompt', props);
  const ctx = useDropZone('Prompt');
  return useRender({
    render,
    defaultTagName: 'p',
    props: {
      ...rest,
      'data-reject': flag(ctx.refusal !== undefined),
      className: cls(config, 'DropZone.Prompt', 'hj-drop-zone-prompt', className) as
        | string
        | undefined,
      children: ctx.refusal ?? children ?? config.strings.dropFiles(ctx.multiple),
    },
  });
}

/** What the zone takes — “PDF, up to 10 MB each”. Describes the Browse button too. */
export function Hint(props: ElementPartProps<'p'>): React.ReactElement {
  const [config, { render, className, ...rest }] = useSlot('DropZone.Hint', props);
  const { hintId, setHint } = useDropZone('Hint');
  React.useEffect(() => {
    setHint(true);
    return () => setHint(false);
  }, [setHint]);
  return useRender({
    render,
    defaultTagName: 'p',
    props: {
      ...rest,
      id: hintId,
      className: cls(config, 'DropZone.Hint', 'hj-drop-zone-hint', className) as string | undefined,
    },
  });
}

export interface TriggerProps extends ButtonProps {}

/**
 * The real button that opens the picker (Enter or Space). A secondary small Button by default;
 * labelled by the Field's label and described by its description, error and the Hint. Works
 * anywhere inside Root — “Replace” beside an avatar, say.
 */
export function Trigger(props: TriggerProps): React.ReactElement {
  const [config, { variant = 'secondary', size = 'sm', className, children, onClick, ...rest }] =
    useSlot('DropZone.Trigger', props);
  const ctx = useDropZone('Trigger');
  return (
    <Button
      variant={variant}
      size={size}
      {...rest}
      id={ctx.triggerId}
      aria-labelledby={ctx.labelId ? `${ctx.labelId} ${ctx.triggerId}` : undefined}
      aria-describedby={ctx.describedBy}
      disabled={ctx.disabled || rest.disabled}
      data-drop-zone-trigger=""
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.open();
      }}
      className={cls(config, 'DropZone.Trigger', 'hj-drop-zone-trigger', className)}
    >
      {children ?? config.strings.browseFiles}
    </Button>
  );
}

const LIST_ATTRS = ['data-leaving'] as const;

/** The files, one row each, hairlines between. When one leaves, the rest glide up. */
export function List(props: ElementPartProps<'ul'>): React.ReactElement {
  const [config, { render, className, ref, ...rest }] = useSlot('DropZone.List', props);
  const own = React.useRef<HTMLUListElement>(null);
  useFlip(own, LIST_ATTRS);
  return useRender({
    render,
    ref: ref ? [own, ref] : own,
    defaultTagName: 'ul',
    props: {
      ...rest,
      className: cls(config, 'DropZone.List', 'hj-drop-zone-list', className) as string | undefined,
    },
  });
}

/**
 * An image file's preview. The object URL is an outside resource, so it is made and revoked by the
 * effect and written to the element directly — no state, no extra render, StrictMode-safe. The
 * glyph underneath shows until it loads, and again if it can't decode (e.g. HEIC).
 */
function Preview({ file, className }: { file: DomFile; className?: string }): React.ReactElement {
  const img = React.useRef<HTMLImageElement>(null);
  React.useEffect(() => {
    const el = img.current;
    if (!el || typeof URL.createObjectURL !== 'function') return undefined;
    const url = URL.createObjectURL(file);
    el.hidden = false;
    el.src = url;
    return () => {
      el.removeAttribute('src');
      URL.revokeObjectURL(url);
    };
  }, [file]);
  return (
    <img
      ref={img}
      alt=""
      className={className}
      onError={(e) => {
        e.currentTarget.hidden = true;
      }}
    />
  );
}

export interface FileOwnProps {
  /** The File: supplies name, size, type and an image preview; Remove also takes it out of the Root's files. */
  file?: DomFile;
  /** File name. Default: `file.name`. */
  name?: string;
  /** Size in bytes, shown in tabular numerals. Default: `file.size`. */
  size?: number;
  /** MIME type, for the glyph and the preview. Default: `file.type`, else guessed from the name. */
  type?: string;
  /** Thumbnail URL. Default: a preview of an image `file`. */
  src?: string;
  /** ready (picked) · uploading (shows progress) · done (uploaded) · error (danger; say why in `error`). @default 'ready' */
  status?: DropZoneFileStatus;
  /** Upload progress, 0–1. Omit while uploading for an indeterminate bar. */
  progress?: number;
  /** The reason, with status error — a rejection's `message`, or why the upload failed. */
  error?: React.ReactNode;
  /** Shows ✕. Called after the row fades out and focus has moved on. */
  onRemove?: () => void;
  /** Shows Retry while status is error. */
  onRetry?: () => void;
}
export interface FileProps
  extends FileOwnProps, Omit<React.ComponentProps<'li'>, 'children' | 'className'> {
  className?: string;
  render?: useRender.RenderProp;
}

/**
 * One file: thumbnail or glyph, name, size — with upload progress, “Uploaded”, or the error and a
 * Retry. Uploading is the app's job; this row only shows it.
 */
export function File(props: FileProps): React.ReactElement {
  const [
    config,
    {
      file,
      name: nameProp,
      size: sizeProp,
      type: typeProp,
      src,
      status = 'ready',
      progress,
      error,
      onRemove,
      onRetry,
      render,
      className,
      ref,
      ...rest
    },
  ] = useSlot('DropZone.File', props);
  const zone = React.useContext(DropZoneContext);
  const styled = !config.unstyled;
  const s = config.strings;
  const name = nameProp ?? file?.name ?? '';
  const size = sizeProp ?? file?.size;
  const type = (typeProp ?? file?.type ?? '').toLowerCase();
  const image = type.startsWith('image/') || /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(name);
  const held = file !== undefined && zone !== null && zone.files.includes(file);
  const removable = onRemove !== undefined || held;
  const own = React.useRef<HTMLLIElement>(null);
  const gone = React.useRef(false);
  const [leaving, setLeaving] = React.useState(false);
  const p = progress === undefined ? undefined : Math.min(1, Math.max(0, progress));
  const pct = p === undefined ? undefined : Math.round(p * 100);
  const sized = size === undefined ? '' : formatBytes(size);

  const finish = (): void => {
    if (held && file) zone?.remove(file);
    onRemove?.();
  };

  const leave = (): void => {
    if (gone.current) return;
    gone.current = true;
    const el = own.current;
    if (!el) {
      finish();
      return;
    }
    // Hand focus to a neighbour's ✕ (or the Browse button) before this row goes.
    const all = [
      ...(el.parentElement?.querySelectorAll<HTMLElement>('[data-drop-zone-remove]') ?? []),
    ];
    const mine = el.querySelector<HTMLElement>('[data-drop-zone-remove]');
    const i = mine ? all.indexOf(mine) : -1;
    const next =
      all[i + 1] ??
      all[i - 1] ??
      el.closest('[data-drop-zone-root]')?.querySelector<HTMLElement>('[data-drop-zone-trigger]') ??
      null;
    const hadFocus = el.contains(document.activeElement);
    setLeaving(true);
    window.setTimeout(
      () => {
        if (hadFocus) next?.focus();
        finish();
      },
      msVar(getComputedStyle(el), '--hj-dur-fast', 160),
    );
  };

  const c = (part: string): string | undefined =>
    styled ? `hj-drop-zone-file-${part}` : undefined;

  let meta: React.ReactNode;
  if (status === 'uploading') {
    meta = (
      <>
        <span className={c('progress')}>
          <Progress.Root value={pct ?? null} aria-label={name} />
        </span>
        <span className={c('size')}>
          {pct === undefined ? sized : sized ? `${pct}% · ${sized}` : `${pct}%`}
        </span>
      </>
    );
  } else if (status === 'error') {
    meta = (
      <>
        <span className={c('error')}>{error ?? s.uploadFailed}</span>
        {sized ? <span className={c('size')}>{sized}</span> : null}
      </>
    );
  } else if (status === 'done') {
    meta = (
      <>
        <span className={c('done')}>
          {config.icons.check}
          {s.uploaded}
        </span>
        {sized ? <span className={c('size')}>{sized}</span> : null}
      </>
    );
  } else {
    meta = sized ? <span className={c('size')}>{sized}</span> : null;
  }

  return useRender({
    render,
    ref: ref ? [own, ref] : own,
    defaultTagName: 'li',
    props: {
      ...rest,
      'data-status': status,
      'data-kind': image ? 'image' : 'file',
      'data-leaving': flag(leaving),
      'aria-busy': status === 'uploading' || undefined,
      className: cls(config, 'DropZone.File', 'hj-drop-zone-file', className) as string | undefined,
      children: (
        <>
          <span className={c('thumb')} aria-hidden="true">
            {status === 'error' ? (
              config.icons.alert
            ) : (
              <>
                <Glyph d={image ? PICTURE : DOCUMENT} />
                {src ? (
                  <img src={src} alt="" className={c('image')} />
                ) : image && file ? (
                  <Preview file={file} className={c('image')} />
                ) : null}
              </>
            )}
          </span>
          <span className={c('name')} title={name}>
            {name}
          </span>
          <span className={c('meta')}>{meta}</span>
          <span className={c('actions')}>
            {status === 'error' && onRetry ? (
              <Button variant="quiet" size="sm" aria-label={`${s.retry} ${name}`} onClick={onRetry}>
                {s.retry}
              </Button>
            ) : null}
            {removable ? (
              <Button
                variant="quiet"
                size="sm"
                iconOnly
                aria-label={`${s.remove} ${name}`}
                data-drop-zone-remove=""
                onClick={leave}
              >
                {config.icons.x}
              </Button>
            ) : null}
          </span>
        </>
      ),
    },
  });
}
