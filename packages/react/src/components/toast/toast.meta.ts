import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { CloseOwnProps, ItemOwnProps, ShowOptions, ViewportOwnProps } from './toast.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Toast',
  slug: 'toast',
  category: 'surfaces',
  status: 'stable',
  description:
    'A brief, announced message about something that just happened, with at most one action.',
  whenToUse: [
    'Confirming an action the user took: Saved offline, Added to queue.',
    'Offering Undo right after an undoable change.',
    'A background failure the user should know about now (danger tone).',
  ],
  whenNotToUse: [
    'Something that must be acted on — use AlertDialog or a Banner that stays.',
    'Form validation — use Field.Error next to the field.',
  ],
  import: "import { Toast, useToast, createToaster } from '@hanji/react';",
  parts: [
    {
      name: 'Provider',
      element: '(none)',
      base: 'Toast.Provider',
      slot: 'Toast.Provider',
      className: '',
      description:
        'Holds the queue. Defaults: limit 3, timeout 3200 ms. Pass toastManager from createToaster() to show toasts from outside React.',
    },
    {
      name: 'Viewport',
      element: 'div',
      base: 'Toast.Viewport',
      slot: 'Toast.Viewport',
      className: 'hj-toast-viewport',
      description:
        'The portalled stack (an F6 landmark). With no children it renders each toast as Toast.Item.',
      props: props<ViewportOwnProps>({
        placement: {
          type: "'bottom' | 'bottom-end'",
          default: "'bottom'",
          description: 'Centre bottom, or bottom right.',
        },
      }),
      cssVars: { '--hj-toast-width': 'Stack width. Default 400px.' },
    },
    {
      name: 'Item',
      element: 'div',
      slot: 'Toast.Root',
      className: 'hj-toast',
      description:
        'hanji’s default toast: tone glyph, title, description, optional action, dismiss ✕.',
      props: props<ItemOwnProps>({
        toast: { type: 'ToastObject', description: 'One entry from useToastManager().toasts.' },
      }),
    },
    {
      name: 'Root',
      element: 'div',
      base: 'Toast.Root',
      slot: 'Toast.Root',
      className: 'hj-toast',
      description: 'One toast (for custom renderers). Stacks via Base UI’s --toast-index.',
      dataAttributes: {
        'data-tone': 'neutral | success | danger',
        'data-expanded': 'The stack is fanned out (hover/focus).',
        'data-swiping': 'Being swiped.',
        'data-limited': 'Over the limit; hidden.',
      },
      cssVars: {
        '--hj-toast-gap': 'Gap between expanded toasts. Default 8px.',
        '--hj-toast-peek': 'How much older toasts peek when collapsed. Default 8px.',
      },
    },
    {
      name: 'Content',
      element: 'div',
      base: 'Toast.Content',
      slot: 'Toast.Content',
      className: 'hj-toast-content',
      description: 'Row layout; fades out behind the newest toast.',
    },
    {
      name: 'Title',
      element: 'h2',
      base: 'Toast.Title',
      slot: 'Toast.Title',
      className: 'hj-toast-title',
      description: 'What happened.',
    },
    {
      name: 'Description',
      element: 'p',
      base: 'Toast.Description',
      slot: 'Toast.Description',
      className: 'hj-toast-description',
      description: 'Detail, one line.',
    },
    {
      name: 'Action',
      element: 'button',
      base: 'Toast.Action',
      slot: 'Toast.Action',
      className: 'hj-toast-action',
      description: 'The one action (Undo, Retry).',
    },
    {
      name: 'Close',
      element: 'button',
      base: 'Toast.Close',
      slot: 'Toast.Close',
      className: 'hj-toast-close',
      description: 'Dismiss; with no children renders ✕ labelled with strings.dismiss.',
      props: props<CloseOwnProps>({
        icon: { type: 'boolean', default: 'children === undefined', description: 'Icon variant.' },
      }),
    },
    {
      name: 'useToast / createToaster',
      element: '(function)',
      slot: 'Toast.Root',
      className: 'hj-toast',
      description: 'show / success / danger / update / close. show() takes ShowOptions.',
      props: props<ShowOptions>({
        title: { type: 'ReactNode', description: 'What happened, in a few words.' },
        description: { type: 'ReactNode', description: 'One line of detail.' },
        tone: {
          type: "'neutral' | 'success' | 'danger'",
          default: "'neutral'",
          description: 'Glyph and announcement priority (danger is urgent).',
        },
        action: {
          type: '{ label: ReactNode; onClick: () => void }',
          description: 'One action; adds 1800 ms to the timer.',
        },
        timeout: {
          type: 'number',
          default: '3200 (5000 with an action)',
          description: 'ms before dismissal; 0 keeps it; never under 1200.',
        },
        id: { type: 'string', description: 'Re-using an id updates that toast in place.' },
        onClose: { type: '() => void', description: 'Called when it closes.' },
      }),
    },
  ],
  examples: [
    {
      file: 'undo',
      title: 'Undo',
      description: 'Remove a track, offer Undo; tones for success and failure.',
    },
    {
      file: 'progress',
      title: 'Updating in place',
      description: 'One toast that goes from “Exporting…” to done — or failed with Retry.',
    },
  ],
  accessibility: [
    'Announced through a live region: polite for neutral and success, assertive for danger.',
    'F6 moves focus into the toast region; timers pause while hovered or focused.',
    'Swipe down or sideways to dismiss; the ✕ always works.',
  ],
  motion:
    'Arrives rising 12 px with a fade on gentle, clamped; older toasts scale back 5% each and peek 8 px; hover fans them out. Leaves in 180 ms, or flies off in the swipe direction. Reduced motion: fades only.',
  tokens: [
    'surface-2',
    'line',
    'success',
    'danger',
    'accent-soft',
    'radius-md',
    'ease-gentle-settle',
    'rise',
    'travel',
  ],
  related: ['banner', 'alert-dialog'],
  baseUi: 'toast',
});
