import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ContentOwnProps, PopupOwnProps } from './alert-dialog.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'AlertDialog',
  slug: 'alert-dialog',
  category: 'surfaces',
  status: 'stable',
  description:
    'A confirm that must be answered: says what will happen to what, and offers at most two choices.',
  whenToUse: [
    'Before something destructive or expensive: delete, sign out of every device, discard edits.',
  ],
  whenNotToUse: [
    'Anything undoable — act, then offer Undo in a Toast.',
    'A form — use Dialog.',
    'Information — use Banner or Toast.',
  ],
  import: "import { AlertDialog } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: '(none)',
      base: 'AlertDialog.Root',
      slot: 'AlertDialog.Root',
      className: '',
      description: 'State owner: open, onOpenChange. Outside presses never close it.',
    },
    {
      name: 'Trigger',
      element: 'button',
      base: 'AlertDialog.Trigger',
      slot: 'AlertDialog.Trigger',
      className: 'hj-alert-dialog-trigger',
      description: 'Opens the confirm.',
    },
    {
      name: 'Portal',
      element: '(portal)',
      base: 'AlertDialog.Portal',
      slot: 'AlertDialog.Portal',
      className: '',
      description: 'Portals and re-applies the nearest Theme.',
    },
    {
      name: 'Backdrop',
      element: 'div',
      base: 'AlertDialog.Backdrop',
      slot: 'AlertDialog.Backdrop',
      className: 'hj-alert-dialog-backdrop',
      description: 'Black scrim at .55.',
      cssVars: { '--hj-alert-dialog-scrim': 'Scrim opacity.' },
    },
    {
      name: 'Popup',
      element: 'div',
      base: 'AlertDialog.Popup',
      slot: 'AlertDialog.Popup',
      className: 'hj-alert-dialog-popup',
      description: 'role="alertdialog". No corner ✕ — the user must choose.',
      props: props<PopupOwnProps>({
        size: { type: "'sm' | 'md'", default: "'sm'", description: 'Width 380 / 480.' },
        tone: {
          type: "'default' | 'danger'",
          default: "'default'",
          description: 'danger leads with the alert glyph on a danger tint.',
        },
      }),
      dataAttributes: { 'data-size': 'sm | md', 'data-tone': 'danger' },
      cssVars: { '--hj-alert-dialog-width': 'Max width.' },
    },
    {
      name: 'Content',
      element: '(portal)',
      slot: 'AlertDialog.Popup',
      className: 'hj-alert-dialog-popup',
      description: 'Shorthand: Portal + Backdrop + Popup. Takes Popup props.',
      props: props<ContentOwnProps>({
        container: { type: 'HTMLElement | ShadowRoot | RefObject', description: 'Portal target.' },
        keepMounted: {
          type: 'boolean',
          default: 'false',
          description: 'Keep in the DOM while closed.',
        },
      }),
    },
    {
      name: 'Title',
      element: 'h2',
      base: 'AlertDialog.Title',
      slot: 'AlertDialog.Title',
      className: 'hj-alert-dialog-title',
      description: 'The question, with the object named.',
    },
    {
      name: 'Description',
      element: 'p',
      base: 'AlertDialog.Description',
      slot: 'AlertDialog.Description',
      className: 'hj-alert-dialog-description',
      description: 'What happens to what, and what is kept.',
    },
    {
      name: 'Actions',
      element: 'div',
      slot: 'AlertDialog.Actions',
      className: 'hj-alert-dialog-actions',
      description: 'At most two: safe first, consequence last.',
    },
    {
      name: 'Close',
      element: 'button',
      base: 'AlertDialog.Close',
      slot: 'AlertDialog.Close',
      className: 'hj-alert-dialog-close',
      description: 'Each choice; render as Button.',
    },
  ],
  examples: [
    {
      file: 'delete',
      title: 'Destructive confirm',
      description: 'Name the object, say what is kept, verb on the button.',
    },
    {
      file: 'sign-out',
      title: 'Expensive, not destructive',
      description: 'Sign out everywhere — with a busy state while it happens.',
    },
  ],
  accessibility: [
    'role="alertdialog"; focus moves to the first focusable choice and is trapped.',
    'Escape cancels; outside presses do nothing.',
    'The danger glyph is decorative; the title and the verb carry the meaning.',
  ],
  motion: 'As Dialog: scale .94 → 1 on snappy, clamped; leaves in 180 ms; the scrim follows.',
  tokens: ['surface-2', 'line', 'scrim', 'danger', 'danger-soft', 'radius-lg', 'type-title'],
  related: ['dialog', 'toast', 'button'],
  baseUi: 'alert-dialog',
});
