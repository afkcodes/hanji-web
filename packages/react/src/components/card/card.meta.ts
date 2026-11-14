import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { MediaOwnProps, RootOwnProps } from './card.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Card',
  slug: 'card',
  category: 'surfaces',
  status: 'stable',
  description: 'A surface for one thing — an album, an episode, an article — usually a link to it.',
  whenToUse: [
    'A grid or shelf of things with art: albums, episodes, collections.',
    'One featured item that links to its page.',
  ],
  whenNotToUse: [
    'Grouping settings or form sections — use plain rows and a hairline.',
    'Stacking every section of a page in boxes — compose the page instead.',
  ],
  import: "import { Card } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      slot: 'Card.Root',
      className: 'hj-card',
      description: 'surface + hairline, radius md. Render as <a> or <button> when pressable.',
      props: props<RootOwnProps>({
        pressable: {
          type: 'boolean',
          default: 'false',
          description: 'One target: hover steps up a paper, press dips to .97.',
        },
        orientation: {
          type: "'vertical' | 'horizontal'",
          default: "'vertical'",
          description: 'Media on top, or a compact row with square media.',
        },
      }),
      dataAttributes: {
        'data-pressable': 'Interactive.',
        'data-orientation': 'vertical | horizontal',
      },
      cssVars: {
        '--hj-card-radius': 'Corner radius. Default radius-md.',
        '--hj-card-padding': 'Body padding.',
        '--hj-card-media-size': 'Media width in horizontal cards. Default 88px.',
      },
    },
    {
      name: 'Media',
      element: 'div',
      slot: 'Card.Media',
      className: 'hj-card-media',
      description: 'Full-bleed image or art at a fixed ratio.',
      props: props<MediaOwnProps>({
        ratio: {
          type: "'16:9' | '4:3' | '1:1' | '3:4'",
          default: "'16:9'",
          description: 'Aspect ratio.',
        },
      }),
    },
    {
      name: 'Body',
      element: 'div',
      slot: 'Card.Body',
      className: 'hj-card-body',
      description: 'Padded text column.',
    },
    {
      name: 'Eyebrow',
      element: 'p',
      slot: 'Card.Eyebrow',
      className: 'hj-card-eyebrow',
      description: 'Small caps label above the title.',
    },
    {
      name: 'Title',
      element: 'h3',
      slot: 'Card.Title',
      className: 'hj-card-title',
      description: 'Heading role; change the level with render.',
    },
    {
      name: 'Description',
      element: 'p',
      slot: 'Card.Description',
      className: 'hj-card-description',
      description: 'Two lines at most.',
    },
    {
      name: 'Footer',
      element: 'div',
      slot: 'Card.Footer',
      className: 'hj-card-footer',
      description: 'Counts, time, a quiet action; tabular numerals.',
    },
  ],
  examples: [
    {
      file: 'shelf',
      title: 'A shelf of links',
      description: 'Pressable cards rendered as links; one with no art yet.',
    },
    {
      file: 'row',
      title: 'Compact row',
      description: 'Horizontal cards for a sidebar or a search result.',
    },
  ],
  accessibility: [
    'A pressable card is one link or button — keep other buttons out of it, or it has nested targets.',
    'Title is a heading; set the level with render={<h2 />} to fit the page outline.',
  ],
  motion:
    'Pressable: press dips to .97 in 70 ms and releases on snappy; hover steps the paper up (colour, 260 ms).',
  tokens: ['surface', 'surface-2', 'line', 'radius-md', 'press', 'ease-snappy'],
  related: ['preview-card', 'list-row'],
});
