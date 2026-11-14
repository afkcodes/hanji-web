import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type {
  ActionOwnProps,
  CopyOwnProps,
  FeedbackOwnProps,
  RegenerateOwnProps,
  RootOwnProps,
} from './message-actions.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'MessageActions',
  slug: 'message-actions',
  category: 'ai',
  status: 'new',
  description: 'The small icon actions under an assistant reply: copy, regenerate, rate, more.',
  whenToUse: ['Under each assistant message, in Message.Footer.'],
  whenNotToUse: [
    'Primary actions the person must take — use Button.',
    'Actions on a person’s own message (edit) — put a menu in the bubble.',
  ],
  import: "import { MessageActions } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      slot: 'MessageActions.Root',
      className: 'hj-message-actions',
      description:
        'role="toolbar". Hidden until its Message is hovered or focused, on pointer devices.',
      props: props<RootOwnProps>({
        text: {
          type: 'string | (() => string)',
          description:
            'What Copy writes. A function is read at copy time (use it while streaming).',
        },
        reveal: {
          type: "'hover' | 'always'",
          default: "'hover'",
          description:
            'hover = hidden until the message is hovered/focused (touch devices always show).',
        },
      }),
      dataAttributes: { 'data-reveal': 'hover | always' },
      cssVars: { '--hj-message-actions-size': 'Button size. Default 32px (44px hit area).' },
    },
    {
      name: 'Copy',
      element: 'button',
      base: 'Button',
      slot: 'MessageActions.Copy',
      className: 'hj-message-actions-button',
      description:
        'Copies the text; the glyph becomes a check that draws itself and “Copied” is announced.',
      props: props<CopyOwnProps>({
        text: { type: 'string | (() => string)', description: 'Override the Root text.' },
        onCopied: { type: '() => void', description: 'After a successful copy.' },
      }),
      dataAttributes: { 'data-copied': 'For 1.6 s after copying.' },
    },
    {
      name: 'Regenerate',
      element: 'button',
      base: 'Button',
      slot: 'MessageActions.Regenerate',
      className: 'hj-message-actions-button',
      description: 'Ask for a new answer. The arrow turns a quarter while pressed.',
      props: props<RegenerateOwnProps>({
        label: { type: 'string', default: "'Regenerate'", description: 'Accessible label.' },
      }),
    },
    {
      name: 'Feedback',
      element: 'div',
      base: 'Toggle',
      slot: 'MessageActions.Feedback',
      className: 'hj-message-actions-feedback',
      description: 'Thumbs up/down toggles; at most one is pressed, pressing it again clears.',
      props: props<FeedbackOwnProps>({
        value: { type: "'up' | 'down' | null", description: 'Controlled rating.' },
        defaultValue: {
          type: "'up' | 'down' | null",
          default: 'null',
          description: 'Uncontrolled initial rating.',
        },
        onValueChange: {
          type: "(value: 'up' | 'down' | null) => void",
          description: 'Rating changed.',
        },
        labels: {
          type: '{ up: string; down: string }',
          default: "{ up: 'Good response', down: 'Bad response' }",
          description: 'Accessible labels.',
        },
      }),
      dataAttributes: {
        'data-pressed': 'On the pressed thumb (Base UI).',
        'data-feedback': 'up | down',
      },
    },
    {
      name: 'Action',
      element: 'button',
      base: 'Button',
      slot: 'MessageActions.Action',
      className: 'hj-message-actions-button',
      description: 'Any other icon action — a Menu trigger for “More”, Share, Read aloud.',
      props: props<ActionOwnProps>({
        label: { type: 'string', description: 'Required accessible label (also the title).' },
      }),
    },
    {
      name: 'Separator',
      element: 'span',
      slot: 'MessageActions.Separator',
      className: 'hj-message-actions-separator',
      description: 'A hairline between groups.',
    },
  ],
  examples: [
    {
      file: 'actions',
      title: 'Under a reply',
      description: 'Copy, regenerate, rating and a More menu slot.',
    },
    {
      file: 'always',
      title: 'Always visible',
      description: 'For touch-first layouts and the latest reply.',
    },
  ],
  accessibility: [
    'role="toolbar" with a label; every button is icon-only with an aria-label and a title.',
    'Feedback toggles expose aria-pressed; Copy announces “Copied” through a polite live region.',
    'Hover-reveal never hides the actions from keyboard users: focus inside the message shows them, and touch devices always show them.',
  ],
  motion:
    'Reveal is a fade (base in, fast out). Press dips to .9. A pressed thumb pops once on bouncy; the copy check draws in 400 ms.',
  tokens: ['fg-mute', 'fg', 'accent', 'success', 'line', 'ease-bouncy', 'dur-slow'],
  related: ['message', 'menu'],
});
