import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { MarqueeOwnProps } from './marquee.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Marquee',
  slug: 'marquee',
  category: 'data',
  status: 'stable',
  description:
    'A single line too long for its box — a track title on a player — that rests, then travels so the whole of it can be read.',
  whenToUse: [
    'A title the user is watching and wants in full: the playing track, a live station name.',
  ],
  whenNotToUse: [
    'Lists of titles — truncate with an ellipsis; twenty moving rows is noise.',
    'Anything the user must read to act (errors, prices) — wrap the text instead.',
  ],
  import: "import { Marquee } from '@hanji/react';",
  parts: [
    {
      name: 'Marquee',
      element: 'div',
      slot: 'Marquee',
      className: 'hj-marquee',
      description:
        'Measures itself; moves only when the text overflows. A second copy (aria-hidden) makes the loop seamless.',
      props: props<MarqueeOwnProps>({
        speed: { type: 'number', default: '45', description: 'px per second.' },
        gap: { type: 'number', default: '40', description: 'px between the text and its repeat.' },
        dwell: { type: 'number', default: '1200', description: 'ms at rest before each pass.' },
        pauseOnHover: {
          type: 'boolean',
          default: 'true',
          description: 'Stop while hovered or focused so it can be read.',
        },
      }),
      dataAttributes: {
        'data-overflowing': 'The text is wider than the box.',
        'data-running': 'Moving (overflowing and motion allowed).',
      },
      cssVars: {
        '--hj-marquee-gap': 'Set from the gap prop.',
        '--hj-marquee-fade': 'Width of the edge fade while moving. Default 14px.',
      },
    },
  ],
  examples: [
    {
      file: 'now-playing',
      title: 'Now playing',
      description: 'A long title that travels and a short one that stays still.',
    },
    {
      file: 'resize',
      title: 'Only when it overflows',
      description: 'Drag the width: the same title starts and stops moving.',
    },
  ],
  accessibility: [
    'The text is read once; the repeat is aria-hidden.',
    'Pauses on hover and focus (WCAG 2.2.2), and never moves under reduced motion — it shows an ellipsis.',
  ],
  motion:
    'A Web Animation on transform: 1.2 s at rest, then 45 px/s with a 40 px gap, looping. Paused off-screen (the decoration releases its clock) and absent under reduced motion.',
  tokens: ['font-sans'],
  related: ['list'],
});
