import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { CloseOwnProps, ContentProps, PopupOwnProps } from './dialog.tsx';

type ContentOwnProps = Pick<ContentProps, 'backdrop' | 'container' | 'keepMounted'>;

export const meta: ComponentMeta = defineMeta({
  name: 'Dialog',
  slug: 'dialog',
  category: 'surfaces',
  status: 'stable',
  description: 'A centred question or short task that stops the page until it is answered.',
  whenToUse: [
    'A decision with consequences the user must confirm (for destructive confirms prefer AlertDialog).',
    'A short, focused form (rename, invite) that must finish before going back.',
  ],
  whenNotToUse: [
    'Options or detail that keep the page in view — use Sheet.',
    'Information that needs no answer — use Toast or Banner.',
    'More than two actions — rethink the task.',
  ],
  import: "import { Dialog } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: '(none)',
      base: 'Dialog.Root',
      slot: 'Dialog.Root',
      className: '',
      description: 'State owner: open, onOpenChange, modal, defaultOpen.',
    },
    {
      name: 'Trigger',
      element: 'button',
      base: 'Dialog.Trigger',
      slot: 'Dialog.Trigger',
      className: 'hj-dialog-trigger',
      description: 'Opens the dialog. Compose with Button via render.',
    },
    {
      name: 'Portal',
      element: '(portal)',
      base: 'Dialog.Portal',
      slot: 'Dialog.Portal',
      className: '',
      description: 'Portals to body and re-applies the nearest Theme (paper, accent, density).',
    },
    {
      name: 'Backdrop',
      element: 'div',
      base: 'Dialog.Backdrop',
      slot: 'Dialog.Backdrop',
      className: 'hj-dialog-backdrop',
      description: 'Black scrim at .55 on every paper.',
      cssVars: { '--hj-dialog-scrim': 'Scrim opacity. Default .55.' },
    },
    {
      name: 'Popup',
      element: 'div',
      base: 'Dialog.Popup',
      slot: 'Dialog.Popup',
      className: 'hj-dialog-popup',
      description: 'The surface. Max 380/480/640 wide, surface-2 with a hairline.',
      props: props<PopupOwnProps>({
        size: {
          type: "'sm' | 'md' | 'lg'",
          default: "'sm'",
          description: 'Width 380 / 480 / 640.',
        },
      }),
      dataAttributes: {
        'data-size': 'sm | md | lg',
        'data-starting-style': 'While entering (Base UI).',
        'data-ending-style': 'While leaving (Base UI).',
        'data-nested-dialog-open': 'A child dialog is open (Base UI).',
      },
      cssVars: {
        '--hj-dialog-width': 'Max width.',
        '--hj-dialog-radius': 'Corner radius. Default radius-lg.',
        '--hj-dialog-padding': 'Inner padding. Default 24px.',
        '--nested-dialogs': 'Count of open children (Base UI, read-only).',
      },
    },
    {
      name: 'Content',
      element: '(portal)',
      slot: 'Dialog.Popup',
      className: 'hj-dialog-popup',
      description: 'Shorthand: Portal + Backdrop + Popup. Takes Popup props.',
      props: props<ContentOwnProps>({
        backdrop: { type: 'boolean', default: 'true', description: 'Draw the scrim.' },
        container: {
          type: 'HTMLElement | ShadowRoot | RefObject',
          description: 'Portal target. Default body.',
        },
        keepMounted: {
          type: 'boolean',
          default: 'false',
          description: 'Keep the popup in the DOM while closed.',
        },
      }),
    },
    {
      name: 'Title',
      element: 'h2',
      base: 'Dialog.Title',
      slot: 'Dialog.Title',
      className: 'hj-dialog-title',
      description: 'Labels the dialog (aria-labelledby).',
    },
    {
      name: 'Description',
      element: 'p',
      base: 'Dialog.Description',
      slot: 'Dialog.Description',
      className: 'hj-dialog-description',
      description: 'Says what happens to what (aria-describedby).',
    },
    {
      name: 'Actions',
      element: 'div',
      slot: 'Dialog.Actions',
      className: 'hj-dialog-actions',
      description: 'Footer row for at most two actions, right-aligned.',
    },
    {
      name: 'Close',
      element: 'button',
      base: 'Dialog.Close',
      slot: 'Dialog.Close',
      className: 'hj-dialog-close',
      description: 'Closes. With no children, renders the corner ✕ with an accessible label.',
      props: props<CloseOwnProps>({
        icon: {
          type: 'boolean',
          default: 'children === undefined',
          description: 'Render as the corner icon button.',
        },
      }),
      dataAttributes: { 'data-icon': 'Present for the corner icon variant.' },
    },
  ],
  examples: [
    {
      file: 'confirm',
      title: 'Confirm',
      description: 'A destructive confirm with the safe action first.',
    },
    { file: 'form', title: 'Form in a dialog', description: 'Rename a playlist; Enter submits.' },
  ],
  accessibility: [
    'Focus moves into the popup on open and returns to the trigger on close; Tab is trapped while modal.',
    'Escape and an outside press close it (configurable on Root).',
    'Title and Description are wired to aria-labelledby / aria-describedby automatically.',
  ],
  motion:
    'Enters from scale .94 + fade on snappy, clamped (no wobble — focus waits on it). Leaves in 180 ms to scale .97. The scrim follows. Nested dialogs step back 10px and 5%.',
  tokens: [
    'surface-2',
    'line',
    'scrim',
    'radius-lg',
    'type-title',
    'ease-snappy-settle',
    'dur-fast',
  ],
  related: ['alert-dialog', 'sheet', 'popover'],
  baseUi: 'dialog',
});
