import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { AreaOwnProps, FileOwnProps, RootOwnProps } from './drop-zone.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'DropZone',
  slug: 'drop-zone',
  category: 'controls',
  status: 'new',
  description:
    'Takes files for a form — by drag and drop, the native picker or paste — checks type, size and count, and lists them with upload progress, errors and retry.',
  whenToUse: [
    'A form needs files: documents for an application, a profile photo, a proof of address.',
    'Several files arrive at once and each needs its own progress or error.',
    'The user should see what will be rejected before letting go (type, too many).',
  ],
  whenNotToUse: [
    'Files attached to a chat prompt or message — use Attachment with PromptInput.Attach.',
    'Reordering things on the page — use DragList.',
    'Picking from files already in your app — use a Select, Combobox or a list of rows.',
  ],
  import: "import { DropZone, Field } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      slot: 'DropZone.Root',
      className: 'hj-drop-zone',
      description:
        'Owns the files and a hidden <input type="file"> (so it submits with a form), validates every file from a drop, the picker or a paste (while focus is inside), and announces what was added or turned away. Rendered through Field.Control: inside a Field it takes the label, description, error ids, name, disabled and validity. With no children: an Area and a List of its files.',
      props: props<RootOwnProps>({
        accept: {
          type: 'string',
          description:
            "As the input's accept: MIME types, `type/*` or `.ext`, comma-separated — `'application/pdf'`. Also checked on drop and paste; MIME-only lists are checked while dragging too.",
        },
        multiple: {
          type: 'boolean',
          default: 'false',
          description:
            'Take several files; new ones join the list. Without it a new file replaces the old.',
        },
        maxSize: {
          type: 'number',
          description:
            'Largest file in bytes. Bigger ones are rejected with `fileTooLarge` (“Over 10 MB”).',
        },
        maxFiles: {
          type: 'number',
          description:
            'Most files held (with `multiple`; 1 otherwise). Extras are rejected with `tooManyFiles`.',
        },
        disabled: {
          type: 'boolean',
          default: 'false',
          description: 'Ignore drops, pastes and clicks. A Field’s disabled wins too.',
        },
        invalid: {
          type: 'boolean',
          default: 'false',
          description: 'Danger hairline. A Field’s invalid state sets it too.',
        },
        required: {
          type: 'boolean',
          description:
            'At least one file to submit — native constraint validation, so Field.Error match="valueMissing" works.',
        },
        name: {
          type: 'string',
          description: 'Submits the files under this name. A Field’s name wins.',
        },
        files: { type: 'File[]', description: 'The accepted files, controlled.' },
        defaultFiles: { type: 'File[]', description: 'The files to start with, uncontrolled.' },
        onFilesChange: {
          type: '(files: File[], details: { reason: "pick" | "drop" | "paste" | "remove"; added: File[]; removed: File[] }) => void',
          description:
            'The accepted list changed. Start uploads from `details.added`; uploading is the app’s job.',
        },
        onReject: {
          type: '(rejections: { file: File; reason: "type" | "size" | "count"; message: string }[]) => void',
          description:
            'Files turned away, each with a reason and a message from HanjiStrings to show (e.g. as a DropZone.File with status error).',
        },
      }),
      dataAttributes: {
        'data-dragging': 'Files are over the Area.',
        'data-reject': 'Files are over the Area that it can tell it won’t take (type or count).',
        'data-disabled': 'Disabled (own prop or Field).',
        'data-invalid': 'Invalid (own prop or Field).',
        'data-filled': 'Holds at least one file.',
        'data-valid / data-touched / data-dirty / data-focused': 'From Field, as on Field.Control.',
      },
    },
    {
      name: 'Area',
      element: 'div',
      slot: 'DropZone.Area',
      className: 'hj-drop-zone-area',
      description:
        'The drop target: a dashed hairline. While files hover the line locks solid accent over an accent wash. When it can tell they won’t be taken it washes danger but the line stays dashed and the glyph and words change, so refusal never rests on colour (a red accent would match danger). Disabled: the line fades and the contents dim (the Trigger dims itself). A click anywhere on it opens the picker; clicks on its own buttons stay theirs. With no children: Icon, Content › Prompt, Trigger.',
      props: props<AreaOwnProps>({
        layout: {
          type: "'stack' | 'inline'",
          default: "'stack'",
          description:
            'stack: glyph, prompt and button centred in a 176px box · inline: one compact row (56px) for a Field, an avatar row, a single document.',
        },
      }),
      dataAttributes: {
        'data-layout': 'stack | inline',
        'data-dragging': 'Files are over it.',
        'data-reject': 'What hovers won’t be taken.',
        'data-disabled': 'Disabled.',
        'data-invalid': 'Invalid.',
      },
      cssVars: {
        '--hj-drop-zone-radius': 'Corner radius. Default radius-md (stack), radius-sm (inline).',
        '--hj-drop-zone-bg': 'Resting fill. Default transparent (the paper shows through).',
        '--hj-drop-zone-min-height':
          'Minimum height. Default 176px (stack), 56px (inline), density-scaled.',
      },
    },
    {
      name: 'Icon',
      element: 'span',
      slot: 'DropZone.Icon',
      className: 'hj-drop-zone-icon',
      description:
        'Upload glyph (tray and arrow, drawn inline) in a 44px tile — 36px inline; the alert glyph while a drag is refused. Children replace the glyph.',
    },
    {
      name: 'Content',
      element: 'div',
      slot: 'DropZone.Content',
      className: 'hj-drop-zone-content',
      description: 'Stacks the Prompt over the Hint.',
    },
    {
      name: 'Prompt',
      element: 'p',
      slot: 'DropZone.Prompt',
      className: 'hj-drop-zone-prompt',
      description:
        '`dropFiles(multiple)` — “Drop files here” / “Drop a file here” — or your children. While a refused drag hovers it says why (“File type not accepted”). data-reject then.',
    },
    {
      name: 'Hint',
      element: 'p',
      slot: 'DropZone.Hint',
      className: 'hj-drop-zone-hint',
      description:
        'What it takes: “PDF only · up to 10 MB each”. Tabular numerals. Also describes the Trigger (aria-describedby).',
    },
    {
      name: 'Trigger',
      element: 'button',
      slot: 'DropZone.Trigger',
      className: 'hj-drop-zone-trigger',
      description:
        'A real Button (secondary, sm by default; every Button prop works) that opens the picker on click, Enter or Space. Gets the Field’s control id, so Field.Label points at it; labelled by the label plus its own text, described by the Field description, error and Hint. Text: `browseFiles` (“Browse”). Can sit anywhere inside Root.',
    },
    {
      name: 'List',
      element: 'ul',
      slot: 'DropZone.List',
      className: 'hj-drop-zone-list',
      description:
        'The files as rows with hairlines between (no cards). When a row leaves, the rest glide up (FLIP).',
    },
    {
      name: 'File',
      element: 'li',
      slot: 'DropZone.File',
      className: 'hj-drop-zone-file',
      description:
        'One file: 40px thumbnail (image preview, or a document glyph), name, size in tabular numerals; uploading shows a Progress bar and percent, done shows “Uploaded” with a check, error shows the reason in danger with Retry. ✕ fades the row, hands focus to the next ✕ (or Browse), then removes the file from Root and calls onRemove.',
      props: props<FileOwnProps>({
        file: {
          type: 'File',
          description:
            'Supplies name, size, type and an image preview; Remove also takes it out of the Root’s files.',
        },
        name: { type: 'string', default: 'file.name', description: 'File name, ellipsised.' },
        size: { type: 'number', default: 'file.size', description: 'Bytes, formatted “2.4 MB”.' },
        type: {
          type: 'string',
          default: 'file.type',
          description: 'MIME type, for the glyph and preview. Falls back to the name’s extension.',
        },
        src: { type: 'string', description: 'Thumbnail URL. Default: a preview of an image file.' },
        status: {
          type: "'ready' | 'uploading' | 'done' | 'error'",
          default: "'ready'",
          description:
            'ready = picked · uploading = progress · done = uploaded · error = say why in `error`.',
        },
        progress: {
          type: 'number',
          description: '0–1 while uploading. Omit for an indeterminate bar.',
        },
        error: {
          type: 'ReactNode',
          default: 'strings.uploadFailed',
          description: 'The reason, with status error — a rejection’s message or the failure.',
        },
        onRemove: {
          type: '() => void',
          description: 'Shows ✕ (so does a `file` the Root holds). Called after the fade.',
        },
        onRetry: { type: '() => void', description: 'Shows Retry while status is error.' },
      }),
      dataAttributes: {
        'data-status': 'ready | uploading | done | error',
        'data-kind': 'image | file',
        'data-leaving': 'Fading out after ✕.',
      },
    },
  ],
  examples: [
    {
      file: 'documents',
      title: 'Documents for an application',
      description:
        'Several PDFs: one uploaded, one at 60%, one failed with Retry, one rejected for size. Drop more to watch them upload.',
    },
    {
      file: 'avatar',
      title: 'Profile photo',
      description:
        'One image, previewed in the Avatar, with Replace and Remove. A rejected file shows in Field.Error.',
    },
    {
      file: 'inline',
      title: 'Inline, inside a form',
      description:
        'The compact row at Field height: required (submit empty to see the error), and disabled through its Field.',
    },
  ],
  accessibility: [
    'The picker opens from a real button (Trigger) — Tab, then Enter or Space. Field.Label points at it; it is described by the Field description, error and Hint.',
    'The hidden file input is aria-hidden and out of the tab order; when form validation focuses it, focus moves to the Trigger.',
    'Paste works while focus is inside the zone, so keyboard users can paste a copied file onto the focused Browse button.',
    'Every outcome is announced politely: “2 files added”, “budget.xlsx: File type not accepted”. Errors are words on the row, never colour alone.',
    'Each row is a list item; ✕ and Retry name their file (“Remove lease.pdf”). Removing hands focus to the next ✕, else Browse. Upload bars are Progress (role=progressbar) named by the file.',
  ],
  motion:
    'The one detail: while files hover, the icon tile rises 2px and grows 6% and its arrow lifts out of the tray, on the snappy spring — the zone reaching for the file. The wash and hairline change colour on the fast clock. Rows arrive with the standard rise on gentle, clamped; a removed row fades on the fast clock and the List glides the rest up (translate). Reduced motion: travel 0, so the lift and rise become colour and fade only.',
  tokens: [
    'fg',
    'fg-dim',
    'fg-mute',
    'line',
    'accent',
    'accent-soft',
    'danger',
    'danger-soft',
    'success',
    'radius-md',
    'radius-sm',
    'radius-xs',
    'type-body',
    'type-sub',
  ],
  related: ['field', 'form', 'attachment', 'progress', 'avatar', 'button'],
  baseUi: 'field',
});
