import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type {
  ActionOwnProps,
  ContentOwnProps,
  GroupOwnProps,
  RootOwnProps,
  TrayOwnProps,
} from './swipe-actions.tsx';

const tray = props<TrayOwnProps>({
  fullSwipe: {
    type: 'boolean',
    default: 'false',
    description:
      'A swipe past the point of no return commits the outermost action (first in Leading, last in Trailing): it takes the whole gap, deepens, and fires on release.',
  },
  render: { type: 'RenderProp', description: 'Render as another element.' },
});

export const meta: ComponentMeta = defineMeta({
  name: 'SwipeActions',
  slug: 'swipe-actions',
  category: 'data',
  status: 'new',
  description:
    'A row that slides aside to reveal actions underneath (iOS Mail style), on an interruptible spring — by finger, pen, mouse or a two-finger trackpad swipe — with a full swipe that commits, and a More menu that is the same actions for everyone who doesn’t swipe.',
  whenToUse: [
    'Two or three quick verbs on rows of a list people triage: mail, notifications, downloads, a to-do list.',
    'A destructive verb that should be fast but never accidental: put it behind the swipe and offer Undo.',
  ],
  whenNotToUse: [
    'The only way to do something — every action must also be reachable another way (the More menu is built in).',
    'More than three actions a side; use a Menu or a detail screen.',
    'Desktop-first tables — use row selection and a toolbar (DataTable).',
    'Rows that already scroll or drag sideways (carousels, sliders, DragList).',
  ],
  import: "import { SwipeActions } from '@hanji/react';",
  parts: [
    {
      name: 'Group',
      element: 'ul',
      slot: 'SwipeActions.Group',
      className: 'hj-swipe-actions-group',
      description:
        'The list. Only one row open at a time; a tap on another row only closes the open one. When a row leaves, the rows below glide up (FLIP, translate only). Owns the live region, so announcements outlive the row that made them.',
      props: props<GroupOwnProps>({
        divided: {
          type: 'boolean',
          default: 'true',
          description: 'Hairlines between rows, from --hj-swipe-actions-inset.',
        },
        render: { type: 'RenderProp', description: 'Render as another element.' },
      }),
      dataAttributes: { 'data-divided': 'Hairlines between rows.' },
    },
    {
      name: 'Root',
      element: 'li (in a Group) · div',
      slot: 'SwipeActions.Root',
      className: 'hj-swipe-actions',
      description:
        'One row: Content on top, Leading and Trailing beneath (as direct children; write them Leading, Content, Trailing). Owns the gesture and the springs. Closes on a press outside, a scroll of anything holding it, Escape, or focus leaving it.',
      props: props<RootOwnProps>({
        open: {
          type: "'leading' | 'trailing' | null",
          description: 'The open side (controlled).',
        },
        defaultOpen: {
          type: "'leading' | 'trailing' | null",
          default: 'null',
          description: 'The open side to start with (uncontrolled).',
        },
        onOpenChange: {
          type: "(open: 'leading' | 'trailing' | null, details: { reason }) => void",
          description:
            "The open side changed. reason: 'swipe' | 'tap' | 'focus' | 'outside' | 'scroll' | 'escape' | 'group' | 'action'. A controlled parent that keeps `open` puts the row back.",
        },
        disabled: {
          type: 'boolean',
          default: 'false',
          description: 'Locked: no swipe, every action off, the More button disabled.',
        },
        label: {
          type: 'string',
          description:
            'What the row is (“Quarterly numbers, Ilse Brandt”): names the More button and the commit announcement.',
        },
        render: { type: 'RenderProp', description: 'Render as another element.' },
      }),
      dataAttributes: {
        'data-open': "The open side: 'leading' | 'trailing'.",
        'data-revealing': 'The side currently showing (during a drag or a settle).',
        'data-dragging': 'A finger or pointer holds the row.',
        'data-armed': 'Past the point of no return: letting go commits.',
        'data-removing': 'A removal is fading the row out.',
        'data-disabled': 'Locked.',
      },
      cssVars: {
        '--hj-swipe-actions-bg':
          'The row’s paper (content and tint base). Default --hj-bg; set it to --hj-surface on a card.',
        '--hj-swipe-actions-inset': 'Where the hairline starts. Default 16px.',
      },
    },
    {
      name: 'Content',
      element: 'div',
      slot: 'SwipeActions.Content',
      className: 'hj-swipe-actions-content',
      description:
        'The row itself (56 tall, flex, padded 16): follows the finger with touch-action: pan-y, so vertical scrolling still works. Tapping it while open closes the row instead of activating it. `render={<a href />}` makes the row a link. Text is not selectable (it is a drag surface).',
      props: props<ContentOwnProps>({
        more: {
          type: 'boolean',
          default: 'true',
          description:
            'Render SwipeActions.More at the end of the row. Turn off only to place your own More.',
        },
        render: { type: 'RenderProp', description: 'Render as another element.' },
      }),
      cssVars: {
        '--hj-swipe-actions-row-height': 'Minimum row height. Default 56px (scales with density).',
      },
    },
    {
      name: 'Leading',
      element: 'div',
      slot: 'SwipeActions.Leading',
      className: 'hj-swipe-actions-tray',
      description:
        'Actions revealed by swiping toward the end edge (right in LTR). The first is outermost: the one a full swipe commits.',
      props: tray,
      dataAttributes: {
        'data-side': "'leading'",
        'data-full-swipe': 'A full swipe commits the outermost action.',
      },
    },
    {
      name: 'Trailing',
      element: 'div',
      slot: 'SwipeActions.Trailing',
      className: 'hj-swipe-actions-tray',
      description:
        'Actions revealed by swiping toward the start edge (left in LTR). The last is outermost: the one a full swipe commits.',
      props: tray,
      dataAttributes: {
        'data-side': "'trailing'",
        'data-full-swipe': 'A full swipe commits the outermost action.',
      },
    },
    {
      name: 'Action',
      element: 'button',
      slot: 'SwipeActions.Action',
      className: 'hj-swipe-actions-action',
      description:
        'A real button: glyph over verb on a tone tint, 76 wide, the row’s full height. Out of the tab order while its side is closed; focusing it opens its side. Children are the verb (keep it one word).',
      props: props<ActionOwnProps>({
        onAction: {
          type: '() => void',
          description:
            'Runs when chosen — tapped, picked from More, or committed by a full swipe. Non-removing actions then close the row.',
        },
        tone: {
          type: "'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger'",
          default: "'neutral'",
          description:
            'The tint. info for read/unread, warning for flag, success for archive, danger for delete. Always a tint — danger is never solid.',
        },
        icon: {
          type: 'IconName | ReactNode',
          description: "An adapter icon name ('check') or an <svg> on a 24 grid; drawn at 20px.",
        },
        removes: {
          type: 'boolean',
          default: 'false',
          description:
            'It takes the row away (archive, delete): the row slides out, fades, then onAction fires — drop the item from state there and offer Undo. If the item stays, the row comes back closed.',
        },
        announce: {
          type: 'string',
          description:
            "Live-region text after a full swipe commits it. Default HanjiStrings.swipeActionDone(verb, label); '' says nothing.",
        },
        render: { type: 'RenderProp', description: 'Render as another element.' },
      }),
      dataAttributes: {
        'data-tone': 'The tint.',
        'data-armed': 'This action will commit when the finger lifts.',
        'data-removes': 'Takes the row away.',
      },
      cssVars: {
        '--hj-swipe-actions-action-width': 'Default 76px.',
      },
    },
    {
      name: 'More',
      element: 'button',
      base: 'Menu.Trigger',
      slot: 'SwipeActions.More',
      className: 'hj-swipe-actions-more',
      description:
        'The ⋯ button (44 round) that opens every action of the row in a Menu — leading, then trailing, danger last — and runs them exactly like a swipe would. Content renders one. It sits over the row’s end on the row’s own paper (a short fade lets the text run under it), so it takes no room: with a mouse it shows on hover and focus, on touch screens it is visually hidden until focused, and it steps aside while the row is moving. It opens on click, not on press, so a swipe that starts on it never opens it.',
    },
  ],
  examples: [
    {
      file: 'inbox',
      title: 'Inbox',
      description:
        'Swipe right to mark read; left for Flag and Archive. A full swipe left archives, with Undo.',
    },
    {
      file: 'downloads',
      title: 'Full swipe deletes',
      description:
        'One danger action that commits on a full swipe; the rows below glide up and Undo puts it back.',
    },
    {
      file: 'locked',
      title: 'Locked rows',
      description:
        'A submitted claim is locked (no swipe, More disabled); an approved one can’t be deleted.',
    },
  ],
  accessibility: [
    'Every action is a real <button> in the DOM, in reading order after the row. While its side is closed it is out of the tab order (tabindex -1) but still in the accessibility tree; focusing it (a screen reader can) opens its side, so it is never hidden behind the row.',
    'The twin: a More button (a Menu) at the end of every row lists the same actions with the same glyphs and runs them the same way — one tab stop per row, named “More actions for {label}”. Swiping is never the only way.',
    'Once a row is open its actions join the tab order. Escape closes it and returns focus to the More button; focus leaving the row closes it.',
    'Trackpads: a two-finger sideways swipe moves the row exactly like a finger (same rubber band, same point of no return) and settles when the wheel events pause; vertical scrolls and pinch-zoom pass through, and RTL mirrors both.',
    'A full-swipe commit is announced politely (HanjiStrings.swipeActionDone, or `announce`). Group holds the live region, so the announcement survives the row being removed.',
    'When a removing action runs with focus inside the row, focus moves to the next row (or the previous one) once the row is gone.',
    'touch-action: pan-y keeps vertical scrolling native; the gesture only takes over once a move is clearly sideways (8px, more x than y).',
    'Under reduced motion the row tracks the finger but never rubber-bands; actions lie still under it and fade in, springs settle in ~40ms, and a removal is a fade with no slide.',
  ],
  motion:
    'DOM-direct springs (useSpring’s SpringValue), no React in the loop. The row follows the finger 1:1 to the actions’ width, then rubber-bands (the iOS curve). Released, it settles on snappy carrying the finger’s velocity (capped at 1600 px/s): open when flung outward or past half the actions, else closed — closing is clamped so it never pokes past the other side. While it moves the actions spread out of the gap in proportion, their glyphs riding the centre of their slice and fading in. The one considered detail is the point of no return: past about half the row the outermost action takes the whole gap on its own snappy spring, its tint deepens and its glyph lifts ×1.08 and rides the row’s edge; back inside 16px of the line it lets go. A removal slides the row out on clamped snappy, fades it on --hj-dur-fast (exits are fast), then Group’s FLIP glides the rows below into place.',
  tokens: [
    'bg',
    'fg',
    'fg-mute',
    'line',
    'focus',
    'accent',
    'info',
    'success',
    'warning',
    'danger',
    'touch',
    'radius-pill',
    'type-label',
    'tracking-label',
    'dur-fast',
    'dur-base',
    'ease-out',
    'travel',
    'dur-snappy-settle',
    'ease-snappy-settle',
  ],
  related: ['list', 'menu', 'toast', 'drag-list'],
});
