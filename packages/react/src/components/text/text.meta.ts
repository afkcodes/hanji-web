import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { TextOwnProps } from './text.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Text',
  slug: 'text',
  category: 'atoms',
  status: 'new',
  description:
    'Text set in one of hanji’s type roles, from the hero number down to the mono timecode.',
  whenToUse: [
    'Any copy that should follow the type scale: titles, body, help lines, eyebrows, values.',
    'Numbers that tick or line up in columns — hero and mono set tabular numerals.',
  ],
  whenNotToUse: [
    'Long-form prose with its own stylesheet — style it with the --hj-type-* tokens directly.',
    'A component’s own label — components set their own type.',
  ],
  import: "import { Text } from '@hanji/react';",
  parts: [
    {
      name: 'Text',
      element: 'p | h1–h4 | span (by variant)',
      slot: 'Text',
      className: 'hj-text',
      description:
        'One element in a type role. Defaults: display h1, title h2, heading h3, subheading h4, body/sub/hero p, label/eyebrow/mono span — override with render.',
      props: props<TextOwnProps>({
        variant: {
          type: "'hero' | 'display' | 'title' | 'heading' | 'subheading' | 'body' | 'sub' | 'label' | 'eyebrow' | 'mono'",
          default: "'body'",
          description:
            'hero 44/46 · display 34/38 · title 22/26 · heading 19/24 · subheading 18/23 · body 15/20 · sub 12.5/17 · label 11/14 · eyebrow 10/12 caps · mono 12.5/17 tabular.',
        },
        tone: {
          type: "'fg' | 'dim' | 'mute' | 'accent' | 'danger' | 'success'",
          description: 'Ink. Omitted = inherit. Keep mute for plain surfaces, never over imagery.',
        },
        truncate: { type: 'boolean', default: 'false', description: 'One line with an ellipsis.' },
        render: {
          type: 'ReactElement | (props, state) => ReactElement',
          description: 'Replace the element, e.g. render={<h1 />} for the page title.',
        },
      }),
      dataAttributes: {
        'data-variant': 'The type role.',
        'data-tone': 'The ink, when set.',
        'data-truncate': 'Present when truncating.',
      },
      cssVars: { '--hj-text-color': 'Overrides the tone colour.' },
    },
  ],
  examples: [
    { file: 'roles', title: 'Roles', description: 'Every role with real copy, from hero to mono.' },
    {
      file: 'tones',
      title: 'Tones and truncation',
      description: 'Ink tones on a row, and a long title clipped to one line.',
    },
  ],
  accessibility: [
    'Pick the heading level with render so the page outline stays correct; the default tags are a convenience, not a hierarchy.',
    'Eyebrows are uppercased with CSS, so screen readers read the words, not letters.',
  ],
  tokens: ['type-*', 'tracking-*', 'fg', 'fg-dim', 'fg-mute', 'accent', 'danger', 'success'],
  related: ['link', 'kbd', 'status'],
});
