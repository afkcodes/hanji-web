import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { IconOwnProps, RemoveOwnProps, RootOwnProps } from './attachment.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Attachment',
  slug: 'attachment',
  category: 'ai',
  status: 'new',
  description:
    'A file attached to a prompt or message: type glyph, name, size or error, remove, and an upload bar.',
  whenToUse: [
    'Files picked with PromptInput.Attach, while they upload and once ready.',
    'Files the assistant returns.',
  ],
  whenNotToUse: [
    'A file browser — use ListRow.',
    'Images that should be seen, not listed — show a thumbnail grid.',
  ],
  import: "import { Attachment, formatBytes, kindOf } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      slot: 'Attachment.Root',
      className: 'hj-attachment',
      description:
        'role="group" labelled by the file name; aria-busy while uploading. Scales in once.',
      props: props<RootOwnProps>({
        name: {
          type: 'string',
          description: 'File name — labels the chip and Remove, and picks the glyph.',
        },
        status: {
          type: "'uploading' | 'ready' | 'error'",
          default: "'ready'",
          description: 'error = danger tint; put the reason in Meta.',
        },
        progress: {
          type: 'number',
          description: '0–1. Omit while uploading for an indeterminate bar.',
        },
        kind: {
          type: "'image' | 'pdf' | 'audio' | 'video' | 'code' | 'archive' | 'text' | 'file'",
          default: 'kindOf(name)',
          description: 'File kind for the glyph.',
        },
      }),
      dataAttributes: {
        'data-status': 'uploading | ready | error',
        'data-kind': 'The kind.',
        'data-indeterminate': 'Uploading without a known progress.',
        'data-leaving': 'Fading out after Remove (with onRemove).',
      },
      cssVars: { '--hj-attachment-max-width': 'Chip width cap. Default 260px.' },
    },
    {
      name: 'Icon',
      element: 'span',
      slot: 'Attachment.Icon',
      className: 'hj-attachment-icon',
      description:
        '32px tile with the kind’s glyph, tinted from the data palette; an alert on error.',
      props: props<IconOwnProps>({
        kind: { type: 'AttachmentKind', description: 'Override the kind.' },
      }),
    },
    {
      name: 'Name',
      element: 'span',
      slot: 'Attachment.Name',
      className: 'hj-attachment-name',
      description: 'File name, ellipsised; full name in the title.',
    },
    {
      name: 'Meta',
      element: 'span',
      slot: 'Attachment.Meta',
      className: 'hj-attachment-meta',
      description: 'Size (formatBytes), pages, or the error in words.',
    },
    {
      name: 'Remove',
      element: 'button',
      base: 'Button',
      slot: 'Attachment.Remove',
      className: 'hj-attachment-remove',
      description:
        '✕ with a 44px hit area. Also cancels an upload. With `onRemove`, the attachment fades out first and focus moves to a neighbour’s ✕.',
      props: props<RemoveOwnProps>({
        label: { type: 'string', default: '`Remove ${name}`', description: 'Accessible label.' },
        onRemove: {
          type: '() => void',
          description:
            'Called after the fade (180 ms) — remove the file from your state here. `onClick` still fires at once.',
        },
      }),
    },
    {
      name: 'Progress',
      element: 'span',
      slot: 'Attachment.Progress',
      className: 'hj-attachment-progress',
      description:
        '2px bar on the bottom edge while uploading: scaleX fill, or a sweep when indeterminate.',
    },
    {
      name: 'List',
      element: 'div',
      slot: 'Attachment.List',
      className: 'hj-attachment-list',
      description: 'Wrapping row of chips; when one leaves, the rest glide into place (FLIP).',
    },
  ],
  examples: [
    {
      file: 'composer',
      title: 'In the composer',
      description: 'One uploading, one ready, one too large.',
    },
    { file: 'kinds', title: 'Kinds', description: 'The glyph follows the file type.' },
  ],
  accessibility: [
    'Each chip is a group named by its file; Remove says which file it removes.',
    'aria-busy while uploading. Put the error in Meta as words — the tint is not the message.',
  ],
  motion:
    'A chip scales in from .96 on gentle, clamped. Removing (onRemove) fades it and shrinks it to .94 on the fast clock, then the rest of the List glide into place on snappy, clamped — translate only. The upload bar fills by scaleX on snappy, clamped; indeterminate sweeps as ambient motion (stops under reduced motion).',
  tokens: [
    'surface',
    'line',
    'accent',
    'danger',
    'danger-soft',
    'data-1',
    'data-2',
    'data-3',
    'data-4',
    'radius-sm',
  ],
  related: ['prompt-input', 'message'],
});
