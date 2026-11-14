import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { LinkOwnProps } from './link.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Link',
  slug: 'link',
  category: 'atoms',
  status: 'new',
  description: 'A styled anchor that goes somewhere, in running text or in chrome.',
  whenToUse: [
    'Navigation: to another page, a help article, a profile.',
    'Inline references in sentences (“Read the terms of service”).',
  ],
  whenNotToUse: ['An action that changes something — use Button (or Button variant="quiet").'],
  import: "import { Link } from '@hanji/react';",
  parts: [
    {
      name: 'Link',
      element: 'a',
      slot: 'Link',
      className: 'hj-link',
      description:
        'An anchor with a reading-grade underline. Compose with a router link through render.',
      props: props<LinkOwnProps>({
        tone: {
          type: "'accent' | 'fg' | 'dim'",
          default: "'accent'",
          description: 'accent in prose, fg in chrome, dim for footnotes.',
        },
        underline: {
          type: "'always' | 'hover'",
          default: "'always'",
          description: 'always in running text; hover in chrome.',
        },
        external: {
          type: 'boolean',
          default: 'false',
          description:
            'New tab: target=_blank, rel=noopener noreferrer, ↗ glyph and a hidden note.',
        },
        externalLabel: {
          type: 'string',
          default: "'opens in a new tab'",
          description: 'Hidden note read after external links.',
        },
        render: {
          type: 'ReactElement | (props, state) => ReactElement',
          description: 'Render a router link or another element.',
        },
      }),
      dataAttributes: {
        'data-tone': 'accent | fg | dim',
        'data-underline': 'always | hover',
        'data-external': 'Present for external links.',
      },
      cssVars: {
        '--hj-link-color': 'Ink, overriding the tone.',
        '--hj-link-underline-offset': 'Underline offset. Default .22em.',
      },
    },
  ],
  examples: [
    { file: 'prose', title: 'In prose', description: 'An inline link and an external help link.' },
    { file: 'chrome', title: 'In chrome', description: 'Quiet links that underline on hover.' },
  ],
  accessibility: [
    'A real <a href> — keyboard and context menus work as everywhere else.',
    'External links say so to screen readers with a visually hidden note.',
    'Never use a link for an action; buttons and links announce differently.',
  ],
  motion:
    'The underline darkens on hover in 180 ms; the ↗ nudges 1.5px toward where it goes on snappy (still under reduced motion).',
  tokens: ['accent', 'fg', 'fg-dim', 'dur-fast', 'ease-out', 'press-opacity'],
  related: ['button', 'text'],
});
